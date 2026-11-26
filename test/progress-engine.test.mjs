/** The Host confirmation is the progress source. No routes, sleeps, sockets or real installer. */
import assert from 'node:assert/strict'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { undoStatus, validateBackup, WORK_DIR } from '../lib/backup.js'
import { declarationsFromManifest, installMissingPlugins, pluginInventory } from '../lib/plugins.js'
import { createRestoreSession } from '../lib/sync-install.js'
import { backupDocument, createReport, makeProfile, tempDir, TEST_GIST_ID, useProfile } from './harness.mjs'

const { check, finish } = createReport('Host restore progress')
const home = tempDir('dsh-restore-progress-')
process.env.HOME = process.env.USERPROFILE = process.env.DSH_HOME = home
process.env.PATH = join(home, 'no-executables')
for (const key of ['GITHUB_TOKEN', 'DSH_GITHUB_TOKEN', 'GH_TOKEN']) delete process.env[key]
globalThis.fetch = () => { throw new Error('unexpected network access') }
const ref = { id: TEST_GIST_ID }
const note = 'data/note.json', original = '{"hello":"world"}\n', reviewed = '{"reviewed":true}\n'
const readNote = profile => readFileSync(join(profile, note), 'utf8')
const checkStep = { stage: 'check' }, writeStep = { stage: 'write' }
const install = (files, processed, total, current) => ({ stage: 'install', files, processed, total, current })
function document(dependencies = {}, text = reviewed, extraFiles = []) {
  const doc = backupDocument('sender', [{ path: note, lines: text.split('\n') }, ...extraFiles])
  doc.files[0].json.dependencies = dependencies
  return validateBackup(doc)
}
function gate() {
  let open
  const promise = new Promise(resolve => { open = resolve })
  return { promise, open }
}
let serial = 0
async function scenario(label, run) {
  const profile = makeProfile(join(home, 'profiles', `${++serial}`), { dependencies: {}, bundles: [] })
  useProfile(profile, home)
  let lookups = 0
  const manager = { listPlugins: () => [], listBundles: () => [], installBundle: () => { throw new Error('unexpected install') } }
  const session = createRestoreSession({ get pluginManager() { lookups++; return manager } })
  try { await run({ profile, manager, session, lookups: () => lookups }); check(label, true) }
  catch (error) { check(label, false, error.stack) }
  finally { session.dispose() }
}

await scenario('a held installer observes each real handoff; 3/3 precedes inventory verification, not a success verdict', async ({ profile, manager, session }) => {
  const first = '@sample/one', second = 'dsh-profile-gist-sync', third = '@sample/three' // upstream is not the sync package itself
  const url = 'https://example.invalid/third-party-source.tgz'
  const events = [], snapshots = [], calls = [], visible = new Set(['preexisting'])
  const inThird = gate(), releaseThird = gate(), inVerify = gate(), releaseVerify = gate()
  manager.listPlugins = async () => {
    if (events.at(-1)?.stage === 'verify') { inVerify.open(); await releaseVerify.promise }
    return []
  }
  manager.listBundles = () => [...visible].map(name => ({ name, installed: true }))
  manager.installBundle = async (spec, options) => {
    calls.push({ spec, options, progressAtHandoff: events.at(-1) })
    if (spec === url) { visible.add(first); return { application: 'applied', pendingBuilds: ['native-helper'] } }
    if (spec === `${second}@1`) throw new Error('private diagnostic: installer offline')
    inThird.open(); await releaseThird.promise
    return { application: 'applied' } // manager says 'applied', but the inventory will still lack it
  }
  const plan = await session.preview(ref, document({
    'dsh-profile-gist-sync-plus': '9', 'dsh-multi-device-config-sync': '9', preexisting: '1',
    [first]: url, local: 'link:../private-path', [second]: '1', [third]: '1',
  }))
  const pending = session.confirm(plan.planId, true, event => {
    events.push(event)
    snapshots.push([readNote(profile), undoStatus()?.files ?? 0])
    if (event.stage === 'install') throw new Error('subscriber disconnected')
  })
  const checkpoint = (reached, name) => Promise.race([
    reached.promise, pending.then(() => { throw new Error(`confirmation finished before ${name}`) }),
  ])
  let receipt
  try {
    await checkpoint(inThird, 'the third handoff')
    assert.deepEqual(events.at(-1), install(1, 2, 3, third))
    const other = []
    await assert.rejects(session.confirm(plan.planId, true, event => other.push(event)), { code: 'stale-plan' })
    assert.deepEqual(other, [], 'a second caller does not observe the first one’s job')
    releaseThird.open()
    await checkpoint(inVerify, 'the inventory recheck')
    assert.deepEqual(events.at(-1), { stage: 'verify', files: 1, processed: 3, total: 3 })
    assert.deepEqual(calls.map(call => call.progressAtHandoff), [install(1, 0, 3, first), install(1, 1, 3, second), install(1, 2, 3, third)])
  } finally {
    releaseThird.open(); releaseVerify.open()
    receipt = await pending
  }
  assert.deepEqual(events.slice(0, 2), [checkStep, writeStep])
  assert.deepEqual(snapshots.slice(0, 2), [[original, 0], [original, 0]], 'write starts before the file commit')
  assert.ok(snapshots.slice(2).every(([text, count]) => text === reviewed && count === receipt.report.restored))
  const meter = events.filter(event => event.stage === 'install')
  assert.deepEqual(meter.filter(event => event.current !== null), calls.map(call => call.progressAtHandoff))
  assert.deepEqual(meter.at(-1), install(1, 3, 3, null))
  for (const event of meter) assert.deepEqual(Object.keys(event).sort(), ['current', 'files', 'processed', 'stage', 'total'])
  assert.deepEqual(calls.map(call => call.spec), [url, `${second}@1`, `${third}@1`])
  assert.ok(calls.every(call => !Object.hasOwn(call.options, 'approvedBuilds')))
  assert.deepEqual(receipt.plugins.results.map(row => [row.name, row.outcome]), [[first, 'installed'], ['local', 'skipped'], [second, 'failed'], [third, 'failed']])
  assert.deepEqual(receipt.plugins.results[0].pendingBuilds, ['native-helper'])
  assert.equal(receipt.complete, false)
})

await scenario('the second inventory can add skips and remove work: only an approved item with its own result counts', async ({ profile, manager, session }) => {
  const events = [], calls = [], installed = []
  manager.listBundles = () => [...(readNote(profile) === original ? ['unreviewed-gap'] : ['now-present']), ...installed].map(name => ({ name, installed: true }))
  manager.installBundle = spec => {
    calls.push(spec); installed.push('attempted')
    return { application: 'failed', error: { code: 'already-installed' } } // a real result for this handoff
  }
  const plan = await session.preview(ref, document({ 'now-present': '1', 'unreviewed-gap': '1', attempted: '1', manual: 'file:../manual' }))
  assert.equal(plan.plugins.counts.installable, 2)
  const receipt = await session.confirm(plan.planId, true, event => events.push(event))
  assert.deepEqual(calls, ['attempted@1'])
  assert.deepEqual(receipt.plugins.results.map(row => [row.name, row.outcome]), [['unreviewed-gap', 'skipped'], ['attempted', 'already-present'], ['manual', 'skipped']])
  assert.deepEqual(events.filter(event => event.current != null), [install(1, 0, 2, 'attempted')])
  assert.ok(events.filter(event => event.stage === 'install').every(event => event.total === 2 && event.processed <= 1))
  assert.deepEqual(events.at(-1), { stage: 'verify', files: 1, processed: 1, total: 2 })
})

await scenario('an approved name skipped for a changed spec gets one result but the new source is never handed off', async ({ manager }) => {
  const ctx = { pluginManager: manager }, events = [], calls = []
  manager.installBundle = spec => { calls.push(spec) }
  const declared = dependencies => declarationsFromManifest({ dependencies })
  const review = await pluginInventory(ctx, declared({ changed: '1', 'became-present': '1' }))
  const approved = new Map(review.missing.map(row => [row.name, row.installSpec]))
  // Exercise the installer's eligibility recheck in isolation: the confirmation
  // normally retains its immutable cloud declarations. A new spec is not consent.
  manager.listBundles = () => [{ name: 'became-present', installed: true }]
  const receipt = await installMissingPlugins(ctx, {
    declarations: declared({ unchecked: '1', changed: '2', 'became-present': '1' }), approved,
    progress: event => events.push(event),
  })
  assert.deepEqual(receipt.results.map(row => [row.name, row.outcome, row.message]), [['unchecked', 'skipped', 'stale-plan'], ['changed', 'skipped', 'stale-plan']])
  assert.deepEqual(calls, [])
  assert.deepEqual(events, [
    { stage: 'install', processed: 0, total: 2, current: null },
    { stage: 'install', processed: 1, total: 2, current: null },
    { stage: 'verify', processed: 1, total: 2 },
  ])
})

await scenario('zero changes and zero approvals: verify a real inventory, no install event or undo point', async ({ session, manager }) => {
  const events = [], inventoryAt = [], calls = []
  manager.installBundle = spec => { calls.push(spec) }
  manager.listBundles = () => { inventoryAt.push(events.at(-1)?.stage); return [{ name: 'here', installed: true }] }
  const plan = await session.preview(ref, document({ here: '1', manual: 'workspace:*' }, original))
  const result = await session.confirm(plan.planId, true, event => events.push(event))
  assert.deepEqual(events, [checkStep, writeStep, { stage: 'verify', files: 0 }])
  assert.deepEqual(calls, [])
  assert.equal(inventoryAt.at(-1), 'verify')
  assert.equal(result.report.restored, 0)
  assert.equal(result.report.undoDir, null)
  assert.equal(undoStatus(), null)
  assert.equal(result.complete, false, 'the unresolved declaration still needs attention')
})

await scenario('packages-only: all 3 items processed with zero file changes is not completion while a build is pending', async ({ session, manager }) => {
  const events = [], names = [], options = []
  manager.listBundles = () => names.map(name => ({ name, installed: true }))
  manager.installBundle = (spec, opts) => {
    names.push(spec.split('@')[0]); options.push(opts)
    return { application: 'applied', pendingBuilds: names.length === 3 ? ['native-helper'] : [] }
  }
  const plan = await session.preview(ref, document({ one: '1', two: '1', three: '1' }, original))
  const result = await session.confirm(plan.planId, true, event => events.push(event))
  assert.deepEqual(events.at(-1), { stage: 'verify', files: 0, processed: 3, total: 3 })
  assert.ok(events.filter(event => event.stage === 'install').every(event => event.files === 0))
  assert.equal(result.report.restored, 0)
  assert.equal(undoStatus(), null)
  assert.equal(result.plugins.counts.missing, 0)
  assert.equal(result.plugins.outcomeCounts.installed, 3)
  assert.equal(result.complete, false)
  assert.ok(options.every(opts => !Object.hasOwn(opts, 'approvedBuilds')))
})

await scenario('config committed but pre-install inventory unavailable: no invented outcomes or final verification', async ({ profile, session, manager }) => {
  const events = []
  manager.listPlugins = manager.listBundles = () => { if (readNote(profile) === reviewed) throw new Error('inventory unavailable'); return [] }
  const plan = await session.preview(ref, document({ plugin: '1' }))
  const result = await session.confirm(plan.planId, true, event => events.push(event))
  assert.deepEqual(events, [checkStep, writeStep, install(1, 0, 1, null)])
  assert.equal(result.report.restored, 1)
  assert.equal(result.plugins.available, false)
  assert.deepEqual(result.plugins.results, [])
  assert.equal(result.complete, false)
})

for (const mode of ['config', 'local']) await scenario(`${mode}: synchronous, private write-receipt checks survive thrown or rejected deliveries, including a no-op`, async ({ session, profile, lookups }) => {
  const doc = document(), events = [], bytesAt = [], again = []
  const preview = () => mode === 'config' ? session.previewConfig(ref, doc) : session.previewLocal(doc)
  const confirm = mode === 'config' ? session.confirmConfig : session.confirmLocal
  const wrong = mode === 'config' ? session.confirmLocal : session.confirmConfig
  const { planId } = preview()
  assert.throws(() => wrong(planId, true, e => events.push(e)), { code: 'stale-plan' })
  assert.throws(() => confirm(planId, 'true', e => events.push(e)), { code: 'invalid' })
  assert.deepEqual(events, [])
  const receipt = confirm(planId, true, e => {
    events.push(e); bytesAt.push(readNote(profile))
    if (e.stage === 'check') throw new Error('disconnected')
    return e.stage === 'write' ? Promise.reject(new Error('async disconnection')) : new Promise(() => {})
  })
  assert.deepEqual(events, [checkStep, writeStep, { stage: 'verify', files: 1 }])
  assert.deepEqual(bytesAt, [original, original, reviewed])
  assert.equal(receipt.report.restored, 1, 'a synchronous receipt, not a Promise')
  assert.deepEqual(Object.keys(receipt).sort(), mode === 'config' ? ['ref', 'report', 'restart', 'warnings'] : ['report'])
  const unchanged = confirm(preview().planId, true, e => again.push(e))
  assert.deepEqual(again, [checkStep, writeStep, { stage: 'verify', files: 0 }])
  assert.equal(events.length, 3, 'the listener from the first call was not retained')
  assert.equal(unchanged.report.undoDir, null)
  assert.equal(unchanged.report.restored, 0)
  assert.equal(lookups(), 0)
  assert.equal(existsSync(join(profile, WORK_DIR, 'settings.json')), mode === 'config')
})

await scenario('rejected fingerprints and rolled-back writes do not emit commit/installation counts', async ({ session, profile, manager }) => {
  const calls = [], stale = [], rollback = [], replay = []
  manager.installBundle = spec => { calls.push(spec) }
  const fresh = await session.preview(ref, document({ plugin: '1' }))
  writeFileSync(join(profile, note), 'edited after preview')
  await assert.rejects(session.confirm(fresh.planId, true, event => stale.push(event)), { code: 'stale-plan' })
  assert.deepEqual(stale, [checkStep])
  // Both paths are absent at preview. Writing the first fixture file makes it
  // impossible to create the second file under it, after the note was overwritten.
  const plan = await session.preview(ref, document({ plugin: '1' }, reviewed, [
    { path: 'data/conflict', lines: ['fixture file'] }, { path: 'data/conflict/note.json', lines: ['{}'] },
  ]))
  await assert.rejects(session.confirm(plan.planId, true, event => rollback.push(event)), { code: 'unsafe-path' })
  assert.deepEqual(rollback, [checkStep, writeStep])
  assert.equal(readNote(profile), 'edited after preview')
  assert.ok(!existsSync(join(profile, 'data/conflict')))
  assert.equal(undoStatus(), null)
  assert.deepEqual(calls, [])
  await assert.rejects(session.confirm(plan.planId, true, event => replay.push(event)), { code: 'stale-plan' })
  assert.deepEqual(replay, [])
})

process.exitCode = finish()
