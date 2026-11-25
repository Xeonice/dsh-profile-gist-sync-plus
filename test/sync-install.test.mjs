/** One confirmation for the exact Gist snapshot and plugin sources reviewed. */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  backupDocument, callRoute, createReport, makeProfile, serveHandler,
  stubGithub, tempDir, TEST_GIST_ID as ID, TEST_TOKEN, useProfile,
} from './harness.mjs'

const { check, finish } = createReport('preview and install')
const home = tempDir('dpg-sync-install-')
// The runner gives this file its own process. Even a mistaken token lookup or
// attempt to start a package manager must not find the user's gh, token or home.
useProfile(join(home, 'profiles', 'test'), home)
process.env.HOME = process.env.USERPROFILE = home
process.env.PATH = join(home, 'no-executables')
for (const name of ['GITHUB_TOKEN', 'DSH_GITHUB_TOKEN', 'GH_TOKEN']) delete process.env[name]
const { BASE_PATH, registerRoutes } = await import('../lib/routes.js')
check('routes use the fork namespace', BASE_PATH === '/dsh-profile-gist-sync-plus', BASE_PATH)

const CLOUD = 'cloud-plugin'
const SPEC = `${CLOUD}@1.2.3`
const NOTE = 'data/note.json'
const reviewed = '{"revision":"reviewed"}'
const applied = { changed: true, application: 'applied' }

// An upstream v0.2 document: no fork-specific metadata or installation list.
function legacyBackup(dependencies = { [CLOUD]: '1.2.3' }, bundles = Object.keys(dependencies)) {
  const doc = backupDocument('other-machine', [{ path: NOTE, lines: [reviewed] }])
  Object.assign(doc.files[0].json, { dependencies, dsh: { profile: { bundles } } })
  return doc
}

// Bind the manager to a particular throwaway manifest. Like the Host, an
// applied install records its dependency. It never downloads or runs anything.
function managerWith(present = [], install = () => applied) {
  return profile => {
    const installed = new Set(present)
    const calls = []
    const file = join(profile, 'package.json')
    return {
      calls,
      listPlugins: async () => [],
      listBundles: () => [...installed].map(name => ({ name, availability: 'profile', installed: true, enabled: true })),
      async installBundle(spec, options) {
        const [name, version] = spec.split('@') // fixture specs use unscoped npm names
        const manifest = JSON.parse(readFileSync(file, 'utf8'))
        calls.push({ spec, options, priorSpec: manifest.dependencies?.[name] })
        const result = await install(spec)
        if (result.application === 'applied' || result.application === 'restart-required') {
          installed.add(name)
          manifest.dependencies = { ...manifest.dependencies, [name]: version }
          writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`)
        }
        return { stage: 'install', target: spec, ...result }
      },
    }
  }
}

// Compare the whole fixture, including hidden settings, undo and node_modules,
// not just the manifest. A preview must not create even an empty directory.
function snapshot(dir) {
  return Object.fromEntries(readdirSync(dir, { withFileTypes: true }).map(entry => {
    const file = join(dir, entry.name)
    return [entry.name, entry.isDirectory() ? snapshot(file) : readFileSync(file, 'base64')]
  }))
}

function expectStatus(response, status) {
  assert.equal(response.status, status, `${response.status}: ${JSON.stringify(response.payload).slice(0, 240)}`)
  return response.payload
}

let serial = 0
async function scenario(label, {
  document = legacyBackup(), manager: makeManager = managerWith(), local = { dependencies: {}, bundles: [] }, onRequest,
}, run) {
  const profile = makeProfile(join(home, 'profiles', `case-${++serial}`), local)
  useProfile(profile, home)
  const manager = makeManager?.(profile)
  let handler
  const webServer = { register(route) { handler = route.handler; return () => {} } }
  const dispose = registerRoutes({ get: name => ({ webServer, pluginManager: manager })[name] })
  const served = await serveHandler((req, res) => { onRequest?.(req, res); handler(req, res) })
  const repo = stubGithub({ gistId: ID, document })
  const api = (path, body) => callRoute(served.base, `${BASE_PATH}/api/${path}`, body)
  const post = (path, body) => api(`sync/${path}`, body)
  const preview = async () => expectStatus(await post('preview', { id: ID, token: TEST_TOKEN }), 200)
  const confirm = (planId, extra) => post('install', { planId, confirm: true, ...extra })
  try {
    await run({ profile, document, manager, repo, api, post, preview, confirm })
    check(label, true)
  } catch (error) {
    check(label, false, error.stack)
  } finally {
    repo.restore()
    served.close()
    dispose()
  }
}

const requested = manager => manager.calls.map(call => call.spec)
const reads = repo => repo.calls.map(({ method, path }) => `${method} ${path}`)
const singleRead = [`GET /gists/${ID}`]

await scenario('v0.2 preview is read-only; one confirmation restores and installs exactly what was reviewed', {
  document: legacyBackup({ [CLOUD]: '1.2.3', 'present-plugin': '2.0.0' }),
  local: { dependencies: { 'target-only': '4.0.0' }, bundles: ['target-only'] },
  manager: managerWith(['present-plugin'], () => ({ changed: true, application: 'restart-required' })),
}, async ({ profile, document, manager, repo, preview, confirm }) => {
  const before = snapshot(profile)
  const plan = await preview()
  assert.equal(typeof plan.planId, 'string')
  assert.ok(plan.planId.length > 0)
  assert.equal(plan.ref.id, ID)
  assert.ok(plan.preview.files.some(file => file.path === NOTE && file.status === 'overwrite'))
  assert.equal(plan.plugins.available, true)
  assert.deepEqual(plan.plugins.missing.map(row => row.installSpec), [SPEC])
  assert.deepEqual(snapshot(profile), before)
  assert.deepEqual(requested(manager), [])
  assert.deepEqual(reads(repo), singleRead)

  // Someone edits the remote backing document after the user sees the plan.
  document.files[0].json.dependencies[CLOUD] = '9.9.9'
  document.files.find(file => file.path === NOTE).lines = ['{"revision":"later"}']
  const result = expectStatus(await confirm(plan.planId), 200)
  assert.ok(result.report.files.some(file => file.path === NOTE))
  assert.equal(readFileSync(join(profile, NOTE), 'utf8'), reviewed)
  const restored = JSON.parse(readFileSync(join(profile, 'package.json'), 'utf8'))
  assert.equal(restored.dependencies[CLOUD], '1.2.3')
  assert.equal(restored.dependencies['target-only'], '4.0.0')
  assert.deepEqual(requested(manager), [SPEC], 'neither the present plugin nor the unrelated local gap is installed')
  assert.equal(manager.calls[0].priorSpec, undefined, 'only the installer introduces the new dependency')
  const row = result.plugins.results.find(row => row.name === CLOUD)
  assert.equal(row?.outcome, 'installed')
  assert.deepEqual(row.pendingBuilds, [])
  assert.equal(result.complete, true)
  assert.equal(result.restart, true, 'installation complete does not mean already active')
  assert.deepEqual(reads(repo), singleRead)

  // Detect a replayed *restore* even if the updated inventory hides a second install.
  writeFileSync(join(profile, NOTE), '{"after":"confirmation"}')
  const after = snapshot(profile)
  expectStatus(await confirm(plan.planId), 409)
  assert.deepEqual(snapshot(profile), after)
  assert.deepEqual(requested(manager), [SPEC])
  assert.deepEqual(reads(repo), singleRead)
})

await scenario('missing confirmation, unknown and expired plans cannot write or install', {}, async ({ profile, manager, repo, post, preview, confirm }) => {
  const before = snapshot(profile)
  const { planId } = await preview()
  expectStatus(await post('install', { planId }), 400)
  expectStatus(await post('install', { planId, confirm: 'true' }), 400)
  expectStatus(await confirm('not-a-plan'), 409)
  // Use a fresh plan so an earlier denial cannot be mistaken for expiry.
  const fresh = await preview()
  const now = Date.now
  try {
    const afterExpiry = now() + 5 * 60_000 + 1_000
    Date.now = () => afterExpiry
    expectStatus(await confirm(fresh.planId), 409)
  } finally {
    Date.now = now
  }
  assert.deepEqual(snapshot(profile), before)
  assert.deepEqual(requested(manager), [])
  assert.deepEqual(reads(repo), [...singleRead, ...singleRead])
})

// Hold the manager open until both confirmation bodies reached the HTTP handler.
// Otherwise an unguarded first call may finish before a 'parallel' second call starts.
{
  let release
  const gate = new Promise(resolve => { release = resolve })
  let requests = 0
  const manager = managerWith([], async () => { await gate; return applied })
  await scenario('overlapping submissions consume one plan and call installBundle once', {
    manager,
    onRequest(req, res) {
      if (!req.url.endsWith('/api/sync/install') || ++requests !== 2) return
      req.once('end', () => setImmediate(release))
      res.once('finish', release) // a busy route may refuse before consuming the body
    },
  }, async ({ preview, confirm, repo, manager }) => {
    const { planId } = await preview()
    const both = await Promise.all([confirm(planId), confirm(planId)])
    assert.deepEqual(both.map(response => response.status).sort(), [200, 409])
    assert.equal(both.find(response => response.status === 200).payload.complete, true)
    assert.deepEqual(requested(manager), [SPEC])
    assert.deepEqual(reads(repo), singleRead)
  })
}

await scenario('no usable manager means no confirmable plan or restore', { manager: null }, async ({ profile, preview, confirm, repo }) => {
  const before = snapshot(profile)
  const plan = await preview()
  assert.equal(plan.plugins.available, false)
  assert.equal(plan.planId, null)
  const refusal = await confirm(plan.planId)
  assert.ok(refusal.status >= 400 && refusal.status < 500)
  assert.deepEqual(snapshot(profile), before)
  assert.deepEqual(reads(repo), singleRead)
})

const unresolved = ['local-plugin', 'file-plugin', 'bundle-only']
await scenario('foreign local paths and a bundle name without a source are reported, never downloaded', {
  document: legacyBackup({ 'local-plugin': 'link:D:/sender-only/plugin', 'file-plugin': 'file:../other-checkout' }, unresolved),
  local: { dependencies: { 'local-plugin': '4.5.6' }, bundles: [] },
}, async ({ profile, preview, confirm, manager }) => {
  const plan = await preview()
  for (const name of unresolved) {
    const row = plan.plugins.missing.find(entry => entry.name === name)
    assert.equal(row?.resolvable, false, name)
    assert.equal(row.installSpec, null, name)
  }
  const result = expectStatus(await confirm(plan.planId), 200)
  assert.equal(result.complete, false)
  assert.equal(readFileSync(join(profile, NOTE), 'utf8'), reviewed)
  assert.deepEqual(JSON.parse(readFileSync(join(profile, 'package.json'), 'utf8')).dependencies, { 'local-plugin': '4.5.6' })
  for (const name of unresolved) {
    const row = result.plugins.results.find(entry => entry.name === name)
    assert.equal(row?.outcome, 'skipped', name)
    assert.deepEqual(row.pendingBuilds, [])
  }
  assert.deepEqual(requested(manager), [])
})

for (const [label, change] of [
  ['failed install', { changed: false, application: 'failed', error: { code: 'operation-error', diagnostic: 'fake registry offline' } }],
  ['pending build approval', { ...applied, pendingBuilds: ['native-helper'] }],
]) {
  await scenario(`${label}: a restored configuration is not a fully successful install`, {
    manager: managerWith([], () => change),
  }, async ({ profile, preview, confirm, manager }) => {
    const { planId } = await preview()
    const result = expectStatus(await confirm(planId), 200)
    assert.equal(readFileSync(join(profile, NOTE), 'utf8'), reviewed)
    assert.equal(result.complete, false)
    const row = result.plugins.results.find(entry => entry.name === CLOUD)
    assert.deepEqual(row?.pendingBuilds, change.pendingBuilds ?? [])
    if (change.error) assert.equal(row.outcome, 'failed')
    assert.deepEqual(requested(manager), [SPEC])
    assert.deepEqual(manager.calls[0].options?.approvedBuilds ?? [], [])
  })
}

// The installer must see the receiving machine's policy, not the sender's,
// even momentarily. Observe it from inside the fake manager as well as after.
{
  const document = legacyBackup()
  Object.assign(document.files[0].json, { scripts: { install: 'sender-marker' }, version: '7.0.0' })
  document.files.push(
    { path: '.npmrc', lines: ['registry=https://sender.invalid/', ''] },
    { path: 'pnpm-workspace.yaml', lines: ['packages: [sender-workspace]', ''] },
  )
  function policy(profile) {
    const { scripts, version } = JSON.parse(readFileSync(join(profile, 'package.json'), 'utf8'))
    return { scripts, version, npmrc: readFileSync(join(profile, '.npmrc'), 'utf8'), workspace: readFileSync(join(profile, 'pnpm-workspace.yaml'), 'utf8') }
  }
  const observed = []
  await scenario('restore keeps package-manager inputs and manifest scripts/version local', {
    document,
    manager: profile => managerWith([], () => { observed.push(policy(profile)); return applied })(profile),
  }, async ({ profile, preview, confirm }) => {
    const manifest = join(profile, 'package.json')
    const local = JSON.parse(readFileSync(manifest, 'utf8'))
    Object.assign(local, { scripts: { test: 'receiver-marker' }, version: '1.0.0' })
    writeFileSync(manifest, `${JSON.stringify(local, null, 2)}\n`)
    const expected = policy(profile)
    const plan = await preview()
    for (const name of ['.npmrc', 'pnpm-workspace.yaml']) {
      assert.ok(!plan.preview.files.some(file => file.path === name))
      assert.ok(plan.preview.dropped.some(file => file.path === name))
    }
    const result = expectStatus(await confirm(plan.planId), 200)
    assert.equal(result.complete, true)
    assert.deepEqual(observed, [expected])
    assert.deepEqual(policy(profile), expected)
  })
}

for (const [path, before, after] of [[NOTE, 'world', 'earth'], ['package.json', 'dsh-profile-test', 'dsh-profile-edit']]) {
  await scenario(`editing ${path} after preview invalidates confirmation before any writes or install`, {}, async ({ profile, manager, repo, preview, confirm }) => {
    const { planId } = await preview()
    const file = join(profile, path)
    const original = readFileSync(file, 'utf8')
    assert.ok(original.includes(before))
    writeFileSync(file, original.replace(before, after)) // same byte length, still an overwrite/merge
    const edited = snapshot(profile)
    expectStatus(await confirm(planId), 409)
    assert.deepEqual(snapshot(profile), edited)
    assert.deepEqual(requested(manager), [])
    assert.deepEqual(reads(repo), singleRead)
  })
}

await scenario('confirmation cannot substitute a client-supplied install target', {}, async ({ preview, confirm, manager, repo, profile }) => {
  const { planId } = await preview()
  const before = snapshot(profile)
  const alternate = 'unreviewed-target@7.0.0'
  const response = await confirm(planId, { spec: alternate, plugins: [{ name: CLOUD, installSpec: alternate }] })
  if (response.status === 200) assert.deepEqual(requested(manager), [SPEC]) // unknown fields ignored
  else {
    assert.ok(response.status >= 400 && response.status < 500)
    assert.deepEqual(requested(manager), []) // strict validation is also safe
    assert.deepEqual(snapshot(profile), before)
  }
  assert.deepEqual(reads(repo), singleRead)
})

await scenario('token verification rejects a GitHub 401 and a response without an account login', {}, async ({ api, repo }) => {
  const offlineFetch = globalThis.fetch // already stubbed by the fixture, including all Gist traffic
  const verify = () => api('gist/token', { token: TEST_TOKEN })
  try {
    for (const [status, account] of [[401, { message: 'Bad credentials' }], [200, { id: 123 }]]) {
      let checks = 0
      globalThis.fetch = (input, init) => {
        const url = typeof input === 'string' ? input : input?.url ?? String(input)
        if (url !== 'https://api.github.com/user') return offlineFetch(input, init)
        checks++
        return Response.json(account, { status })
      }
      const error = expectStatus(await verify(), 401)
      assert.equal(error.code, 'auth')
      assert.equal(error.login, undefined)
      assert.equal(checks, 1)
    }
  } finally {
    globalThis.fetch = offlineFetch
  }
  // Control: a verified login succeeds; no Gist download was needed for any token check.
  assert.equal(expectStatus(await verify(), 200).login, 'someone')
  assert.deepEqual(reads(repo), ['GET /user'])
})

process.exitCode = finish()
