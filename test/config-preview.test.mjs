/** Cloud configuration-only plans: the real route handler, no sockets or package manager. */
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PassThrough, Readable } from 'node:stream'
import {
  backupDocument, createReport, makeProfile, stubGithub, tempDir, TEST_GIST_ID as ID, TEST_TOKEN, useProfile,
} from './harness.mjs'

const { check, finish } = createReport('configuration-only plans')
const home = tempDir('dpg-config-preview-')
useProfile(join(home, 'profiles', 'test'), home)
process.env.HOME = process.env.USERPROFILE = home
process.env.PATH = join(home, 'no-executables')
for (const key of ['DSH_GITHUB_TOKEN', 'GITHUB_TOKEN', 'GH_TOKEN']) delete process.env[key]
const realFetch = globalThis.fetch
globalThis.fetch = async () => { throw new Error('unexpected network access from an isolated test') }
const { BASE_PATH, registerRoutes } = await import('../lib/routes.js')
const { WORK_DIR } = await import('../lib/backup.js')
const { readSettings } = await import('../lib/store.js')
const source = { id: ID, token: TEST_TOKEN }
const other = 'another-upload-target'
const npmrc = 'registry=https://reviewed.invalid/\n'
const workspace = 'packages: []\n# reviewed policy\n'
const cloudPlugin = 'reviewed-plugin'
const credential = 'data/auths/credentials.sqlite'

// Compare every file, including hidden history, undo state and the dependency tree.
function tree(dir) {
  return Object.fromEntries(readdirSync(dir, { withFileTypes: true }).map(entry => {
    const path = join(dir, entry.name)
    return [entry.name, entry.isDirectory() ? tree(path) : readFileSync(path, 'latin1')]
  }))
}

// Exercise the same prefix handler and admission/body/lock paths as the browser,
// but feed the HTTP stream in process. A PassThrough lets a test hold a write open.
function request(handler, path, body, headers) {
  const req = body instanceof Readable ? body : Readable.from(body === undefined ? [] : [JSON.stringify(body)])
  Object.assign(req, { url: `${BASE_PATH}/api/${path}`, method: body === undefined ? 'GET' : 'POST', headers: { host: 'localhost', ...headers } })
  return new Promise(resolve => {
    let status
    handler(req, { writeHead(code) { status = code }, end(text) { resolve({ status, payload: JSON.parse(text) }) } })
  })
}
async function expect(response, status, code) {
  const result = await response
  assert.equal(result.status, status, JSON.stringify(result.payload).slice(0, 260))
  if (code) assert.equal(result.payload.code, code)
  return result.payload
}

let serial = 0
async function scenario(label, test) {
  const profile = makeProfile(join(home, 'profiles', `case-${++serial}`))
  useProfile(profile, home)
  const document = backupDocument('sender', [
    { path: '.npmrc', lines: npmrc.split('\n') },
    { path: 'pnpm-workspace.yaml', lines: workspace.split('\n') },
    { path: 'helper.cjs', lines: ['// restored as text only', ''] },
    { path: credential, lines: ['fixture that the validator must omit'] },
  ])
  Object.assign(document.files[0].json, {
    dependencies: { [cloudPlugin]: '1.2.3' }, dsh: { profile: { bundles: [cloudPlugin] } }, scripts: { test: 'reviewed-marker' },
  })
  const repo = stubGithub({ gistId: ID, document })
  let handler
  const calls = []
  const services = {
    webServer: { register(route) { handler = route.handler; return () => { handler = null } } },
    connection: { requestRejection: req => req.headers.denied ? 401 : undefined },
    pluginManager: {
      listPlugins() { calls.push('listPlugins'); return [] },
      listBundles() { calls.push('listBundles'); return [{ name: cloudPlugin, availability: 'profile', installed: true }] },
      installBundle() { calls.push('installBundle'); throw new Error('no installations in this fixture') },
    },
  }
  const ctx = { get(name) { if (name === 'pluginManager') calls.push('lookup'); return services[name] } }
  let dispose = registerRoutes(ctx)
  const remount = () => { dispose(); dispose = registerRoutes(ctx) }
  const api = (path, body, headers) => request(handler, path, body, headers)
  const preview = (mode = 'config', from = source) => expect(api(`${mode}/preview`, from), 200)
  const confirm = (planId, mode = 'config') => api(mode === 'config' ? 'config/restore' : 'sync/install', { planId, confirm: true })
  try {
    await test({ profile, document, repo, services, calls, remount, api, preview, confirm })
    check(label, true)
  } catch (error) {
    check(label, false, error.stack)
  } finally {
    dispose()
    repo.restore()
  }
}

await scenario('read-only full-scope preview and confirmation use one exact Gist snapshot and no plugin manager', async ({ profile, document, repo, services, calls, preview, confirm }) => {
  services.pluginManager = undefined // still confirmable, unlike the combined flow
  const before = tree(profile)
  const plan = await preview()
  assert.deepEqual(Object.keys(plan).sort(), ['planId', 'preview', 'ref'])
  assert.ok(typeof plan.planId === 'string' && plan.planId)
  assert.equal(plan.ref.id, ID)
  assert.deepEqual(Object.fromEntries(plan.preview.files.map(f => [f.path, f.status])), {
    'package.json': 'merge', '.npmrc': 'overwrite', 'pnpm-workspace.yaml': 'overwrite', 'helper.cjs': 'add',
  })
  assert.deepEqual(plan.preview.manifest.dependenciesAdded, [cloudPlugin])
  assert.deepEqual(plan.preview.dropped, [{ path: credential, code: 'credential' }])
  assert.deepEqual(tree(profile), before)

  document.files[0].json.dependencies[cloudPlugin] = '9.9.9'
  document.files.find(f => f.path === '.npmrc').lines = ['changed on GitHub after preview']
  const result = await expect(confirm(plan.planId), 200)
  assert.deepEqual(Object.keys(result).sort(), ['ref', 'report', 'restart', 'warnings'])
  assert.deepEqual(result.ref, plan.ref)
  for (const field of ['files', 'counts', 'manifest', 'dropped', 'droppedEntries']) assert.deepEqual(result.report[field], plan.preview[field], field)
  assert.deepEqual(result.warnings, [])
  assert.equal(result.restart, true)
  assert.equal(readFileSync(join(profile, '.npmrc'), 'utf8'), npmrc)
  assert.equal(readFileSync(join(profile, 'pnpm-workspace.yaml'), 'utf8'), workspace)
  assert.equal(readFileSync(join(profile, 'helper.cjs'), 'utf8'), '// restored as text only\n')
  const manifest = JSON.parse(readFileSync(join(profile, 'package.json'), 'utf8'))
  assert.deepEqual(manifest.dependencies, { 'some-plugin': '1.2.3', [cloudPlugin]: '1.2.3' })
  assert.deepEqual(manifest.scripts, { test: 'reviewed-marker' })
  assert.deepEqual(manifest.dsh.profile.bundles, ['@deepseek-ai/dsh-base', cloudPlugin])
  const after = tree(profile)
  assert.deepEqual(after.node_modules, before.node_modules)
  assert.equal(after.data.auths['credentials.sqlite'], before.data.auths['credentials.sqlite'])
  assert.ok(existsSync(join(result.report.undoDir, 'manifest.json')))
  assert.ok(!JSON.stringify([plan, result, after]).includes(TEST_TOKEN))
  await expect(confirm(plan.planId), 409, 'stale-plan')
  assert.deepEqual(tree(profile), after, 'no second restore, undo point or history record')
  assert.deepEqual(calls, [])
  assert.deepEqual(repo.calls.map(({ method, path, headers }) => [method, path, headers.authorization]), [['GET', `/gists/${ID}`, `Bearer ${TEST_TOKEN}`]])
})

await scenario('each mode refuses the other mode’s ID and shows only its own file policy', async ({ profile, repo, calls, preview, confirm }) => {
  const before = tree(profile)
  const full = await preview()
  const combined = await preview('sync')
  assert.ok(combined.planId && combined.planId !== full.planId)
  for (const path of ['.npmrc', 'pnpm-workspace.yaml', 'helper.cjs']) {
    assert.ok(full.preview.files.some(file => file.path === path))
    assert.ok(combined.preview.dropped.some(file => file.path === path && file.code === 'local-policy'))
    assert.ok(!combined.preview.files.some(file => file.path === path))
  }
  const afterPreview = [...calls]
  await expect(confirm(combined.planId), 409, 'stale-plan')
  await expect(confirm(full.planId, 'sync'), 409, 'stale-plan')
  assert.deepEqual(tree(profile), before)
  await expect(confirm(full.planId), 200) // the wrong endpoint did not spend the right plan
  assert.deepEqual(calls, afterPreview)
  assert.equal(repo.calls.length, 2)
})

await scenario('admission, invalid sources and missing explicit consent cannot write or consume a valid plan', async ({ profile, repo, document, api, preview, confirm, calls }) => {
  const before = tree(profile)
  await expect(api('config/preview', source, { denied: 'yes' }), 401, 'auth')
  await expect(api('config/preview', {}), 400, 'no-cloud')
  await expect(api('config/preview', { ...source, id: 'not a gist!' }), 400, 'invalid')
  assert.equal(repo.calls.length, 0, 'admission and ID checks precede downloading')
  const { planId } = await preview()
  await expect(api('config/restore', { planId, confirm: true }, { denied: 'yes' }), 401, 'auth')
  await expect(api('config/restore', { planId, confirm: true }, { 'sec-fetch-site': 'cross-site' }), 403, 'auth')
  for (const value of [undefined, false, 'true']) await expect(api('config/restore', { planId, confirm: value }), 400, 'invalid')
  await expect(confirm('unknown-plan'), 409, 'stale-plan')
  assert.equal(repo.calls.length, 1)
  assert.deepEqual(tree(profile), before)
  await expect(confirm(planId), 200)
  const after = tree(profile)
  document.files = []
  const invalid = await expect(api('config/preview', source), 400, 'invalid')
  assert.equal(invalid.planId, undefined)
  assert.deepEqual(tree(profile), after)
  assert.deepEqual(calls, [])
})

await scenario('a new same-mode preview supersedes the old ID; expiry is enforced at exactly five minutes', async ({ profile, preview, confirm, repo }) => {
  const before = tree(profile)
  const clock = Date.now
  let time = clock()
  Date.now = () => time
  try {
    const old = await preview()
    const fresh = await preview()
    await expect(confirm(old.planId), 409, 'stale-plan')
    time += 5 * 60_000
    await expect(confirm(fresh.planId), 409, 'stale-plan')
    time -= 1
    await expect(confirm(fresh.planId), 409, 'stale-plan') // failed attempt already consumed
  } finally { Date.now = clock }
  assert.deepEqual(tree(profile), before)
  assert.equal(repo.calls.length, 2)
})

for (const path of ['.npmrc', 'helper.cjs']) {
  await scenario(`a changed policy file or newly present target invalidates the reviewed bytes: ${path}`, async ({ profile, preview, confirm, repo, calls }) => {
    const { planId } = await preview()
    const target = join(profile, path)
    const bytes = existsSync(target) ? readFileSync(target, 'utf8') : null
    writeFileSync(target, bytes === null ? 'appeared since preview' : bytes.replace('registry', 'Registry')) // same length for an existing target
    const edited = tree(profile)
    await expect(confirm(planId), 409, 'stale-plan')
    assert.deepEqual(tree(profile), edited)
    if (bytes !== null) writeFileSync(target, bytes)
    await expect(confirm(planId), 409, 'stale-plan')
    assert.deepEqual(calls, [])
    assert.equal(repo.calls.length, 1)
  })
}

await scenario('both confirmations use the existing write lock and release it on failures and success', async ({ profile, api, preview, confirm, calls }) => {
  const { planId } = await preview()
  const before = tree(profile)
  const heldCombined = new PassThrough()
  const first = api('sync/install', heldCombined)
  await expect(confirm(planId), 409, 'busy')
  heldCombined.end('{}')
  await expect(first, 400, 'invalid')
  const heldConfig = new PassThrough()
  const second = api('config/restore', heldConfig)
  await expect(confirm(planId, 'sync'), 409, 'busy')
  await expect(confirm(planId), 409, 'busy')
  await expect(api('undo', {}), 409, 'busy')
  assert.deepEqual(tree(profile), before)
  heldConfig.end(JSON.stringify({ planId, confirm: true }))
  await expect(second, 200)
  await expect(confirm(planId), 409, 'stale-plan')
  await expect(api('undo', {}), 200)
  assert.deepEqual(calls, [])
})

await scenario('unload invalidates all slots and prevents an already admitted, unread confirmation from writing', async ({ profile, remount, api, document, preview, confirm }) => {
  const before = tree(profile)
  const full = await preview()
  const combined = await preview('sync')
  const local = await expect(api('preview', { reviewed: true, backup: document }), 200)
  const body = new PassThrough()
  const inFlight = api('config/restore', body)
  remount()
  body.end(JSON.stringify({ planId: full.planId, confirm: true }))
  await expect(inFlight, 409, 'stale-plan')
  await expect(confirm(full.planId), 409, 'stale-plan')
  await expect(confirm(combined.planId, 'sync'), 409, 'stale-plan')
  await expect(api('restore', { planId: local.planId, confirm: true }), 409, 'stale-plan')
  assert.deepEqual(tree(profile), before)
})

await scenario('a failed restore cannot update history, run the installer or reuse its ID', async ({ profile, calls, repo, preview, confirm }) => {
  const { planId } = await preview()
  writeFileSync(join(profile, WORK_DIR), 'fixture: cannot make an undo directory here')
  const blocked = tree(profile)
  await expect(confirm(planId), 500, 'other')
  await expect(confirm(planId), 409, 'stale-plan')
  assert.deepEqual(tree(profile), blocked)
  assert.deepEqual(calls, [])
  assert.equal(repo.calls.length, 1)
})

await scenario('failed history persistence returns a warning and a usable undo point, not a false restore failure', async ({ profile, api, preview, confirm, calls }) => {
  mkdirSync(join(profile, WORK_DIR, 'settings.json'), { recursive: true }) // the history rename must fail
  const oldPolicy = readFileSync(join(profile, '.npmrc'), 'utf8')
  const { planId } = await preview()
  const result = await expect(confirm(planId), 200)
  assert.ok(result.warnings.some(w => /configuration restored.*history could not be saved/i.test(w)))
  assert.equal(result.restart, true)
  assert.equal(readFileSync(join(profile, '.npmrc'), 'utf8'), npmrc)
  assert.ok(existsSync(join(result.report.undoDir, 'manifest.json')))
  await expect(confirm(planId), 409, 'stale-plan')
  await expect(api('undo', {}), 200)
  assert.equal(readFileSync(join(profile, '.npmrc'), 'utf8'), oldPolicy)
  assert.deepEqual(calls, [])
})

for (const mode of ['config', 'sync']) {
  for (const bound of [null, other]) {
    await scenario(`${mode} confirmation records the reviewed Gist but keeps the ${bound ? 'different' : 'unset'} upload target`, async ({ api, preview, confirm, calls }) => {
      if (bound) await expect(api('settings', { gistId: bound }), 200)
      const plan = await preview(mode)
      await expect(confirm(plan.planId, mode), 200)
      const { gistId, lastSync, lastUpload } = readSettings()
      assert.equal(gistId, bound)
      assert.equal(lastSync.gistId, ID)
      assert.equal(lastSync.remoteUpdatedAt, plan.ref.updatedAt)
      assert.equal(lastUpload, null)
      assert.ok(!calls.includes('installBundle'))
    })
  }
}

await scenario('the remembered Gist and host token can preview; an identical restore needs no restart', async ({ api, preview, confirm, repo }) => {
  await expect(api('settings', { gistId: ID }), 200)
  await expect(confirm((await preview()).planId), 200)
  process.env.DSH_GITHUB_TOKEN = TEST_TOKEN
  let plan
  try { plan = await preview('config', {}) } finally { delete process.env.DSH_GITHUB_TOKEN }
  assert.equal(plan.preview.counts.identical, plan.preview.files.length)
  assert.equal((await expect(confirm(plan.planId), 200)).restart, false)
  assert.deepEqual(repo.calls.map(call => call.path), [`/gists/${ID}`, `/gists/${ID}`])
})

await scenario('a changed upload target cannot silently turn a reviewed create or update into a different GitHub write', async ({ profile, api, repo }) => {
  await expect(api('settings', { gistId: other }), 200) // another session changed the destination
  const before = tree(profile)
  for (const expectedTarget of [null, ID]) {
    await expect(api('gist/upload', { token: TEST_TOKEN, expectedTarget }), 409, 'stale-plan')
  }
  assert.deepEqual(repo.calls, [])
  assert.deepEqual(tree(profile), before)
  await expect(api('settings', { gistId: '' }), 200)
  await expect(api('gist/upload', { token: TEST_TOKEN, expectedTarget: null }), 200)
  await expect(api('gist/upload', { token: TEST_TOKEN, expectedTarget: ID }), 200)
  assert.deepEqual(repo.calls.map(({ method, path }) => [method, path]), [['POST', '/gists'], ['PATCH', `/gists/${ID}`]])
})

await scenario('upload receipts name their own Gist and the legacy sync keeps its original binding and response', async ({ api }) => {
  const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version
  assert.equal((await expect(api('status'), 200)).version, version)
  await expect(api('gist/upload', { token: TEST_TOKEN }), 200)
  await expect(api('settings', { gistId: other }), 200)
  assert.equal(readSettings().lastUpload.gistId, ID)
  assert.equal(readSettings().gistId, other)
  const legacy = await expect(api('sync', source), 200)
  assert.deepEqual(Object.keys(legacy).sort(), ['ref', 'report', 'tokenSource', 'undoDir'])
  assert.equal(readSettings().gistId, ID)
})

const installablePairs = inventory => inventory.missing.filter(row => row.resolvable).map(({ name, installSpec }) => ({ name, installSpec }))

await scenario('independent installation validates the reviewed pairs and rejects changed or unavailable inventories without installing', async ({ api, profile, services, calls }) => {
  const pairs = installablePairs(await expect(api('plugins'), 200))
  assert.deepEqual(pairs, [{ name: 'some-plugin', installSpec: 'some-plugin@1.2.3' }])
  const install = expectedPackages => api('plugins/install', { expectedPackages })
  const before = tree(profile)
  for (const invalid of [null, {}, [null], [{ name: 'some-plugin', installSpec: '' }], [...pairs, ...pairs]]) {
    await expect(install(invalid), 400, 'invalid')
  }
  for (const changed of [[], [{ name: 'unreviewed', installSpec: 'unreviewed@1' }], [{ ...pairs[0], installSpec: 'some-plugin@2' }]]) {
    await expect(install(changed), 409, 'stale-plan')
  }
  services.pluginManager = undefined
  await expect(install(pairs), 409, 'stale-plan')
  assert.deepEqual(tree(profile), before)
  assert.ok(!calls.includes('installBundle'))
})

await scenario('matching local packages use actual specs and no build grants; old callers still work', async ({ api, services }) => {
  const pairs = installablePairs(await expect(api('plugins'), 200))
  const installs = []
  services.pluginManager.installBundle = (spec, options) => { installs.push([spec, options]); return { application: 'applied' } }
  for (const body of [{ expectedPackages: pairs, approvedBuilds: ['not-approved'] }, {}]) {
    const report = await expect(api('plugins/install', body), 200)
    assert.equal(report.outcomeCounts.installed, 1)
  }
  assert.deepEqual(installs, [['some-plugin@1.2.3', undefined], ['some-plugin@1.2.3', undefined]])
})

await scenario('a source change or new dependency between comparison and installer recheck cannot expand consent', async ({ api, profile, services, calls }) => {
  const pairs = installablePairs(await expect(api('plugins'), 200))
  let changed = false
  services.pluginManager.listPlugins = () => {
    if (!changed) {
      changed = true // initial inventory already read the original declarations; the installer will see the new ones
      const file = join(profile, 'package.json')
      const manifest = JSON.parse(readFileSync(file, 'utf8'))
      manifest.dependencies = { 'some-plugin': '2.0.0', 'new-gap': '1.0.0' }
      writeFileSync(file, JSON.stringify(manifest))
    }
    return []
  }
  const report = await expect(api('plugins/install', { expectedPackages: pairs }), 200)
  for (const name of ['some-plugin', 'new-gap']) assert.ok(report.results.some(row => row.name === name && row.outcome === 'skipped'))
  assert.ok(!calls.includes('installBundle'))
  await expect(api('plugins/install', { expectedPackages: pairs }), 409, 'stale-plan')
})

await scenario('undo cannot target a replacement snapshot; only the reviewed latest stamp is reverted', async ({ api, profile, preview, confirm }) => {
  const undo = expectedStamp => api('undo', { expectedStamp })
  await expect(undo('a-previous-snapshot'), 409, 'stale-plan')
  await expect(confirm((await preview()).planId), 200)
  const first = (await expect(api('status'), 200)).undo.stamp
  await expect(undo(null), 400, 'invalid')
  assert.equal((await expect(undo(first), 200)).report.stamp, first)
  await expect(confirm((await preview()).planId), 200)
  const latest = (await expect(api('status'), 200)).undo.stamp
  assert.notEqual(first, latest)
  const before = tree(profile)
  await expect(undo(first), 409, 'stale-plan')
  assert.deepEqual(tree(profile), before)
  assert.equal((await expect(undo(latest), 200)).report.stamp, latest)
  await expect(undo(latest), 409, 'stale-plan')
})

await scenario('a reviewed local import applies its validated snapshot once without reading GitHub or changing any Gist binding/history', async ({ api, profile, document, repo, calls }) => {
  const before = tree(profile)
  const plan = await expect(api('preview', { reviewed: true, backup: document }), 200)
  assert.deepEqual(Object.keys(plan).sort(), ['planId', 'preview'])
  assert.equal(typeof plan.planId, 'string')
  assert.deepEqual(plan.preview.dropped, [{ path: credential, code: 'credential' }])
  assert.deepEqual(tree(profile), before)
  const planId = plan.planId
  document.files.find(f => f.path === '.npmrc').lines = ['different file supplied after review']
  await expect(api('restore', { planId }), 400, 'invalid')
  await expect(api('restore', { planId, confirm: true, backup: document }), 400, 'invalid')
  assert.deepEqual(tree(profile), before)
  const saved = await expect(api('restore', { planId, confirm: true }), 200)
  assert.deepEqual(Object.keys(saved), ['report'])
  assert.deepEqual(saved.report.files, plan.preview.files)
  assert.deepEqual(saved.report.dropped, plan.preview.dropped)
  assert.equal(readFileSync(join(profile, '.npmrc'), 'utf8'), npmrc)
  assert.equal(existsSync(join(profile, WORK_DIR, 'settings.json')), false)
  assert.deepEqual(repo.calls, [])
  assert.deepEqual(calls, [])
  await expect(api('restore', { planId, confirm: true }), 409, 'stale-plan')
})

await scenario('local, cloud-config and combined IDs are not interchangeable; the original non-reviewed local API remains usable', async ({ api, profile, document, preview, confirm, repo }) => {
  const before = tree(profile)
  const local = await expect(api('preview', { backup: document, reviewed: true }), 200)
  const full = await preview()
  const combined = await preview('sync')
  for (const id of [full.planId, combined.planId, null]) await expect(api('restore', { planId: id, confirm: true }), 409, 'stale-plan')
  for (const mode of ['config', 'sync']) await expect(confirm(local.planId, mode), 409, 'stale-plan')
  assert.deepEqual(tree(profile), before)
  await expect(api('restore', { planId: local.planId, confirm: true }), 200)
  const legacy = await expect(api('preview', { backup: document }), 200)
  assert.deepEqual(Object.keys(legacy), ['preview'])
  assert.deepEqual(Object.keys(await expect(api('restore', { backup: document, confirm: true }), 200)), ['report'])
  assert.equal(repo.calls.length, 2, 'only the cloud previews contacted the stub')
})

await scenario('local consent expires and detects edits to files the review called identical', async ({ api, profile, document, repo, calls }) => {
  const file = join(profile, 'data/note.json')
  const initial = readFileSync(file, 'utf8')
  document.files.push({ path: 'data/note.json', lines: initial.split('\n') })
  const review = () => expect(api('preview', { backup: document, reviewed: true }), 200)
  const restore = planId => api('restore', { planId, confirm: true })
  const plan = await review()
  assert.equal(plan.preview.files.find(f => f.path === 'data/note.json').status, 'identical')
  writeFileSync(file, initial.replace('world', 'earth'))
  const edited = tree(profile)
  await expect(restore(plan.planId), 409, 'stale-plan')
  const fresh = await review()
  const now = Date.now
  try {
    const later = now() + 5 * 60_000
    Date.now = () => later
    await expect(restore(fresh.planId), 409, 'stale-plan')
  } finally { Date.now = now }
  assert.deepEqual(tree(profile), edited)
  assert.deepEqual(repo.calls, [])
  assert.deepEqual(calls, [])
})

globalThis.fetch = realFetch
process.exitCode = finish()
