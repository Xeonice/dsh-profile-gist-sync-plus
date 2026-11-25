/** Regression tests for the desktop panel's decisions, not a replacement for visual review.
 * The standalone Client artifact cannot import a sibling module. Expose its pure
 * decision functions only inside this test's VM; no DOM, fake renderer, live
 * profile, or GitHub access is involved. Do not add a test API to the bundle.
 */
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'
import { createReport, TEST_GIST_ID } from './harness.mjs'

const { check, finish } = createReport('client decisions')
const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
const marker = '    function Panel('
assert.equal(source.split(marker).length, 2, 'identify the boundary before the real panel')
const pure = 'sourceId, gistLink, filePlan, validCloudPlan, actionable, compatible, verifiedReport, incomplete, sourceKind'
const sandbox = { window: { __ModuleLoader__: { load(module) {
  assert.equal(module.id, 'dsh-multi-device-config-sync')
  module.factory(name => { assert.equal(name, 'react'); return Object.freeze({}) })
} } } }
vm.runInNewContext(source.replace(marker, `    globalThis.subject = { ${pure} }\n${marker}`), sandbox, { timeout: 500, filename: 'client.js' })
const f = sandbox.subject
const id = TEST_GIST_ID
const canonical = `https://gist.github.com/${id}`
const fixture = (changes = false) => ({
  profile: 'desktop', files: [{ path: 'cordis.patch.yml', status: changes ? 'overwrite' : 'identical' }],
  counts: { overwrite: Number(changes), add: 0, merge: 0, identical: Number(!changes) }, dropped: [], manifest: null,
})
const inventory = { available: true, installed: [], missing: [] }
const missing = { name: 'example-plugin', spec: '1.0.0', installSpec: 'example-plugin@1.0.0', resolvable: true }
const unavailable = { available: false, reason: 'no-plugin-manager' }
const unresolved = { name: 'workspace-plugin', spec: 'workspace:*', installSpec: null, resolvable: false }
const plan = { ref: { id }, planId: 'reviewed-fixture', preview: fixture(), plugins: inventory }

check('both ID and canonical Gist link work without an upload', f.sourceId(id) === id && f.sourceId(`https://gist.github.com/sample/${id}`) === id)
check('other sites, insecure links and credential-bearing URLs are not backup sources',
  [`http://gist.github.com/${id}`, `https://example.invalid/${id}`, `https://user@gist.github.com/${id}`, `${canonical}?extra=private`, `${canonical}#revision`].every(s => f.sourceId(s) == null))
check('copy uses the confirmed Gist even if the upstream HTML URL is unrelated', f.gistLink({ id, htmlUrl: 'https://example.invalid/unrelated' }) === canonical)
check('a receipt without a real ID provides no copy target', f.gistLink({ htmlUrl: canonical }) == null)
check('the npm client keeps the 1.3 Host protocol and accepts both Git and npm releases',
  ['1.3.0', '1.4.0', '1.4.1', '1.5.0'].every(version => f.compatible({ version, cloud: {} })))
check('a pre-1.3 Host or a status without cloud capabilities remains unsupported',
  !f.compatible({ version: '1.2.99', cloud: {} }) && !f.compatible({ version: '1.4.0' }))
check('a count that hides a file change is rejected before confirmation', !f.filePlan({ ...fixture(true), counts: fixture().counts }))
check('a Gist reply must match the explicitly selected source', f.validCloudPlan(plan, 'standard', id) && !f.validCloudPlan(plan, 'standard', 'different-id'))
check('a config-only preview cannot stand in for a combined preview or vice versa', !f.validCloudPlan(plan, 'config', id) && !f.validCloudPlan({ ...plan, plugins: undefined }, 'standard', id) && f.validCloudPlan({ ...plan, plugins: undefined }, 'config', id))
check('an unreadable plugin inventory cannot supply a confirmable plan', !f.validCloudPlan({ ...plan, plugins: unavailable }, 'standard', id) && f.validCloudPlan({ ...plan, plugins: unavailable, planId: null }, 'standard', id))
check('identical configuration with no missing plugins has no write action', !f.actionable({ ...plan, mode: 'standard' }) && !f.actionable({ mode: 'config', preview: fixture() }))
check('a skipped-only package is not counted as an installation', !f.actionable({ ...plan, mode: 'standard', plugins: { ...inventory, missing: [unresolved] } }))
check('a real file change or an eligible missing package can be confirmed', f.actionable({ ...plan, mode: 'standard', preview: fixture(true) }) && f.actionable({ ...plan, mode: 'standard', plugins: { ...inventory, missing: [missing] } }))
check('unavailable inventory does not turn file changes into an implicit config-only write', !f.actionable({ ...plan, mode: 'standard', plugins: unavailable, preview: fixture(true) }))
check('a pinned Git source is not labelled as an npm registry package', f.sourceKind(missing, k => k) === 'npm' && f.sourceKind({ ...missing, installSpec: 'git+https://github.com/example/plugins.git#rev' }, k => k) === 'Git')
const result = { ...inventory, results: [{ name: missing.name, outcome: 'installed', pendingBuilds: [] }], outcomeCounts: { installed: 1, 'already-present': 0, failed: 0, skipped: 0 } }
check('complete results are distinguished from missing data and pending builds', f.verifiedReport(result) && !f.incomplete(result) && f.incomplete({}) && f.incomplete({ ...result, results: [{ ...result.results[0], pendingBuilds: ['build-fixture'] }] }))
check('no prototype copy or dummy destinations were packaged', !/example\.invalid|示例备份|重新体验/.test(source))
process.exit(finish())
