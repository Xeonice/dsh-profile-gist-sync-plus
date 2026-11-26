/** Exercise the registered restore handler over a real, disposable loopback socket. */
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { request } from 'node:http'
import { join } from 'node:path'
import { json } from 'node:stream/consumers'
import {
  backupDocument, createReport, makeProfile, serveHandler, stubGithub, tempDir,
  TEST_GIST_ID as ID, TEST_TOKEN, useProfile,
} from './harness.mjs'

const { check, finish } = createReport('reviewed restore HTTP progress')
const home = tempDir('dpg-progress-http-')
useProfile(join(home, 'profiles', 'test'), home)
process.env.HOME = process.env.USERPROFILE = home
process.env.PATH = join(home, 'no-executables')
for (const key of ['DSH_GITHUB_TOKEN', 'GITHUB_TOKEN', 'GH_TOKEN']) delete process.env[key]
// Only node:http below talks to the ephemeral server. Even a fetch accidentally
// forwarded by the Gist stub cannot reach a real Gist, DSH instance, or registry.
const originalFetch = globalThis.fetch
globalThis.fetch = async () => { throw new Error('unexpected network access from restore fixture') }
const { BASE_PATH, registerRoutes } = await import('../lib/routes.js')
const { WORK_DIR } = await import('../lib/backup.js')

const NDJSON = 'application/x-ndjson'
const NOTE = 'data/note.json'
const REVIEWED = '{"revision":"reviewed"}'
const applied = { changed: true, application: 'applied' }
const modes = {
  combined: ['sync/preview', 'sync/install'], config: ['config/preview', 'config/restore'], local: ['preview', 'restore'],
}
const receiptKeys = {
  combined: ['complete', 'plugins', 'ref', 'report', 'restart', 'warnings'],
  config: ['ref', 'report', 'restart', 'warnings'], local: ['report'],
}
function document(dependencies = {}, bundles = Object.keys(dependencies)) {
  const doc = backupDocument('sender', [
    { path: NOTE, lines: [REVIEWED] },
    { path: 'cordis.yml', lines: ['plugins:', '  some-plugin: {}', ''] }, // identical: files must count writes, not candidates
  ])
  Object.assign(doc.files[0].json, { dependencies, dsh: { profile: { bundles } } })
  return doc
}
function deferred() {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

const mime = res => res.headers['content-type']?.split(';')[0].trim().toLowerCase()
async function jsonReply(pending, status = 200) {
  const res = await pending
  assert.equal(mime(res), 'application/json')
  const payload = await json(res)
  assert.equal(res.statusCode, status, JSON.stringify(payload).slice(0, 300))
  return payload
}
// Decode complete wire lines, never equate a TCP chunk with a JSON record.
// Yield before EOF: taking response.text()/joining chunks here would deadlock the barrier tests.
async function* frames(res) {
  assert.equal(res.statusCode, 200)
  assert.equal(mime(res), NDJSON)
  res.setEncoding('utf8')
  let pending = ''
  for await (const chunk of res) {
    pending += chunk
    let end
    while ((end = pending.indexOf('\n')) !== -1) {
      const line = pending.slice(0, end)
      pending = pending.slice(end + 1)
      yield JSON.parse(line)
    }
  }
  assert.equal(pending, '', 'unterminated NDJSON frame')
}
async function collect(pending, observe) {
  const events = []
  for await (const frame of frames(await pending)) { events.push(frame); await observe?.(frame) }
  return events
}
function terminal(events, type) {
  assert.ok(events.slice(0, -1).every(e => e.type === 'progress'), 'the terminal frame must be unique and last')
  assert.equal(events.at(-1)?.type, type)
  return events.at(-1)
}
async function refusal(pending, status, code) {
  const res = await pending
  const e = mime(res) === NDJSON ? terminal(await collect(res), 'error') : await jsonReply(res, status)
  assert.equal(e.code, code)
  assert.ok(typeof e.error === 'string' && e.error)
}
function receipt(result, mode, plan) {
  assert.deepEqual(Object.keys(result).sort(), receiptKeys[mode], 'old unwrapped receipt')
  assert.deepEqual(result.report.files, plan.preview.files)
  assert.equal(result.report.restored, plan.preview.files.filter(f => f.status !== 'identical').length)
  if (mode !== 'local') assert.deepEqual(result.ref, plan.ref)
}
function streamResult(events, mode, plan, approved = []) {
  const { result } = terminal(events, 'result')
  receipt(result, mode, plan)
  const progress = events.slice(0, -1)
  const stages = progress.map(e => e.stage).filter((s, i, all) => i === 0 || s !== all[i - 1])
  assert.deepEqual(stages, ['check', 'write', ...(approved.length ? ['install'] : []), 'verify'])
  let processed = 0
  for (const e of progress) {
    // Progress is display metadata, not a second channel for specs, logs, paths or backup bytes.
    const allowed = ['type', 'stage']
    if (e.stage === 'install' || e.stage === 'verify') {
      allowed.push('files', 'processed', 'total')
      assert.equal(e.files, result.report.restored)
      if (e.stage === 'install' || e.processed !== undefined) {
        assert.ok(Number.isSafeInteger(e.processed) && e.processed >= processed && e.processed <= approved.length)
        processed = e.processed
      }
      if (e.stage === 'install' || e.total !== undefined) assert.equal(e.total, approved.length)
    }
    if (e.stage === 'install') {
      allowed.push('current')
      assert.ok(e.current === null || approved.includes(e.current), `not an approved package name: ${e.current}`)
    }
    assert.ok(Object.keys(e).every(k => allowed.includes(k)), JSON.stringify(e))
  }
  return result
}

let serial = 0
async function scenario(label, doc, run) {
  const profile = makeProfile(join(home, 'profiles', `case-${++serial}`), { dependencies: { 'receiver-only': '1.0.0' }, bundles: [] })
  useProfile(profile, home)
  const repo = stubGithub({ gistId: ID, document: doc })
  const manager = {
    lookups: 0, calls: [], cancellations: [],
    names: () => [], install: spec => { throw new Error(`unexpected fixture install: ${spec}`) },
    listPlugins: () => [],
    listBundles() { return this.names().map(name => ({ name, availability: 'profile', installed: true })) },
    installBundle(spec, options) { this.calls.push({ spec, options }); return this.install(spec) },
    cancelInstall(id) { this.cancellations.push(id); return { status: 'cancelled' } },
  }
  let handler
  const webServer = { register(route) { handler = route.handler; return () => {} } }
  const dispose = registerRoutes({ get(name) {
    if (name === 'webServer') return webServer
    if (name === 'pluginManager') { manager.lookups++; return manager }
  } })
  const disconnected = deferred()
  const served = await serveHandler((req, res) => {
    if (req.url.endsWith('/sync/install') && req.headers.accept === NDJSON) {
      res.once('close', () => { if (!res.writableFinished) disconnected.resolve() })
    }
    handler(req, res)
  })
  const controller = new AbortController()
  const post = (route, body, accept) => new Promise((resolve, reject) => {
    const req = request(`${served.base}${BASE_PATH}/api/${route}`, {
      method: 'POST', agent: false, signal: controller.signal,
      headers: { 'content-type': 'application/json', ...(accept ? { accept } : {}) },
    }, resolve)
    req.once('error', reject)
    req.end(JSON.stringify(body))
  })
  const preview = mode => jsonReply(post(modes[mode][0], mode === 'local' ? { reviewed: true, backup: doc } : { id: ID, token: TEST_TOKEN }))
  const confirm = (mode, planId, accept) => post(modes[mode][1], { planId, confirm: true }, accept)
  const releases = []
  const barrier = () => {
    const entered = deferred(), done = deferred()
    releases.push(done.resolve)
    return { entered: entered.promise, hold() { entered.resolve(); return done.promise }, release: done.resolve }
  }
  const gistReads = n => assert.deepEqual(repo.calls.map(c => [c.method, c.path]), Array.from({ length: n }, () => ['GET', `/gists/${ID}`]))
  const note = () => readFileSync(join(profile, NOTE), 'utf8')
  const undoPoints = () => readdirSync(join(profile, WORK_DIR, 'undo')).sort()
  let timer
  try {
    await Promise.race([
      run({ profile, doc, manager, post, preview, confirm, barrier, disconnected: disconnected.promise, note, undoPoints, gistReads }),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`timed out waiting for ${label}`)), 8_000) }),
    ])
    check(label, true)
  } catch (error) {
    check(label, false, error.stack)
  } finally {
    clearTimeout(timer)
    for (const release of releases) release()
    controller.abort()
    dispose()
    const server = served.close()
    const closed = once(server, 'close')
    server.closeAllConnections()
    try { await closed } finally { repo.restore() }
  }
}

const names = ['@fixture/first', 'fixture-rejected', 'fixture-unseen']
const late = 'fixture-initially-present'
const dependencies = Object.fromEntries([...names, late].map(name => [name, '1.2.3']))
const spec = name => `${name}@1.2.3`
const combined = document(dependencies, [...names, late, 'fixture-without-source'])
await scenario('live 0/3 and 2/3, only approved names; final inventory can contradict installer success', combined, async t => {
  const { manager } = t
  const first = t.barrier(), third = t.barrier()
  const present = []
  // The fourth package vanishes after the consent check. Now resolvable and missing,
  // it still was not approved; the bundle with no source is never a target either.
  manager.names = () => [...present, ...(t.note() !== REVIEWED ? [late] : [])]
  manager.install = async target => {
    if (target === spec(names[0])) { await first.hold(); present.push(names[0]); return applied }
    if (target === spec(names[1])) throw new Error('fixture installation refused')
    if (target === spec(names[2])) { await third.hold(); return applied } // absent in final inventory!
    throw new Error(`unapproved target: ${target}`)
  }
  const plan = await t.preview('combined')
  assert.deepEqual(plan.plugins.missing.filter(p => p.resolvable).map(p => p.name), names)
  assert.ok(plan.plugins.installed.includes(late))
  const observed = []
  const events = await collect(t.confirm('combined', plan.planId, NDJSON), async e => {
    if (e.type !== 'progress' || e.stage !== 'install') return
    const index = names.indexOf(e.current)
    if (![0, 2].includes(index) || observed.includes(index)) return
    const gate = index === 0 ? first : third
    await gate.entered
    assert.equal(t.note(), REVIEWED, 'file write finished before install')
    assert.deepEqual([e.processed, e.total], [index, 3], 'failed attempts also count as processed')
    observed.push(index)
    gate.release() // the manager cannot finish until its current event is decoded at the client
  })
  assert.deepEqual(observed, [0, 2])
  const result = streamResult(events, 'combined', plan, names)
  for (const [i, name] of names.entries()) {
    assert.ok(events.some(e => e.stage === 'install' && e.current === name && e.processed === i), `missing handoff: ${name}`)
  }
  assert.ok(events.some(e => e.processed === names.length && e.total === names.length), 'all three attempts were processed, not three successes')
  assert.deepEqual(manager.calls.map(c => c.spec), names.map(spec))
  assert.ok(manager.calls.every(c => !c.options?.approvedBuilds?.length))
  assert.equal(result.complete, false)
  assert.deepEqual(names.map(n => result.plugins.results.find(p => p.name === n)?.outcome), ['installed', 'failed', 'failed'])
  assert.ok(result.plugins.missing.some(p => p.name === names[2]), 'last applied call never became present')
  assert.ok(result.plugins.missing.some(p => p.name === late), 'new gap was not silently installed')
  await refusal(t.confirm('combined', plan.planId, NDJSON), 409, 'stale-plan')
  t.gistReads(1)
})

for (const mode of ['config', 'local']) {
  await scenario(`${mode}: checked file writes and verification only; old JSON callers keep the receipt`, document({ 'fixture-missing': '1.2.3' }), async t => {
    const plan = await t.preview(mode)
    const events = await collect(t.confirm(mode, plan.planId, NDJSON))
    const result = streamResult(events, mode, plan)
    assert.ok(result.report.restored > 0)
    assert.equal(t.note(), REVIEWED)
    await refusal(t.confirm(mode, plan.planId, NDJSON), 409, 'stale-plan')
    const again = await t.preview(mode)
    receipt(await jsonReply(t.confirm(mode, again.planId)), mode, again)
    if (mode === 'local') { // the original raw-backup operation is not a reviewed stream, even with this Accept
      const raw = await jsonReply(t.post('restore', { backup: t.doc, confirm: true }, NDJSON))
      assert.deepEqual(Object.keys(raw), ['report'])
    }
    assert.equal(t.manager.lookups, 0, 'no inventory or installation for file-only restores')
    t.gistReads(mode === 'config' ? 2 : 0)
  })
}

await scenario('Accept opts into feedback, not extra authority: all three modes still require the reviewed request', document(), async t => {
  const before = t.note()
  for (const [mode, [, path]] of Object.entries(modes)) {
    const { planId } = await t.preview(mode)
    await refusal(t.post(path, { planId, confirm: 'true' }, NDJSON), 400, 'invalid')
    const extra = mode === 'combined' ? { spec: 'not-approved@8.0.0' } : { backup: t.doc }
    await refusal(t.post(path, { planId, confirm: true, ...extra }, NDJSON), 400, 'invalid')
  }
  assert.equal(t.note(), before)
  assert.deepEqual(t.manager.calls, [])
  t.gistReads(2)
})

await scenario('combined confirmations keep old JSON unless NDJSON is acceptable', document(), async t => {
  for (const accept of [undefined, '*/*', `application/json, ${NDJSON};q=0`]) {
    const plan = await t.preview('combined')
    const result = await jsonReply(t.confirm('combined', plan.planId, accept))
    receipt(result, 'combined', plan)
    assert.equal(result.complete, true)
  }
  assert.deepEqual(t.manager.calls, [])
  t.gistReads(3)
})

await scenario('write failure after progress ends in one coded error; it neither installs nor replays', document({ 'fixture-missing': '1.2.3' }), async t => {
  const plan = await t.preview('combined')
  const before = t.note()
  writeFileSync(join(t.profile, WORK_DIR), 'cannot create undo snapshot here')
  const events = await collect(t.confirm('combined', plan.planId, NDJSON))
  const error = terminal(events, 'error')
  assert.equal(error.code, 'other')
  assert.ok(typeof error.error === 'string' && error.error)
  assert.deepEqual([...new Set(events.slice(0, -1).map(e => e.stage))], ['check', 'write'])
  assert.equal(t.note(), before)
  await refusal(t.confirm('combined', plan.planId, NDJSON), 409, 'stale-plan')
  assert.deepEqual(t.manager.calls, [])
  t.gistReads(1)
})

const pair = ['fixture-held', 'fixture-next']
await scenario('reader disconnect keeps single-writer lock, finishes exactly once, and cannot replay', document(Object.fromEntries(pair.map(n => [n, '1.2.3']))), async t => {
  const held = t.barrier(), rechecked = deferred()
  const present = []
  t.manager.names = () => { if (present.length === pair.length) rechecked.resolve(); return present }
  t.manager.install = async target => {
    if (target === spec(pair[0])) await held.hold()
    present.push(target.split('@')[0])
    return applied
  }
  const plan = await t.preview('combined')
  const res = await t.confirm('combined', plan.planId, NDJSON)
  for await (const e of frames(res)) {
    if (e.stage === 'install' && e.current === pair[0]) {
      await held.entered
      res.destroy() // a real TCP disconnect, not an ignored local progress callback
      break
    }
  }
  await t.disconnected // server observed socket close before trying a concurrent writer
  assert.equal(t.note(), REVIEWED)
  const undo = t.undoPoints()
  assert.equal(undo.length, 1)
  const marker = '{"after":"disconnect"}'
  writeFileSync(join(t.profile, NOTE), marker)
  await refusal(t.post('undo', {}), 409, 'busy')
  await refusal(t.confirm('combined', plan.planId, NDJSON), 409, 'busy')
  assert.deepEqual(t.manager.calls.map(c => c.spec), [spec(pair[0])])
  held.release()
  await rechecked.promise // the second item and actual final inventory ran without a reader
  await refusal(t.confirm('combined', plan.planId, NDJSON), 409, 'stale-plan')
  assert.deepEqual(t.manager.calls.map(c => c.spec), pair.map(spec))
  assert.deepEqual(t.manager.cancellations, [])
  assert.deepEqual(t.undoPoints(), undo)
  assert.equal(t.note(), marker, 'neither reconnect nor replay may repeat the file writes')
  t.gistReads(1)
})

globalThis.fetch = originalFetch
process.exitCode = finish()
