/** Run the exported browser artifact through registration. No DOM, renderer or profile. */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { createReport } from './harness.mjs'

const { check, finish } = createReport('client registration')
const root = new URL('../', import.meta.url)
const manifest = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'))
const source = readFileSync(new URL(manifest.exports['./client'], root), 'utf8')
const id = 'dsh-profile-gist-sync-plus'
const modules = []
const imports = new Set()
const requests = []
const browser = {
  __ModuleLoader__: { load: descriptor => modules.push(descriptor) },
  fetch(resource) {
    requests.push(String(resource))
    throw new Error('A client registration must not fetch data')
  },
}
browser.window = browser // window.fetch and globalThis.fetch use the same tripwire.
vm.runInNewContext(source, browser, { filename: 'client.js', timeout: 500 })
assert.deepEqual(modules.map(module => module.id), [manifest.name], 'one factory under the published package name')
const plugin = modules[0].factory(name => {
  imports.add(name)
  assert.equal(name, 'react', 'registration must not load another UI package')
  return Object.freeze({}) // An opaque host module; no React API or fake renderer.
})

const dictionaries = new Map()
const entries = []
const owners = []
let language = 'en'
await plugin.apply({
  effect(register) {
    const dispose = register()
    assert.equal(typeof dispose, 'function', 'the host requires an effect disposer')
    return dispose
  },
  locale: {
    register(namespace, dictionary) {
      dictionaries.set(namespace, dictionary)
      return () => dictionaries.delete(namespace)
    },
    bind: namespace => key => dictionaries.get(namespace)?.[language]?.[key] ?? key,
  },
  slots: {
    // Make each requested owner available, including the old tab and optional icon.
    // Capture the registration, not the output of its component.
    inject(name, activate) {
      owners.push(name)
      try { return activate() } finally { owners.pop() }
    },
    register(options, component) {
      entries.push({ owners: [...owners], options, component })
      return () => {}
    },
  },
})
const inSlot = name => entries.filter(entry => entry.options.name === name)
const sections = inSlot('settings.section')
assert.deepEqual(sections.map(({ owners, options }) => [owners, options.id, options.order]),
  [[['settings.section'], id, 16]], 'one top-level Plus page, owned by its section slot and ordered just after Built-in plugins (15)')
const [section] = sections
check('the sole section provides a component without mounting it', typeof section.component === 'function')
check('Plus contributes no tab to Built-in plugins', inSlot('settings.plugins.tab').length === 0)
const icons = inSlot('settings.section.icon')
assert.equal(icons.length, 1, 'the available navigation-icon slot gets exactly one contribution')
const [icon] = icons
assert.deepEqual(icon.owners, ['settings.section.icon'], 'the icon belongs to the separate decoration slot')
check('the nav icon decorates the same Plus section, not another page',
  icon.options.id === section.options.id && typeof icon.component === 'function', icon.options.id)
const label = () => typeof section.options.label === 'function' ? section.options.label() : section.options.label
for (const [lang, title] of [['zh', '配置同步 Plus'], ['en', 'Config sync Plus']]) {
  language = lang // Ask the same live registration for its label again; do not re-apply the plugin.
  const actual = label()
  check(`the ${lang} section label follows the active locale`, actual === title, actual)
}
check('registration and label lookup make no API request', requests.length === 0, requests.join(', '))
check('registration requests no non-React modules', [...imports].every(name => name === 'react'), [...imports].join(', '))

// Check the dictionaries actually supplied to the host, not text between source-code markers.
const copy = dictionaries.get(id)
assert.ok(copy?.zh && copy?.en, 'Plus registers both dictionaries under its own namespace')
const keys = Object.keys(copy.en)
assert.deepEqual(Object.keys(copy.zh).sort(), keys.sort(), 'both locales cover the same panel copy')
const translated = key => [copy.en[key], copy.zh[key]].every(value => typeof value === 'string' && value.trim().length > 0)
check('every literal panel translation has nonempty copy in both languages',
  [...source.matchAll(/\bt\('([^']+)'\)/g)].every(([, key]) => translated(key)))
check('runtime error and dependency-note lookups have localized copy',
  ['err.', 'note.'].every(prefix => keys.some(key => key.startsWith(prefix) && translated(key))))
check('both locales explain how to recover GitHub access', translated('tokenLabel') && [copy.zh, copy.en].every(dictionary =>
  ['DSH_GITHUB_TOKEN', 'gh auth login'].every(hint => dictionary.tokenHelp?.includes(hint))))
check('both locales label the main actions, copy receipt and distinct review scopes',
  ['backup', 'restore', 'ready', 'copy', 'confirmCombined', 'confirmConfig', 'undoLimit'].every(translated))
process.exit(finish())
