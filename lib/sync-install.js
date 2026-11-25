/** Reviewed restore snapshots. Only the combined cloud flow can confirm an installation. */
import { createHash, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { applyRestore, backupForRestore, existingBackupFile, planRestore, profileRoot } from './backup.js'
import { ConfigSyncError } from './errors.js'
import { declarationsFromManifest, installMissingPlugins, pluginInventory, validPackageName } from './plugins.js'
import { writeSettings } from './store.js'

const PLAN_TTL_MS = 5 * 60_000
const stale = () => new ConfigSyncError('This preview expired or the local state changed. Preview the restore again.', 'stale-plan')
const busyError = () => new ConfigSyncError('Another restore or installation is running.', 'busy')

// Standard DSH state plus additional plugins' ordinary text configuration. Do
// not bring across package-manager policy, env files or unmanaged executables.
function isConfiguration(path) {
  const basename = path.split('/').at(-1).toLowerCase()
  if (basename.startsWith('.') || /^(?:package(?:-lock)?\.json|npm-shrinkwrap\.json|pnpm-workspace\.ya?ml|pnpmfile\..+|yarn\.lock)$/.test(basename)) return false
  return /^(?:data|suppliers|config|presets)\//.test(path) || /\.(?:ya?ml|jsonc?|toml|ini|conf|cfg|xml|md|txt)$/i.test(path)
}

/**
 * The installer must run under THIS machine's package-manager policy. In
 * particular, writing all incoming deps first would let the first pnpm add
 * resolve every spec, including ones the preview marked unresolvable. Give
 * DSH each approved dependency individually; keep the local manifest's other
 * fields and apply only the portable bundle selection from the remote manifest.
 * Config-only restore remains the upstream full-profile operation.
 */
function portableConfiguration(source) {
  // Filter before deriving either bundle selections or the install allowlist.
  const backup = backupForRestore(source)
  const incoming = backup.files.find(file => file.path === 'package.json').json
  const declarations = declarationsFromManifest(incoming)
  const wanted = declarations.filter(row => row.kind !== 'dependency' && validPackageName(row.name)).map(row => row.name)
  const dropped = [...(backup.dropped ?? [])]
  const files = []
  for (const file of backup.files) {
    if (file.path === 'package.json') {
      files.push({ path: file.path, json: { dsh: { profile: { bundles: wanted } } } })
    } else if (isConfiguration(file.path)) {
      files.push(file)
    } else {
      // Root dotfiles (including .npmrc), pnpm workspace policy/hooks and other
      // unmanaged profile files stay local instead of affecting this install.
      dropped.push({ path: file.path, code: 'local-policy' })
    }
  }
  return { config: { ...backup, files, dropped, droppedEntries: dropped.length }, declarations, wanted }
}

/** Bind consent to the profile and every target's bytes (or absence). Only an install plan also binds a missing list. */
function fingerprint(config, plugins) {
  const root = profileRoot()
  const hash = createHash('sha256').update(root)
  for (const file of config.files) {
    const bytes = existingBackupFile(root, file.path)
    const digest = bytes === null ? null : createHash('sha256').update(bytes).digest('hex')
    hash.update(JSON.stringify([file.path, digest]))
  }
  if (plugins) hash.update(JSON.stringify([plugins.available, plugins.missing?.map(p => [p.name, p.installSpec, p.note])]))
  return hash.digest('hex')
}

/** applyRestore revalidates retained files; preserve the omissions the user actually reviewed. */
function restoreValidatedFiles(config) {
  const { report } = applyRestore(config)
  // Revalidation sees only retained files. Keep prior file/policy omissions
  // as well as any self declarations filtered by the full-profile restore.
  report.dropped = [...(config.dropped ?? []), ...report.dropped]
  report.droppedEntries = report.dropped.length
  return report
}

/** Recording cloud history is not part of committing the files. Local imports never call this. */
export function restoreGistConfiguration(ref, config, { bindUploadTarget = false } = {}) {
  const report = restoreValidatedFiles(config)
  const warnings = []
  try {
    // Reviewing a restore source is not consent to use it for future uploads.
    // Only the legacy one-call /sync route also remembers it as the target.
    writeSettings({
      ...(bindUploadTarget ? { gistId: ref.id } : {}),
      lastSync: { gistId: ref.id, at: new Date().toISOString(), files: report.restored, counts: report.counts, source: 'gist', remoteUpdatedAt: ref.updatedAt ?? null },
    })
  } catch (error) {
    warnings.push(`Configuration restored, but sync history could not be saved: ${error.message}`)
  }
  const { add, overwrite, merge } = report.counts
  return { ref, report, warnings, restart: add + overwrite + merge > 0 }
}

/** One expiring, one-use in-memory snapshot for one mode. Other modes cannot take its plan ID. */
function createPlanSlot() {
  let pending = null
  let expiry = null
  function clear() { pending = null; clearTimeout(expiry); expiry = null }
  return {
    clear,
    save(snapshot) {
      clear()
      const planId = randomUUID()
      pending = { ...snapshot, planId, endsAt: Date.now() + PLAN_TTL_MS }
      expiry = setTimeout(clear, PLAN_TTL_MS)
      expiry.unref?.()
      return planId
    },
    take(planId) {
      if (!pending || pending.planId !== planId) throw stale()
      const plan = pending
      clear() // consume before any await or write, including an attempt that later fails
      if (Date.now() >= plan.endsAt) throw stale()
      return plan
    },
  }
}

/** The three review modes have independent plan slots and share this route registration’s single writer. */
export function createRestoreSession(ctx) {
  const combined = createPlanSlot()
  const configOnly = createPlanSlot()
  const local = createPlanSlot()
  let busy = false
  let disposed = false
  function requireIdle() { if (busy || disposed) throw busyError() }
  function verify(plan, plugins) {
    if (disposed || fingerprint(plan.config, plugins) !== plan.digest || Date.now() >= plan.endsAt) throw stale()
  }
  // Full configuration review, with no package-manager filtering or inventory.
  // Only a cloud slot needs source metadata; neither slot retains a token.
  function previewFiles(slot, config, source) {
    requireIdle()
    const digest = fingerprint(config)
    const preview = planRestore(config)
    const planId = slot.save({ config, digest, ...source })
    return { planId, preview }
  }
  function takeFiles(slot, planId, confirm) {
    if (confirm !== true) throw new ConfigSyncError('Review the plan and explicitly confirm the configuration restore.', 'invalid')
    const plan = slot.take(planId)
    verify(plan)
    return plan
  }
  return {
    dispose() { disposed = true; combined.clear(); configOnly.clear(); local.clear() },
    lock() {
      requireIdle()
      busy = true
      return () => { busy = false }
    },
    previewConfig(ref, backup) { return { ...previewFiles(configOnly, backup, { ref }), ref } },
    confirmConfig(planId, confirm) {
      const plan = takeFiles(configOnly, planId, confirm)
      return restoreGistConfiguration(plan.ref, plan.config)
    },
    previewLocal(backup) { return previewFiles(local, backup) },
    confirmLocal(planId, confirm) {
      const plan = takeFiles(local, planId, confirm)
      return { report: restoreValidatedFiles(plan.config) }
    },
    async preview(ref, backup) {
      requireIdle()
      const { config, declarations, wanted } = portableConfiguration(backup)
      const plugins = await pluginInventory(ctx, declarations)
      requireIdle()
      const preview = planRestore(config)
      if (!plugins.available) {
        combined.clear()
        return { planId: null, ref, preview, plugins }
      }
      const planId = combined.save({ ref, config, declarations, wanted, digest: fingerprint(config, plugins) })
      return { planId, ref, preview, plugins }
    },
    async confirm(planId, confirm) {
      if (confirm !== true) throw new ConfigSyncError('Review the plan and explicitly confirm the restore and installation.', 'invalid')
      const plan = combined.take(planId)
      const { ref, config, declarations, wanted } = plan
      const pluginsBefore = await pluginInventory(ctx, declarations)
      if (!pluginsBefore.available) throw stale()
      verify(plan, pluginsBefore)
      const approved = new Map(pluginsBefore.missing.filter(row => row.resolvable).map(row => [row.name, row.installSpec]))
      const current = JSON.parse(readFileSync(join(profileRoot(), 'package.json'), 'utf8'))
      const localBundles = current?.dsh?.profile?.bundles
      const selected = new Set([...(Array.isArray(localBundles) ? localBundles : []), ...wanted])
      const restored = restoreGistConfiguration(ref, config) // if writing fails, do not start an installation
      let plugins
      try {
        plugins = await installMissingPlugins(ctx, { declarations, approved, selected })
      } catch (error) {
        // The configuration is already on disk and can be undone. Never report
        // an installer/inventory error as if the restore had not happened.
        restored.warnings.push(String(error.message ?? error))
        plugins = { available: false, reason: 'plugin-manager-error', results: [], restart: false }
      }
      const restart = restored.restart || plugins.results.some(row => row.application === 'restart-required')
      const complete = plugins.available && plugins.counts?.missing === 0 && plugins.results.every(row =>
        (row.outcome === 'installed' || row.outcome === 'already-present') && row.pendingBuilds.length === 0)
      return { ...restored, plugins, restart, complete: complete === true }
    },
  }
}
