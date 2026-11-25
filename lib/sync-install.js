/** One reviewed cloud snapshot. Only the UI can confirm installing packages. */
import { createHash, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { applyRestore, existingBackupFile, planRestore, profileRoot } from './backup.js'
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
function portableConfiguration(backup) {
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

/** Bind consent to the profile, its affected bytes and the exact missing list. */
function fingerprint(config, plugins) {
  const root = profileRoot()
  const hash = createHash('sha256').update(root)
  for (const file of config.files) {
    const bytes = existingBackupFile(root, file.path)
    const digest = bytes === null ? null : createHash('sha256').update(bytes).digest('hex')
    hash.update(JSON.stringify([file.path, digest]))
  }
  hash.update(JSON.stringify([plugins.available, plugins.missing?.map(p => [p.name, p.installSpec, p.note])]))
  return hash.digest('hex')
}

/** One bounded in-memory plan per mounted route. No GitHub token is retained. */
export function createRestoreSession(ctx) {
  let pending = null
  let expiry = null
  let busy = false
  let disposed = false
  function clear() { pending = null; clearTimeout(expiry); expiry = null }
  return {
    dispose() { disposed = true; clear() },
    lock() {
      if (busy || disposed) throw busyError()
      busy = true
      return () => { busy = false }
    },
    async preview(ref, backup) {
      if (busy || disposed) throw busyError()
      const { config, declarations, wanted } = portableConfiguration(backup)
      const plugins = await pluginInventory(ctx, declarations)
      if (busy || disposed) throw busyError()
      const preview = planRestore(config)
      clear()
      if (!plugins.available) return { planId: null, ref, preview, plugins }
      const planId = randomUUID()
      pending = { planId, endsAt: Date.now() + PLAN_TTL_MS, ref, config, declarations, wanted, digest: fingerprint(config, plugins) }
      expiry = setTimeout(clear, PLAN_TTL_MS)
      expiry.unref?.()
      return { planId, ref, preview, plugins }
    },
    async confirm(planId, confirm) {
      if (confirm !== true) throw new ConfigSyncError('Review the plan and explicitly confirm the restore and installation.', 'invalid')
      if (!pending || pending.planId !== planId) throw stale()
      const plan = pending
      clear() // consume before the first await; no retry/replay can install twice
      if (Date.now() >= plan.endsAt || disposed) throw stale()
      const { ref, config, declarations, wanted } = plan
      const pluginsBefore = await pluginInventory(ctx, declarations)
      if (!pluginsBefore.available || disposed || Date.now() >= plan.endsAt || fingerprint(config, pluginsBefore) !== plan.digest) throw stale()
      const approved = new Map(pluginsBefore.missing.filter(row => row.resolvable).map(row => [row.name, row.installSpec]))
      const current = JSON.parse(readFileSync(join(profileRoot(), 'package.json'), 'utf8'))
      const localBundles = current?.dsh?.profile?.bundles
      const selected = new Set([...(Array.isArray(localBundles) ? localBundles : []), ...wanted])
      const { report } = applyRestore(config) // if writing fails, do not start an installation
      report.dropped = config.dropped
      report.droppedEntries = config.droppedEntries
      const warnings = []
      try {
        writeSettings({ gistId: ref.id, lastSync: { at: new Date().toISOString(), files: report.restored, counts: report.counts, source: 'gist', remoteUpdatedAt: ref.updatedAt ?? null } })
      } catch (error) {
        warnings.push(`Configuration restored, but sync history could not be saved: ${error.message}`)
      }
      let plugins
      try {
        plugins = await installMissingPlugins(ctx, { declarations, approved, selected })
      } catch (error) {
        // The configuration is already on disk and can be undone. Never report
        // an installer/inventory error as if the restore had not happened.
        warnings.push(String(error.message ?? error))
        plugins = { available: false, reason: 'plugin-manager-error', results: [], restart: false }
      }
      const { add, overwrite, merge } = report.counts
      const restart = add + overwrite + merge > 0 || plugins.results.some(row => row.application === 'restart-required')
      const complete = plugins.available && plugins.counts?.missing === 0 && plugins.results.every(row =>
        (row.outcome === 'installed' || row.outcome === 'already-present') && row.pendingBuilds.length === 0)
      return { ref, report, plugins, warnings, restart, complete: complete === true }
    },
  }
}
