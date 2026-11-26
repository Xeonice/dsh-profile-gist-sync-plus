/** Exercise the shipped single-file client with real Web Streams and fixture fetch only.
 * Expose its transport and pure view decisions inside this VM, never in the bundle.
 * No React renderer, DOM, profile, sockets, Gist operations or package installation.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { createReport, TEST_GIST_ID } from './harness.mjs'

const { check, finish } = createReport('restore progress client')
const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
const marker = '    function Panel('
assert.equal(source.split(marker).length, 2)
const exposed = 'api, confirmReviewed, runReviewed, progressPage, progressStages, stageLabel, progressStatus, progressScope, checkedProgress, validRestore, restoreDestination, receiptSummary, matchingUndo, DICT'
const program = new vm.Script(source.replace(marker, `    globalThis.subject = { ${exposed} }\n${marker}`), { filename: 'client.js' })
function client(replies = [], modern = true) {
  const calls = [], queue = [...replies]
  const sandbox = { TextDecoder, Response, ReadableStream: modern ? ReadableStream : undefined,
    window: { __ModuleLoader__: { load: m => m.factory(key => { assert.equal(key, 'react'); return Object.freeze({}) }) } },
    async fetch(url, init) {
      calls.push({ url, method: init.method, headers: new Headers(init.headers), body: init.body && JSON.parse(init.body),
        credentials: init.credentials, redirect: init.redirect, cache: init.cache, signal: init.signal })
      assert.ok(queue.length, 'unexpected extra network call')
      const reply = queue.shift()
      return typeof reply === 'function' ? reply() : reply
    },
  }
  program.runInNewContext(sandbox, { timeout: 500 })
  return { f: sandbox.subject, calls }
}
async function scenario(name, run) {
  try { await run(); check(name, true) } catch (error) { check(name, false, error.stack) }
}
const clone = x => JSON.parse(JSON.stringify(x)) // strip only VM realm prototypes
const signal = new AbortController().signal
const API = '/dsh-profile-gist-sync-plus/api'
const streamType = 'application/x-ndjson'
const byMode = { standard: '/sync/install', config: '/config/restore', local: '/restore' }
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } })
const record = (stage, extra) => ({ type: 'progress', stage, ...extra })
const final = result => ({ type: 'result', result })
const buf = value => new TextEncoder().encode(value)
const lines = (...rows) => rows.map(x => JSON.stringify(x)).join('\r\n') + '\n'
const response = body => new Response(body, { headers: { 'content-type': `${streamType}; charset=utf-8` } })
function chunks(...parts) {
  return response(new ReadableStream({ pull(controller) {
    if (!parts.length) return controller.close()
    const next = parts.shift()
    if (next instanceof Error) controller.error(next)
    else controller.enqueue(typeof next === 'string' ? buf(next) : next)
  } }))
}
const pkg = (name, resolvable = true) => ({ name, resolvable, spec: resolvable ? '1.0.0' : 'workspace:*', installSpec: resolvable ? `${name}@1.0.0` : null })
const first = pkg('@fixture/notes'), second = pkg('fixture-reader'), skipped = pkg('fixture-unresolved', false)
function plan(mode, missing = [first, second], write = true) {
  return { mode, planId: `fixture-${mode}`, preview: { profile: '本机', sourceProfile: '原设备', createdAt: '2026-01-01T00:00:00Z',
    files: [{ path: '中文.json', status: write ? 'add' : 'identical' }], counts: { add: Number(write), overwrite: 0, merge: 0, identical: Number(!write) }, dropped: [] },
    ...(mode === 'local' ? { fileName: '备份.json' } : { ref: { id: TEST_GIST_ID } }),
    ...(mode === 'standard' ? { plugins: { available: true, installed: [], missing } } : {}) }
}
function result(p, outcomes = {}, scripts = {}) {
  const report = { ...p.preview, restored: p.preview.counts.add, undoStamp: p.preview.counts.add ? 'fixture-undo' : null }
  if (p.mode === 'local') return { report }
  const base = { report, ref: p.ref, warnings: [], restart: report.restored > 0 }
  if (p.mode === 'config') return base
  const results = p.plugins.missing.map(entry => ({ name: entry.name, installSpec: entry.installSpec,
    outcome: outcomes[entry.name] ?? (entry.resolvable ? 'installed' : 'skipped'), pendingBuilds: scripts[entry.name] ?? [] }))
  const outcomeCounts = Object.fromEntries(['installed', 'already-present', 'failed', 'skipped'].map(k => [k, results.filter(row => row.outcome === k).length]))
  const present = results.filter(r => ['installed', 'already-present'].includes(r.outcome)).map(r => r.name)
  return { ...base, plugins: { available: true, results, outcomeCounts, installed: present, missing: p.plugins.missing.filter(row => !present.includes(row.name)) },
    complete: !outcomeCounts.failed && !outcomeCounts.skipped && !results.some(r => r.pendingBuilds.length) }
}
const install = (processed, current = null, total = 2) => record('install', { files: 1, processed, total, current })
const p = plan('standard'), ok = result(p)

for (const mode of Object.keys(byMode)) await scenario(`${mode}: same reviewed POST, original JSON receipt, authenticated fetch policy`, async () => {
  const review = plan(mode), receipt = result(review)
  for (const modern of [true, false]) {
    const { f, calls } = client([json(receipt)], modern), events = []
    assert.deepEqual(clone(await f.confirmReviewed({ ...review, token: 'must-not-send', backup: {} }, signal, x => events.push(x))), receipt)
    assert.equal(calls.length, 1)
    const [req] = calls
    assert.deepEqual([req.method, req.url, req.headers.get('accept'), req.headers.get('content-type')], ['POST', API + byMode[mode], modern ? streamType : null, 'application/json'])
    assert.deepEqual(req.body, { planId: review.planId, confirm: true })
    assert.deepEqual([req.credentials, req.redirect, req.cache, req.signal], ['same-origin', 'error', 'no-store', signal])
    assert.deepEqual(events, [], 'no simulated stages or counters for JSON')
    assert.equal(f.progressPage(review).step, null)
  }
})
await scenario('preview, status, standalone install, upload, undo and legacy imports do not request NDJSON', async () => {
  const routes = [['/status'], ['/config/preview', {}], ['/sync/preview', {}], ['/preview', {}], ['/restore', { confirm: true, backup: {} }], ['/plugins/install', {}], ['/undo', {}], ['/gist/upload', {}]]
  const { f, calls } = client(routes.map(() => json({})))
  for (const [path, body] of routes) await f.api(path, body, signal)
  assert.ok(calls.every(req => !req.headers.has('accept')))
  await assert.rejects(f.confirmReviewed({ ...p, mode: 'plugins' }, signal), { code: 'bad-response' })
  assert.equal(calls.length, routes.length)
})
await scenario('split UTF-8, split records, multiple lines/CRLF and a final record at EOF', async () => {
  const events = [record('check'), record('write'), install(0, first.name), install(1, second.name), install(2), record('verify', { files: 1 })]
  const bytes = buf(lines(...events) + '\r\n' + JSON.stringify(final(ok)))
  const inScalar = Buffer.from(bytes).indexOf(Buffer.from('本机')) + 1
  const { f, calls } = client([chunks(bytes.slice(0, 4), bytes.slice(4, inScalar), bytes.slice(inScalar, inScalar + 1), bytes.slice(inScalar + 1))])
  const received = []
  assert.deepEqual(clone(await f.confirmReviewed(p, signal, x => received.push(x))), ok)
  assert.deepEqual(clone(received), events.map(({ type, ...detail }) => detail))
  assert.equal(calls.length, 1)
})
await scenario('all approved outcomes do not settle a restore before the final receipt', async () => {
  let controller, observed, settled = false
  const ready = new Promise(resolve => { observed = resolve })
  const { f, calls } = client([response(new ReadableStream({ start(c) { controller = c; c.enqueue(buf(lines(install(2)))) } }))])
  const finished = f.confirmReviewed(p, signal, frame => { assert.equal(frame.processed, 2); observed() }).then(r => { settled = true; return r })
  await Promise.race([ready, finished.then(() => { throw Error('settled without a receipt') })])
  assert.equal(settled, false)
  const partial = result(p, { [second.name]: 'failed' })
  controller.enqueue(buf(lines(final(partial)))); controller.close()
  assert.deepEqual(clone(await finished), partial)
  assert.equal(calls.length, 1)
})
await scenario('progress requires post-commit evidence, approved names/counts and monotonic stages', async () => {
  const review = plan('standard', [first, second, skipped]), valid = install(1, second.name)
  const bad = [record('other'), record('check', { files: 1 }), record('write', { files: 1 }), record('check', { source: 'other' }),
    record('write', { mode: 'config' }), install(-1), install(2.1), install(3), install(1, first.name, 3), install(2, second.name), install(1, skipped.name),
    install(1, 'unreviewed'), { ...valid, current: undefined }, { ...valid, files: null }, { ...valid, files: 2 }, record('verify'), record('verify', { files: 1, processed: 1 })]
  const badAfter = [install(0), record('write'), { ...valid, files: 0 }]
  const events = [...bad, valid, ...badAfter, record('verify', { files: 1, processed: 1, total: 2 })]
  const { f } = client([chunks(lines(...events, final(result(review))))]), steps = []
  await f.confirmReviewed(review, signal, x => steps.push(x))
  assert.deepEqual(clone(steps.filter(Boolean)), [{ stage: 'install', files: 1, processed: 1, total: 2, current: second.name }, { stage: 'verify', files: 1, processed: 1, total: 2 }])
  assert.equal(steps.filter(x => x === null).length, bad.length + badAfter.length)
  const { approved } = f.progressScope(review)
  assert.deepEqual([...approved], [first.name, second.name])
})
await scenario('no install step for local, configuration-only or zero approved packages; verify without optional counters', async () => {
  for (const mode of Object.keys(byMode)) {
    const review = plan(mode, []), { f } = client([chunks(lines(record('check'), record('write'), install(0, null, 0), record('verify', { files: 1 }), final(result(review))))])
    const page = f.progressPage(review), steps = []
    assert.equal(page.hasPackages, false)
    assert.deepEqual([...f.progressStages(page.hasPackages)], ['check', 'write', 'verify'])
    assert.equal(f.stageLabel('verify', page), mode === 'standard' ? 'verifyLocal' : 'verifyFiles')
    await f.confirmReviewed(review, signal, x => steps.push(x))
    assert.deepEqual(clone(steps), [{ stage: 'check' }, { stage: 'write' }, null, { stage: 'verify', files: 1 }])
    for (const dict of Object.values(f.DICT)) {
      assert.ok(!f.progressStatus({ ...page, step: steps.at(-1) }, k => dict[k]).includes('/'))
      assert.equal(f.progressStatus(page, k => dict[k]), dict.waitingReceipt)
    }
  }
})
await scenario('broken transport, incomplete UTF-8/JSON, missing/duplicate terminal or bad receipt: unverified, no replay', async () => {
  const broken = [() => { throw Error('offline') }, chunks(lines(install(2))), chunks('{"type":"res'), chunks(lines(install(2)), new Uint8Array([0xe4])),
    chunks(lines(install(2)), Error('disconnected')), chunks(lines(final(ok)), Error('unclean end')), chunks(lines(final(ok), final(ok))),
    chunks(lines(final(ok), record('check'))), chunks(lines(final({}))), chunks(lines({ type: 'error', code: 'stale-plan' })), json(null), response(null)]
  for (const reply of broken) {
    const { f, calls } = client([reply]), screens = []
    await f.runReviewed(p, signal, { active: () => true, progress() {}, settle: next => screens.push(next), refresh: () => assert.fail('no speculative refresh') })
    assert.equal(calls.length, 1)
    assert.equal(screens.length, 1)
    const [screen] = screens
    assert.deepEqual([screen.name, screen.receipt.mode, screen.receipt.reviewedMode, screen.receipt.source, screen.receipt.profile], ['receipt', 'unknown', 'standard', TEST_GIST_ID, '本机'])
    assert.equal(screen.receipt.result, undefined); assert.equal(screen.plan, undefined)
  }
})
await scenario('JSON and stream terminal errors preserve the reason; a busy/expired plan is never confirmable again', async () => {
  for (const code of ['busy', 'stale-plan', 'other', 'auth']) {
    const payload = { code, error: code === 'auth' ? 'DSH refused this request' : 'fixture error' }
    for (const reply of [json(payload, 409), chunks(lines(record('check'), { type: 'error', ...payload }))]) {
      const { f, calls } = client([reply]), screens = []
      await f.runReviewed(p, signal, { active: () => true, progress() {}, settle: (dest, error) => screens.push([dest, error.code]), refresh: () => assert.fail() })
      const [[dest, reason]] = screens
      assert.equal(reason, code === 'auth' ? 'session-auth' : code)
      assert.equal(dest.name, ['busy', 'stale-plan'].includes(code) ? 'preview' : 'receipt')
      assert.equal(dest.plan, undefined); assert.equal(dest.planId, undefined); assert.equal(calls.length, 1)
    }
  }
})
await scenario('final result must belong to the reviewed source, mode, target, files and package authority', () => {
  const { f } = client(), config = plan('config'), local = plan('local')
  assert.ok(f.validRestore(ok, p) && f.validRestore(result(config), config) && f.validRestore(result(local), local))
  for (const mismatch of [{ ...ok, ref: { id: 'other' } }, { ...ok, mode: 'local' }, { ...ok, report: { ...ok.report, restored: -1 } },
    { ...ok, report: { ...ok.report, restored: 0 } }, { ...ok, report: { ...ok.report, profile: 'other' } }, { ...ok, report: { ...ok.report, sourceProfile: 'other' } },
    { ...ok, report: { ...ok.report, files: [{ path: 'other.txt', status: 'add' }] } }, { ...ok, plugins: { available: true } },
    { ...ok, plugins: { ...ok.plugins, results: ok.plugins.results.map(row => ({ ...row, installSpec: 'wrong-source' })) } }]) assert.equal(f.validRestore(mismatch, p), false)
  assert.ok(!f.validRestore(ok, config) && !f.validRestore(ok, local) && !f.validRestore(result(local), config))
})
await scenario('receipt separates change count, missing packages, pending scripts, unknown inventory and restart', () => {
  const { f } = client()
  for (const wrote of [true, false]) {
    const review = plan('standard', [first, second], wrote)
    const receipts = [result(review), result(review, { [second.name]: 'failed' }), result(review, {}, { [first.name]: ['fixture-build'] }),
      { ...result(review), complete: false, plugins: { available: false, reason: 'plugin-manager-error', results: [] } }]
    for (const [i, r] of receipts.entries()) {
      assert.ok(f.validRestore(r, review))
      const dest = f.restoreDestination(review, r), summary = f.receiptSummary(dest.receipt)
      assert.deepEqual([dest.name, dest.receipt.profile, dest.receipt.restart], ['receipt', '本机', wrote])
      assert.equal(summary.key, (wrote ? ['restoreDone', 'partialTitle', 'buildTitle', 'unknownPluginsTitle'] : ['restoreDone', 'missingOnly', 'buildsOnly', 'unknownOnly'])[i])
      if (i === 2) { assert.deepEqual([...summary.scripts], ['fixture-build']); assert.equal(r.plugins.outcomeCounts.installed, 2) }
      if (i === 3) assert.equal(summary.missing, null)
    }
    assert.equal(f.restoreDestination(review, { ...receipts[0], restart: true }).receipt.restart, true, 'a plugin can require restart even with zero changed files')
  }
})
await scenario('first verified problem is visible without echoing manager diagnostics; restart has independent scope', () => {
  const { f } = client(), review = plan('standard', [skipped, first, second]), partial = result(review, { [second.name]: 'failed' })
  partial.plugins.results.find(r => r.outcome === 'failed').message = 'fixture private path and token-like text; not inline copy'
  const summary = r => f.receiptSummary(f.restoreDestination(review, r).receipt)
  assert.deepEqual(clone(summary(partial).problem), { name: second.name, state: 'failed', reason: 'inspectInstall' })
  assert.equal(summary(partial).restartKey, 'restartConfig')
  const unresolved = result(review)
  unresolved.plugins.results.find(r => r.outcome === 'skipped').message = 'workspace-protocol'
  assert.deepEqual(clone(summary(unresolved).problem), { name: skipped.name, state: 'skipped', reason: 'note.workspace-protocol' })
  const unchanged = plan('standard', [first], false), packagesOnly = { ...result(unchanged), restart: true }
  assert.equal(f.receiptSummary(f.restoreDestination(unchanged, packagesOnly).receipt).restartKey, 'restartPackages')
  for (const dict of Object.values(f.DICT)) for (const key of ['inspectInstall', 'restartConfig', 'restartPackages', 'restartLimit']) assert.ok(dict[key])
})
await scenario('commit the inline receipt before the read-only status refresh; failure cannot replace it', async () => {
  const { f, calls } = client([json(ok), () => { throw Error('status offline') }]), screens = []
  await assert.rejects(f.runReviewed(p, signal, { active: () => true, progress() {}, settle: next => screens.push(next), refresh: () => f.api('/status', undefined, signal) }), { code: 'network' })
  assert.deepEqual(calls.map(c => [c.method, c.url]), [['POST', API + byMode.standard], ['GET', API + '/status']])
  assert.equal(screens.length, 1); assert.equal(screens[0].name, 'receipt'); assert.deepEqual(clone(screens[0].receipt.result), ok)
  const stamp = ok.report.undoStamp, status = { profile: p.preview.profile, undo: { stamp, files: ok.report.restored } }
  assert.equal(f.matchingUndo(screens[0].receipt, status), stamp)
  for (const other of [{ ...status, profile: 'other' }, { ...status, undo: { ...status.undo, stamp: 'older' } }, { ...status, undo: { ...status.undo, files: 2 } }]) assert.equal(f.matchingUndo(screens[0].receipt, other), null)
  assert.equal(f.matchingUndo(f.restoreDestination(p, null, { code: 'network' }).receipt, status), null)
})
process.exit(finish())
