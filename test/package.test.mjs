/**
 * The published package, not the working copy.
 *
 * In this repository the plugin is developed in place, so a file the manifest
 * forgets to ship is still present and everything looks fine. A user gets only
 * what `files` allows. This check packs the package the way a registry would,
 * unpacks it somewhere else, and runs the plugin from THAT tree — then asserts
 * the package carries no author-specific state.
 *
 * Without npm or pnpm, stage the same files in a temporary directory.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createReport, makeProfile, tempDir, useProfile, callRoute, serveHandler, TEST_GIST_ID } from './harness.mjs'

const { check, finish } = createReport('package')

const PLUGIN = fileURLToPath(new URL('..', import.meta.url))
const manifest = JSON.parse(readFileSync(join(PLUGIN, 'package.json'), 'utf8'))
const workspace = tempDir('dpg-pack-')
const packDir = join(workspace, 'pack')
const installed = join(workspace, 'installed')
mkdirSync(packDir, { recursive: true })
mkdirSync(installed, { recursive: true })

/**
 * A tarball when this machine has npm or pnpm, otherwise a staged copy built
 * from the manifest's own `files` list. The fallback proves the same thing the
 * tarball does — that nothing the runtime needs is missing from `files` — and
 * keeps the check useful on a machine with no package manager at all.
 */
function pack() {
  const commands = process.platform === 'win32' ? ['npm.cmd', 'pnpm.cmd'] : ['npm', 'pnpm']
  const env = {
    ...process.env, HOME: workspace, USERPROFILE: workspace,
    npm_config_userconfig: join(workspace, 'empty.npmrc'), npm_config_cache: join(workspace, 'cache'),
    npm_config_offline: 'true', npm_config_ignore_scripts: 'true', COREPACK_ENABLE_NETWORK: '0',
  }
  for (const command of commands) {
    try {
      execFileSync(command, ['pack', '--pack-destination', packDir], { cwd: PLUGIN, env, stdio: ['ignore', 'pipe', 'pipe'] })
    } catch (error) {
      if (error.code === 'ENOENT' || (process.platform === 'win32' && error.code === 'EINVAL')) continue
      throw error // An available packager failing must not pass as a staged-copy success.
    }
    const tarballs = readdirSync(packDir).filter(name => name.endsWith('.tgz'))
    if (tarballs.length !== 1) throw new Error(`expected one tarball, got ${tarballs.length}`)
    const tarball = join(packDir, tarballs[0])
    execFileSync('tar', ['-xzf', tarball, '-C', installed, '--strip-components=1'], { stdio: ['ignore', 'pipe', 'pipe'] })
    return { mode: 'tarball', by: command, size: statSync(tarball).size }
  }
  // Without a packager, expand the simple directory/*.ext patterns used by
  // this manifest. package.json is included automatically in a real pack.
  for (const entry of ['package.json', ...(manifest.files ?? [])]) {
    const [directory, pattern] = entry.split('/')
    const paths = pattern?.startsWith('*.')
      ? readdirSync(join(PLUGIN, directory)).filter(name => name.endsWith(pattern.slice(1))).map(name => join(directory, name))
      : [entry]
    for (const relative of paths) {
      const target = join(installed, relative)
      mkdirSync(dirname(target), { recursive: true })
      cpSync(join(PLUGIN, relative), target, { recursive: true })
    }
  }
  return { mode: 'manifest', by: 'the files list', size: null }
}

const packed = pack()
check(packed.mode === 'tarball'
  ? `the package can be packed (${packed.by})`
  : `the manifest's files list only (no package manager; staged ${packed.by})`, true)

const listing = (dir, prefix = '') => readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? listing(join(dir, entry.name), `${prefix}${entry.name}/`) : [`${prefix}${entry.name}`])
const shipped = listing(installed)

// ---- everything the runtime needs is inside the tarball ----------------
check('the host entry is shipped', shipped.includes('index.js'))
check('every lib module is shipped',
  readdirSync(join(PLUGIN, 'lib')).filter(name => name.endsWith('.js')).every(name => shipped.includes(`lib/${name}`)),
  shipped.filter(file => file.startsWith('lib/')).join(', '))
check('the client half is shipped', shipped.includes('client.js'))
check('the bundle patch is shipped', shipped.includes('cordis.patch.yml'))
const packedManifest = JSON.parse(readFileSync(join(installed, 'package.json'), 'utf8'))
check('the packed manifest names the independent fork and version',
  packedManifest.name === 'dsh-profile-gist-sync-plus' && packedManifest.version === '1.4.1'
  && packedManifest.repository.url === 'git+https://github.com/Xeonice/dsh-profile-gist-sync-plus.git')
const patch = readFileSync(join(installed, 'cordis.patch.yml'), 'utf8')
check('the bundle inserts the fork under its own row and module name',
  /^\s*- id: dsh-profile-gist-sync-plus$/m.test(patch) && /^\s*name: dsh-profile-gist-sync-plus$/m.test(patch))
check('both packaged plugin titles and help text use the localized display name',
  [['zh', '多端配置同步'], ['en', 'Multi-device config sync']].every(([lang, title]) => {
    const copy = JSON.parse(readFileSync(join(installed, 'locale', `${lang}.json`), 'utf8'))
    return [copy.meta.title, copy.title, copy.tab].every(value => value === title)
      && copy.meta.description.includes('Gist') && copy.meta.description.includes(title) && copy.newMachineStep1.includes(title)
  }))
check('both icon forms and the README are shipped', ['icon.svg', 'assets/icon-256.png', 'README.md'].every(file => shipped.includes(file)))
check('the tarball does not advertise or include upstream screenshots', !shipped.some(file => /screenshot/i.test(file)))
check('the original author and MIT licence travel with it', packedManifest.author === 'Meta-Virgo' && packedManifest.license === 'MIT'
  && readFileSync(join(installed, 'LICENSE'), 'utf8').includes('Copyright (c) 2026 Meta-Virgo'))
check('the checks travel with it, so a reader can run them', shipped.some(file => file.startsWith('test/')))
if (packed.size !== null) check(`the tarball is below 200 KiB (${packed.size} bytes)`, packed.size < 200 * 1024)
check('no working state leaked into the package',
  !shipped.some(file => file.includes('.dsh-config-sync') || file.includes('node_modules') || file.endsWith('settings.json')),
  shipped.join(', '))

// ---- the packed copy actually runs -------------------------------------
const root = pathToFileURL(installed).href
const { apply } = await import(`${root}/index.js`)
const { BASE_PATH } = await import(`${root}/lib/routes.js`)
const home = tempDir('dpg-pack-profile-')
const profile = makeProfile(join(home, 'profiles', 'test'))
useProfile(profile, home)
let handler = null
const seen = { routes: 0, tools: 0 }
const ctx = {
  get(name) {
    if (name === 'webServer') return { register: (route) => { handler = route.handler; seen.routes += 1; return () => {} } }
    if (name === 'tools') return { register: () => { seen.tools += 1; return () => {} } }
    return undefined
  },
  effect(fn) {
    const dispose = fn()
    if (typeof dispose !== 'function') throw new Error('Invalid effect')
    return dispose
  },
}
let applyError = null
try {
  apply(ctx)
} catch (error) {
  applyError = error
}
check('the packed host half activates', applyError === null, applyError?.message)
check('and registers its route and tool', seen.routes === 1 && seen.tools === 1, `routes=${seen.routes} tools=${seen.tools}`)
const served = await serveHandler(handler)
const status = await callRoute(served.base, `${BASE_PATH}/api/status`)
check('the packed copy answers its own status route',
  status.status === 200 && status.payload.profile === 'test' && status.payload.version === packedManifest.version,
  `${status.status}, profile ${status.payload.profile}, version ${status.payload.version}`)
served.close()

// Resolve and execute ./client from the unpacked package, not the working tree.
const packedClient = spawnSync(process.execPath, ['test/client-registration.test.mjs'], { cwd: installed, encoding: 'utf8' })
check('the packed client registers its own localized Settings section with no API calls',
  packedClient.status === 0, `${packedClient.stdout ?? ''}${packedClient.stderr || packedClient.error || ''}`)

// ---- nothing about the author travels ----------------------------------
// The checks themselves use invented ids, so those are excluded by name: a real
// Gist id or a personal path appearing anywhere in the package is a leak.
const text = shipped.map(file => readFileSync(join(installed, file), 'utf8')).join('\n')
const leaks = (text.match(/[A-Za-z]:\\\\?Users\\\\?[^"'\s]+|gho_[A-Za-z0-9]{20,}|\b[0-9a-f]{32}\b/g) ?? [])
  .filter(value => value !== TEST_GIST_ID)
check('no personal path, token, or Gist id is baked into the package', leaks.length === 0, leaks.slice(0, 3).join(', '))

process.exit(finish())
