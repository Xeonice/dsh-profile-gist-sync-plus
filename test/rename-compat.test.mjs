/** Rename regression: real v0.2 export/restore code, temporary profiles, no sockets or package manager. */
import assert from 'node:assert/strict'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createReport, makeProfile, tempDir, TEST_GIST_ID, useProfile } from './harness.mjs'
import { applyRestore, exportBackup, planRestore, rememberProfile, resolveProfile, undoLastRestore, undoStatus, validateBackup, WORK_DIR } from '../lib/backup.js'
import { installMissingPlugins, pluginInventory } from '../lib/plugins.js'
import { readSettings, settingsPath } from '../lib/store.js'
import { createRestoreSession } from '../lib/sync-install.js'

const { check, finish } = createReport('npm rename compatibility')
const OLD = 'dsh-profile-gist-sync-plus'
const NEW = 'dsh-multi-device-config-sync'
const UPSTREAM = 'dsh-profile-gist-sync'
const OTHER = `${OLD}-helper` // a real, distinct name; never collapse a prefix or row ID into the sync package
const GIT = `git+https://github.com/Xeonice/${OLD}.git#${'a'.repeat(40)}`
const home = tempDir('dsh-rename-')
process.env.HOME = process.env.USERPROFILE = process.env.DSH_HOME = home
process.env.PATH = join(home, 'no-executables')
for (const key of ['GITHUB_TOKEN', 'DSH_GITHUB_TOKEN', 'GH_TOKEN', 'DSH_PROFILE', 'DSH_PROFILE_DIR']) delete process.env[key]
globalThis.fetch = () => { throw new Error('unexpected network request') }
const json = path => JSON.parse(readFileSync(path, 'utf8'))
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
const profileAt = (root, name, dependencies = {}, bundles = []) => makeProfile(join(root, 'profiles', name), { dependencies, bundles })
const pkgFile = dir => join(dir, 'package.json')
function installed(dir, name, version = '1.0.0') {
  const path = join(dir, 'node_modules', name)
  mkdirSync(path, { recursive: true })
  writeJson(pkgFile(path), { name, version, type: 'module' })
  return path
}
async function test(label, fn) {
  rememberProfile(null)
  try { await fn(); check(label, true) } catch (error) { check(label, false, error.stack) }
}
function noHint(root) {
  process.env.DSH_HOME = root
  delete process.env.DSH_PROFILE
  delete process.env.DSH_PROFILE_DIR
}

// These are the manifest key, pinned Git source, bundle selection and unchanged
// row id a 1.4.1 profile carries. Export it, rather than hand-normalizing a fixture.
const sender = profileAt(home, 'git-machine', { [OLD]: GIT, [UPSTREAM]: '1.0.2', [OTHER]: '2.3.4', present: '1.0.0' }, [OLD, UPSTREAM])
installed(sender, OLD, '1.4.1')
writeFileSync(join(sender, 'cordis.patch.yml'), `# keep the stable row id ${OLD} as ordinary text\n[]\n`)
useProfile(sender, home)
const original = exportBackup()
const originalBytes = JSON.stringify(original)
const manifestOf = backup => backup.files.find(f => f.path === 'package.json').json
const receiver = profileAt(home, 'npm-machine', { [NEW]: '~1.5.0', 'target-only': '4.0.0' }, [NEW])
installed(receiver, NEW, '1.5.0')
installed(receiver, 'present')

await test('the current package, not a separate old Git or upstream profile, resolves the existing Plus settings, exports and undo', () => {
  installed(profileAt(home, 'upstream-only'), UPSTREAM)
  const work = join(receiver, '.dsh-config-sync-plus')
  mkdirSync(join(work, 'exports'), { recursive: true })
  writeJson(join(work, 'exports', 'from-plus.json'), original)
  mkdirSync(join(work, 'undo', '0001'), { recursive: true })
  writeJson(join(work, 'undo', '0001', 'manifest.json'), { createdAt: '2020-01-01', entries: [] })
  writeJson(join(work, 'settings.json'), { gistId: TEST_GIST_ID, includeMachine: true })
  noHint(home)
  assert.equal(resolveProfile().dir, receiver)
  assert.equal(resolveProfile().source, 'profile with this plugin installed')
  assert.equal(settingsPath(), join(work, 'settings.json'))
  assert.equal(readSettings().gistId, TEST_GIST_ID)
  assert.equal(undoStatus().stamp, '0001')
  assert.equal(WORK_DIR, '.dsh-config-sync-plus')
  assert.deepEqual(json(join(work, 'exports', 'from-plus.json')), original)
  assert.ok(!exportBackup().files.some(f => f.path.includes(WORK_DIR)))
})

await test('no implicit old-only profile; ambiguous new installations need matching module provenance or an explicit profile', async () => {
  for (const name of [OLD, UPSTREAM]) {
    const root = join(home, `${name}-in-isolation`)
    noHint(root)
    profileAt(root, 'not-this-process', { [name]: '1.0.0' }, [])
    assert.throws(resolveProfile, { code: 'no-profile' })
    // A second profile is not permission to pick the one holding the old package either.
    installed(profileAt(root, 'elsewhere'), name)
    assert.throws(resolveProfile, { code: 'no-profile' })
  }
  const aliasHome = join(home, 'wrong-package')
  noHint(aliasHome)
  const alias = installed(profileAt(aliasHome, 'alias-only'), NEW)
  writeJson(pkgFile(alias), { name: OLD, version: '1.4.1' })
  assert.throws(resolveProfile, { code: 'no-profile' }, 'a directory named after the new package is not enough')
  const root = join(home, 'two-new-copies')
  const a = profileAt(root, 'one'), b = profileAt(root, 'two')
  installed(a, NEW); const loaded = installed(b, NEW)
  noHint(root)
  assert.throws(resolveProfile, { code: 'no-profile' }, 'a separate source checkout has no unique match')
  mkdirSync(join(loaded, 'lib'))
  for (const file of ['backup.js', 'errors.js']) copyFileSync(new URL(`../lib/${file}`, import.meta.url), join(loaded, 'lib', file))
  const realCopy = await import(pathToFileURL(join(loaded, 'lib', 'backup.js')).href)
  assert.equal(realCopy.resolveProfile().dir, b)
  useProfile(a, root)
  assert.equal(realCopy.resolveProfile().dir, a, 'explicit profile wins over installation heuristics')
})

// A manager that records the precise installer handoff and represents successful
// installs by writing a tiny manifest in the fixture. No package code is fetched or run.
function fixtureManager(dir, permitted) {
  const calls = []
  return { calls,
    listPlugins: () => [], listBundles: () => [],
    async installBundle(spec, options) {
      calls.push({ spec, options, manifestBefore: json(pkgFile(dir)) })
      const pair = permitted.find(([name, version]) => `${name}@${version}` === spec)
      assert.ok(pair, `unexpected installer target: ${spec}`)
      const [name, version] = pair
      installed(dir, name, version)
      const manifest = json(pkgFile(dir))
      writeJson(pkgFile(dir), { ...manifest, dependencies: { ...manifest.dependencies, [name]: version } })
      return { changed: true, application: 'applied' }
    },
  }
}

await test('a pinned-Git export previews skipped self entries and only confirms real third-party gaps; old, new and local-only targets never reach the installer', async () => {
  useProfile(receiver, home)
  assert.equal(manifestOf(original).dependencies[OLD], GIT)
  assert.ok(manifestOf(original).dsh.profile.bundles.includes(OLD))
  const manager = fixtureManager(receiver, [[UPSTREAM, '1.0.2'], [OTHER, '2.3.4']])
  const session = createRestoreSession({ pluginManager: manager })
  try {
    const before = readFileSync(pkgFile(receiver), 'utf8')
    const plan = await session.preview({ id: TEST_GIST_ID }, validateBackup(original))
    assert.deepEqual(plan.plugins.installed, ['present'])
    assert.deepEqual(plan.plugins.missing.map(p => [p.name, p.installSpec]), [[UPSTREAM, `${UPSTREAM}@1.0.2`], [OTHER, `${OTHER}@2.3.4`]])
    const skips = plan.preview.dropped.filter(f => f.code === 'legacy-sync-package')
    assert.equal(skips.length, 2)
    assert.ok(['dependencies', 'dsh.profile.bundles'].every(field => skips.some(s => s.path.includes(field) && s.path.includes(OLD))))
    assert.ok(!plan.preview.manifest.bundlesAdded.includes(OLD))
    await assert.rejects(session.confirm(plan.planId, false), { code: 'invalid' })
    assert.equal(manager.calls.length, 0)
    assert.equal(readFileSync(pkgFile(receiver), 'utf8'), before)
    const result = await session.confirm(plan.planId, true)
    assert.deepEqual(result.report.dropped, plan.preview.dropped, 'all reasons including local-policy exclusions survive confirmation')
    assert.deepEqual(manager.calls.map(call => call.spec), [`${UPSTREAM}@1.0.2`, `${OTHER}@2.3.4`])
    assert.deepEqual(manager.calls.map(call => call.options.enabled), [true, false])
    for (const call of manager.calls) {
      assert.equal(call.manifestBefore.dependencies[NEW], '~1.5.0')
      assert.ok(!Object.hasOwn(call.manifestBefore.dependencies, OLD) && !call.manifestBefore.dsh.profile.bundles.includes(OLD))
      assert.ok(!Object.hasOwn(call.options, 'approvedBuilds'))
    }
    assert.equal(result.complete, true)
    assert.deepEqual(json(pkgFile(receiver)).dsh.profile.bundles, [NEW, UPSTREAM])
    assert.equal(JSON.stringify(original), originalBytes)
    await assert.rejects(session.confirm(plan.planId, true), { code: 'stale-plan' })
  } finally { session.dispose() }
})

await test('full local/cloud previews, confirmation and undo preserve receiver self specs/selection in a mixed backup; upstream and other config retain normal semantics', () => {
  const mixed = structuredClone(original)
  const fields = ['devDependencies', 'optionalDependencies', 'peerDependencies']
  const incoming = manifestOf(mixed)
  incoming.dependencies[NEW] = '9.9.9'
  incoming.dsh.profile.bundles.push(NEW)
  for (const field of fields) incoming[field] = { [OLD]: GIT, [NEW]: '9.9.9', 'other-library': '2.0.0' }
  const sourceBytes = JSON.stringify(mixed)
  for (const mode of ['local', 'config']) {
    const target = profileAt(home, `mixed-${mode}`, { [NEW]: '~1.5.0', [UPSTREAM]: '1.0.0' }, [])
    useProfile(target, home)
    const current = json(pkgFile(target))
    for (const field of fields) current[field] = { [NEW]: '~1.5.0', 'other-library': '1.0.0' }
    writeJson(pkgFile(target), current)
    const before = readFileSync(pkgFile(target), 'utf8')
    const session = createRestoreSession({ get() { throw new Error('no manager in a configuration-only restore') } })
    try {
      const doc = validateBackup(mixed)
      const plan = mode === 'local' ? session.previewLocal(doc) : session.previewConfig({ id: TEST_GIST_ID }, doc)
      for (const [name, code] of [[OLD, 'legacy-sync-package'], [NEW, 'local-sync-package']]) {
        const skipped = plan.preview.dropped.filter(row => row.code === code)
        assert.ok(['dependencies', ...fields, 'dsh.profile.bundles'].every(field => skipped.some(row => row.path.includes(field) && row.path.endsWith(name))))
        assert.ok(!plan.preview.manifest.dependenciesAdded.includes(name) && !plan.preview.manifest.bundlesAdded.includes(name))
      }
      assert.equal(readFileSync(pkgFile(target), 'utf8'), before)
      const { report } = mode === 'local' ? session.confirmLocal(plan.planId, true) : session.confirmConfig(plan.planId, true)
      assert.deepEqual(report.dropped, plan.preview.dropped)
      assert.equal(report.droppedEntries, plan.preview.dropped.length)
      const after = json(pkgFile(target))
      for (const field of ['dependencies', ...fields]) {
        assert.ok(!Object.hasOwn(after[field], OLD))
        assert.equal(after[field][NEW], '~1.5.0')
      }
      for (const field of fields) assert.equal(after[field]['other-library'], '2.0.0')
      assert.equal(after.dependencies[UPSTREAM], '1.0.2')
      assert.deepEqual(after.dsh.profile.bundles, [UPSTREAM], 'neither sync package was enabled')
      assert.equal(readFileSync(join(target, 'cordis.patch.yml'), 'utf8'), readFileSync(join(sender, 'cordis.patch.yml'), 'utf8'))
      assert.ok(!existsSync(join(target, 'node_modules', UPSTREAM)), 'configuration-only is not an installation')
      undoLastRestore()
      assert.equal(readFileSync(pkgFile(target), 'utf8'), before)
      assert.equal(JSON.stringify(mixed), sourceBytes)
      assert.deepEqual(manifestOf(doc), manifestOf(mixed), 'the validated source is not rewritten either')
    } finally { session.dispose() }
  }
})

await test('a restore differing only by ignored self declarations leaves a matching local manifest byte-for-byte intact with no undo point', () => {
  const target = profileAt(home, 'self-only-difference', { [NEW]: '~1.5.0' }, [NEW])
  useProfile(target, home)
  const here = json(pkgFile(target))
  here.devDependencies = { [NEW]: '~1.5.0', helper: '1.0.0' }
  here.optionalDependencies = { 'receiver-only': '1.0.0' }
  writeJson(pkgFile(target), here)
  const before = readFileSync(pkgFile(target), 'utf8')
  const doc = { ...original, files: [{ path: 'package.json', json: {
    ...here, dependencies: { [OLD]: GIT }, dsh: { profile: { bundles: [OLD] } },
    devDependencies: { [OLD]: GIT, [NEW]: '9.9.9', helper: '1.0.0' }, optionalDependencies: { [OLD]: GIT },
  } }] }
  assert.equal(planRestore(doc).counts.identical, 1)
  const { report, undoDir } = applyRestore(doc)
  assert.ok(report.dropped.some(row => row.code === 'legacy-sync-package'))
  assert.equal(report.restored, 0)
  assert.equal(undoDir, null)
  assert.equal(readFileSync(pkgFile(target), 'utf8'), before)
})

await test('local/tool restore never synthesizes a new npm spec or claims legacy was installed on a machine with neither declaration', () => {
  const target = profileAt(home, 'neither')
  useProfile(target, home)
  const doc = validateBackup(original)
  const plan = planRestore(doc)
  const { report } = applyRestore(doc)
  assert.deepEqual(report.dropped, plan.dropped)
  const saved = json(pkgFile(target))
  for (const name of [OLD, NEW]) assert.ok(!Object.hasOwn(saved.dependencies, name) && !saved.dsh.profile.bundles.includes(name))
  assert.equal(saved.dependencies[OTHER], '2.3.4')
  assert.equal(manifestOf(doc).dependencies[OLD], GIT)
})

await test('stale local declarations stay visibly missing but are never submitted to the installer, even if a caller offers them; other installs honor their allowlist', async () => {
  const target = profileAt(home, 'residue', { [OLD]: GIT, [NEW]: '1.5.0', [OTHER]: '2.3.4', 'not-approved': '7.0.0' })
  useProfile(target, home)
  const manager = fixtureManager(target, [[OTHER, '2.3.4']])
  const ctx = { pluginManager: manager }
  const list = await pluginInventory(ctx)
  assert.deepEqual(list.installed, [])
  for (const [name, reason] of [[OLD, 'legacy-sync-package'], [NEW, 'local-sync-package']]) {
    const row = list.missing.find(p => p.name === name)
    assert.deepEqual([row.resolvable, row.installSpec, row.note], [false, null, reason])
  }
  const approved = new Map([[OLD, GIT], [NEW, `${NEW}@1.5.0`], [OTHER, `${OTHER}@2.3.4`]])
  const result = await installMissingPlugins(ctx, { approved })
  assert.deepEqual(manager.calls.map(call => call.spec), [`${OTHER}@2.3.4`])
  assert.deepEqual(result.installed, [OTHER])
  assert.deepEqual(result.results.filter(row => row.outcome === 'skipped').map(row => row.message), ['legacy-sync-package', 'local-sync-package', 'stale-plan'])
  assert.deepEqual(json(pkgFile(target)).dsh.profile.bundles, [])
  assert.equal(JSON.stringify(original), originalBytes)
})

process.exitCode = finish()
