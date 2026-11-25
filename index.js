/**
 * Host half of dsh-profile-gist-sync-plus.
 *
 * The settings page and the `config_backup_plus` agent tool share the backup
 * format and Gist transport. The combined restore-and-install flow belongs to
 * the settings page; the agent tool never installs packages.
 *
 * `webServer` is a hard dependency — without it there is no settings page to
 * serve. `tools` and `connection` are read optionally, so the plugin still
 * activates on a host that publishes neither.
 */
import { registerRoutes } from './lib/routes.js'
import { registerTool } from './lib/tool.js'
import { rememberProfile } from './lib/backup.js'

export const inject = ['webServer']

/**
 * The profile this process is actually working on.
 *
 * A plugin cannot assume the profile is in the environment: DSH Desktop starts
 * the host as `... dsh-desktop-host ... <profile directory> ...` with no
 * profile variables at all (the `DSH_*` a shell tool sees are injected per
 * call). The launcher does publish `profileContext`, whose `name`/`dir` are
 * read defensively here — undocumented extras, so every field is checked and a
 * bad shape is ignored rather than trusted. `lib/backup.js` falls back to the
 * environment, the host's argument list, and the profile that has this plugin
 * installed.
 */
function reportProfile(ctx) {
  let context = null
  try {
    context = ctx.get('profileContext')
  } catch {
    // A host without this service is normal: lib/backup.js has other sources.
    return null
  }
  if (context === null || typeof context !== 'object') return null
  const name = typeof context.name === 'string' ? context.name.trim() : ''
  const dir = typeof context.dir === 'string' ? context.dir.trim() : ''
  if (dir === '') return null
  return rememberProfile({ name, dir })
}

export function apply(ctx) {
  // A plain call, NOT ctx.effect: remembering where the profile is creates no
  // resource, and an effect callback must return a disposer — Cordis fails the
  // whole activation with "Invalid effect" when one returns anything else.
  reportProfile(ctx)
  ctx.effect(() => registerRoutes(ctx), 'dsh-profile-gist-sync-plus: HTTP routes')
  ctx.effect(() => registerTool(ctx), 'dsh-profile-gist-sync-plus: config_backup_plus tool')
}
