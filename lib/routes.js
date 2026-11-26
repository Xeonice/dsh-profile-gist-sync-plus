/**
 * The Host half's HTTP surface.
 *
 * Every route lives under one `prefix` registration on the bare web server,
 * so admission and disposal happen in one place.
 *
 * Admission: the request must pass the host's own gate when the host publishes
 * one (`connection.requestRejection` covers its Host/Origin fence and its
 * browser login), and its Host — when the transport preserves one — must be
 * loopback or an authority the deployment declared. That is the same rule the
 * shipped API fence applies; these routes are exact matches on the bare web
 * server, so they never pass through that fence themselves.
 */
import {
  BACKUP_FILENAME, GIST_MAX_BYTES, MAX_BACKUP_BYTES, WORK_DIR,
  applyRestore, backupBytes, collectProfileFiles, exportBackupWithReport, planRestore,
  profileName, profileRoot, profileSource, readBackupFile, undoLastRestore, undoStatus, validateBackup,
} from './backup.js'
import { createGist, parseGistId, readGist, resolveTokenSource, tokenSourceNames, updateGist, verifyToken } from './gist.js'
import { ConfigSyncError, describeError, statusOf } from './errors.js'
import { installMissingPlugins, pluginInventory, validPackageName } from './plugins.js'
import { readSettings, settingsPath, writeSettings } from './store.js'
import { createRestoreSession, restoreGistConfiguration } from './sync-install.js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Read the plugin's own shipped manifest, not the working directory or profile.
const PACKAGE_VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version

/** The one route prefix this plugin owns. */
export const BASE_PATH = '/dsh-profile-gist-sync-plus'
/** Largest request body accepted for an import (a backup plus JSON framing). */
const MAX_BODY_BYTES = 4 * 1024 * 1024

/** Register this plugin's routes; the returned disposer removes them. */
export function registerRoutes(ctx) {
  const webServer = ctx.get('webServer')
  if (webServer === undefined || webServer === null) return () => {}
  const session = createRestoreSession(ctx)
  const unregister = webServer.register({
    kind: 'prefix',
    path: BASE_PATH,
    handler: (request, response) => { void handleRequest(ctx, session, request, response) },
  })
  return () => { session.dispose(); return unregister() }
}

/** Write a JSON payload with no-store caching. */
function sendJson(response, status, payload) {
  const body = JSON.stringify(payload)
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
  })
  response.end(body)
}

const NDJSON = 'application/x-ndjson'
const count = n => Number.isSafeInteger(n) && n >= 0

// An ordinary browser/old Client asking for */* still receives its original JSON.
function acceptsProgress(accept) {
  return typeof accept === 'string' && accept.split(',').some(range => {
    const [media, ...params] = range.toLowerCase().split(';').map(s => s.trim())
    const q = params.find(p => /^q\s*=/.test(p))
    return media === NDJSON && (q === undefined || Number(q.slice(q.indexOf('=') + 1)) > 0)
  })
}

// Do not serialize arbitrary internal objects onto the progress channel. In
// particular a source URL, path, plan ID or installation log is not a progress field.
function progressFrame(p) {
  if (p?.stage === 'check' || p?.stage === 'write') return { type: 'progress', stage: p.stage }
  if (!count(p?.files)) return null
  if (p.stage === 'verify') {
    const meter = count(p.processed) && count(p.total) && p.total > 0 && p.processed <= p.total
      ? { processed: p.processed, total: p.total } : {}
    return { type: 'progress', stage: 'verify', files: p.files, ...meter }
  }
  if (p.stage !== 'install' || !count(p.processed) || !count(p.total) || p.total === 0 || p.processed > p.total
    || !(p.current === null || validPackageName(p.current))) return null
  return { type: 'progress', stage: 'install', files: p.files, processed: p.processed, total: p.total, current: p.current }
}

/** Same one-use operation for both protocols. Never start a second write to obtain progress or to recover a receipt. */
async function confirmReviewed(request, response, body, apply) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(k => k !== 'planId' && k !== 'confirm')) {
    throw new ConfigSyncError('A reviewed restore accepts only the plan ID and confirmation.', 'invalid')
  }
  if (!acceptsProgress(request.headers.accept)) {
    sendJson(response, 200, await apply(body.planId, body.confirm))
    return
  }
  // The route's independent writer lock belongs to the operation, not the
  // socket. A closed tab discards feedback; it does not cancel or repeat work.
  let disconnected = false
  const detach = () => { disconnected = true }
  response.once('error', detach)
  response.once('close', detach)
  const send = (frame, final = false) => {
    if (disconnected || response.destroyed || response.writableEnded || (!final && response.writableNeedDrain)) return
    if (!response.headersSent) response.writeHead(200, {
      'content-type': `${NDJSON}; charset=utf-8`, 'cache-control': 'no-store, no-transform',
      'x-accel-buffering': 'no', 'x-content-type-options': 'nosniff', vary: 'Accept',
    })
    const line = `${JSON.stringify(frame)}\n`
    if (final) response.end(line)
    else {
      // Flush each small stage as one HTTP chunk now, rather than leaving the
      // default next-tick cork closed during a synchronous configuration write.
      response.cork()
      try { response.write(line) } finally { response.uncork() }
    }
  }
  try {
    const result = await apply(body.planId, body.confirm, event => {
      const frame = progressFrame(event)
      if (frame) send(frame)
    })
    send({ type: 'result', result }, true)
  } catch (error) {
    // Preserve HTTP errors before the stream starts; after that the final
    // error record, not the 200 handshake, carries the terminal outcome.
    if (disconnected || response.destroyed || response.writableEnded) return
    if (!response.headersSent) throw error
    send({ type: 'error', ...describeError(error) }, true)
  }
}

/** Read and parse a JSON request body. */
async function readJsonBody(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > MAX_BODY_BYTES) throw new ConfigSyncError('the request body is too large', 'too-large')
    chunks.push(buffer)
  }
  if (size === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new ConfigSyncError('the request body is not valid JSON', 'invalid')
  }
}

/**
 * Authorities this deployment serves besides loopback, as the host declared
 * them (`dsh web --trusted-host <name>`, plus the LAN literals it derives).
 */
function trustedHosts(ctx) {
  const connection = ctx.get('connection')
  const hosts = connection?.trustedHosts
  return Array.isArray(hosts) ? hosts.filter(host => typeof host === 'string') : []
}

/**
 * The Host/Origin rule for these routes: the request's Host must be loopback or
 * a declared authority, the fetch metadata must not say `cross-site`, and an
 * Origin, when present, must match that Host.
 */
function sameOrigin(ctx, request) {
  const host = typeof request.headers.host === 'string' ? request.headers.host : undefined
  const origin = typeof request.headers.origin === 'string' ? request.headers.origin : undefined
  const site = typeof request.headers['sec-fetch-site'] === 'string' ? request.headers['sec-fetch-site'] : undefined
  if (site === 'cross-site') return false
  // A non-browser client can set any Origin it likes, so an absent Origin is not
  // itself a refusal; the Host check is what a rebinding attacker cannot forge.
  if (origin !== undefined) {
    try {
      if (new URL(origin).host !== host) return false
    } catch {
      return false
    }
  }
  if (host === undefined) return true
  let hostname
  try {
    hostname = new URL(`http://${host}`).hostname
  } catch {
    return false
  }
  const bare = hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname
  if (bare === 'localhost' || bare === '127.0.0.1' || bare === '::1' || bare.endsWith('.localhost')) return true
  return trustedHosts(ctx).includes(hostname) || trustedHosts(ctx).includes(bare)
}

/**
 * Answer the request with the host's rejection if it has one.
 * @returns true when the request was refused and answered here.
 */
function refuseUnadmitted(ctx, request, response) {
  const connection = ctx.get('connection')
  const gate = connection?.requestRejection
  if (typeof gate === 'function') {
    let status
    try {
      status = gate.call(connection, request)
    } catch {
      // A gate that throws has not admitted anything.
      status = 403
    }
    if (typeof status === 'number') {
      sendJson(response, status, {
        error: 'DSH refused this request: not signed in, or an untrusted origin',
        code: 'auth',
      })
      return true
    }
  }
  if (!sameOrigin(ctx, request)) {
    sendJson(response, 403, {
      error: 'refused: the Host or Origin of this request is not one this deployment serves',
      code: 'auth',
    })
    return true
  }
  return false
}

/** Profile summary for the settings page. */
function statusPayload() {
  const root = profileRoot()
  const { included, excluded } = collectProfileFiles(root)
  let bytes = 0
  for (const file of included) bytes += file.bytes
  const settings = readSettings()
  return {
    profile: profileName(),
    root,
    profileSource: profileSource(),
    workDir: join(root, WORK_DIR),
    version: PACKAGE_VERSION,
    files: included,
    excluded,
    counts: {
      files: included.length,
      bytes,
      excluded: excluded.length,
      machineFiles: excluded.filter(entry => entry.code === 'machine-state').length,
    },
    limits: { maxBackupBytes: MAX_BACKUP_BYTES, gistMaxBytes: GIST_MAX_BYTES },
    gistFile: BACKUP_FILENAME,
    envTokens: tokenSourceNames(),
    undo: undoStatus(),
    // What this plugin remembers, so the page can show one plain sentence about
    // the cloud copy without asking the reader for anything.
    cloud: {
      gistId: settings.gistId,
      includeMachine: settings.includeMachine,
      lastUpload: settings.lastUpload,
      lastSync: settings.lastSync,
      settingsFile: settingsPath(),
    },
  }
}

/**
 * Which Gist this request is about: the one it names, else the remembered one,
 * else nothing (which means "create a new one" on upload and is a refusal on
 * read).
 * @param {unknown} named - the value from the request body.
 */
function targetId(named) {
  const raw = typeof named === 'string' ? named.trim() : ''
  if (raw !== '') return parseGistId(raw)
  return readSettings().gistId
}

/** Now, in the timestamp shape every record here uses. */
function now() {
  return new Date().toISOString()
}

/**
 * Serve a fresh backup as a download.
 *
 * A file download has nowhere to put the export report, so it is discarded here.
 * The export itself still drops machine-local dependency specs — the alternative
 * would be a file that breaks `pnpm install` wherever it is restored — and the
 * same report is surfaced by the upload response and by the page.
 */
function exportDownload(response, url) {
  const { backup } = exportBackupWithReport({ includeMachine: url.searchParams.get('include') === 'machine' })
  const body = `${JSON.stringify(backup, null, 2)}\n`
  const stamp = new Date().toISOString().replaceAll(':', '-').replace(/\.\d+Z$/, 'Z')
  response.writeHead(200, {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
    'content-disposition': `attachment; filename="dsh-profile-backup-${stamp}.json"`,
    'content-length': Buffer.byteLength(body),
  })
  response.end(body)
}

/** Client pairs are a constraint on the live inventory, never a list of install targets. */
async function installLocalGaps(ctx, expected) {
  if (expected === undefined) return installMissingPlugins(ctx) // legacy caller
  const invalid = () => new ConfigSyncError('expectedPackages must list unique package names with exact install specs.', 'invalid')
  if (!Array.isArray(expected)) throw invalid()
  const names = new Set()
  for (const row of expected) {
    if (!validPackageName(row?.name) || typeof row.installSpec !== 'string' || !row.installSpec.trim() || names.has(row.name)) throw invalid()
    names.add(row.name)
  }
  const inventory = await pluginInventory(ctx)
  const installable = inventory.available ? inventory.missing.filter(row => row.resolvable) : null
  if (!installable || installable.length !== expected.length || installable.some((row, i) =>
    row.name !== expected[i].name || row.installSpec !== expected[i].installSpec)) {
    throw new ConfigSyncError('The local plugin list changed or is unavailable. Check the missing packages again.', 'stale-plan')
  }
  // The installer reads local state again. Even a change after the comparison
  // cannot expand this allowlist or substitute another spec for a reviewed one.
  const approved = new Map(installable.map(row => [row.name, row.installSpec]))
  return installMissingPlugins(ctx, { approved })
}

/** Route one request. Unknown subpaths answer 404 with the same JSON shape. */
const PROFILE_WRITES = new Set(['/api/sync/install', '/api/config/restore', '/api/sync', '/api/restore', '/api/undo', '/api/plugins/install'])

async function handleRequest(ctx, session, request, response) {
  let release
  try {
    const url = new URL(request.url ?? '/', 'http://localhost')
    if (!url.pathname.startsWith(`${BASE_PATH}/`)) {
      sendJson(response, 404, { error: 'not found', code: 'notfound' })
      return
    }
    if (refuseUnadmitted(ctx, request, response)) return
    const route = url.pathname.slice(BASE_PATH.length)
    const method = request.method ?? 'GET'
    if (method === 'POST' && PROFILE_WRITES.has(route)) release = session.lock()

    if (method === 'POST' && (route === '/api/sync/preview' || route === '/api/config/preview')) {
      const body = await readJsonBody(request)
      const id = targetId(body?.id)
      if (!id) throw new ConfigSyncError('Set the Gist ID or link on this machine first.', 'no-cloud')
      const { token } = await resolveTokenSource(body?.token)
      const { ref, backup } = await readGist(token, id)
      const plan = route === '/api/config/preview' ? session.previewConfig(ref, backup) : await session.preview(ref, backup)
      sendJson(response, 200, plan)
      return
    }
    if (method === 'POST' && (route === '/api/sync/install' || route === '/api/config/restore')) {
      const body = await readJsonBody(request)
      await confirmReviewed(request, response, body, route === '/api/config/restore' ? session.confirmConfig : session.confirm)
      return
    }

    if (route === '/api/status' && method === 'GET') {
      sendJson(response, 200, statusPayload())
      return
    }
    if (route === '/api/export' && method === 'GET') {
      exportDownload(response, url)
      return
    }
    if (route === '/api/plugins' && method === 'GET') {
      // Read-only, and deliberately a route of its own: it consults the host's
      // plugin manager, which a status refresh has no business doing.
      sendJson(response, 200, await pluginInventory(ctx))
      return
    }
    if (route === '/api/plugins/install' && method === 'POST') {
      const body = await readJsonBody(request)
      sendJson(response, 200, await installLocalGaps(ctx, body?.expectedPackages))
      return
    }
    if (route === '/api/preview' && method === 'POST') {
      const body = await readJsonBody(request)
      const backup = validateBackup(body?.backup)
      sendJson(response, 200, body?.reviewed === true ? session.previewLocal(backup) : { preview: planRestore(backup) })
      return
    }
    if (route === '/api/restore' && method === 'POST') {
      const body = await readJsonBody(request)
      if (body?.planId !== undefined) {
        if (body.backup !== undefined) throw new ConfigSyncError('A reviewed import accepts a plan ID, not a replacement backup.', 'invalid')
        await confirmReviewed(request, response, body, session.confirmLocal)
        return
      }
      if (body?.confirm !== true) {
        throw new ConfigSyncError('restoring requires an explicit confirmation', 'invalid')
      }
      const { report } = applyRestore(body?.backup)
      sendJson(response, 200, { report })
      return
    }
    if (route === '/api/undo' && method === 'POST') {
      const body = await readJsonBody(request)
      if (body?.expectedStamp !== undefined) {
        if (typeof body.expectedStamp !== 'string' || !body.expectedStamp.trim()) throw new ConfigSyncError('expectedStamp must name the reviewed undo snapshot.', 'invalid')
        if (undoStatus()?.stamp !== body.expectedStamp) throw new ConfigSyncError('The undo snapshot changed. Review the latest restore before undoing it.', 'stale-plan')
      }
      sendJson(response, 200, { report: undoLastRestore() })
      return
    }
    if (route === '/api/file/read' && method === 'POST') {
      const body = await readJsonBody(request)
      const backup = readBackupFile(String(body?.path ?? ''))
      sendJson(response, 200, { backup, preview: planRestore(backup) })
      return
    }
    if (route === '/api/settings' && method === 'POST') {
      const body = await readJsonBody(request)
      const patch = {}
      if (body?.gistId !== undefined) {
        // An empty value clears the remembered cloud copy, which is how the page
        // starts over with a different Gist.
        const raw = typeof body.gistId === 'string' ? body.gistId.trim() : ''
        patch.gistId = raw === '' ? null : parseGistId(raw)
      }
      if (body?.includeMachine !== undefined) patch.includeMachine = body.includeMachine === true
      const stored = writeSettings(patch)
      sendJson(response, 200, {
        cloud: {
          gistId: stored.gistId,
          includeMachine: stored.includeMachine,
          lastUpload: stored.lastUpload,
          lastSync: stored.lastSync,
          settingsFile: settingsPath(),
        },
      })
      return
    }
    if (route === '/api/gist/token' && method === 'POST') {
      const body = await readJsonBody(request)
      const resolved = await resolveTokenSource(body?.token)
      const login = await verifyToken(resolved.token)
      if (!login) throw new ConfigSyncError('GitHub did not identify an account for this token.', 'auth')
      sendJson(response, 200, { source: resolved.source, login })
      return
    }
    if (route === '/api/gist/upload' && method === 'POST') {
      const body = await readJsonBody(request)
      const resolved = await resolveTokenSource(body?.token)
      const { backup, dropped, droppedEntries } = exportBackupWithReport({ includeMachine: body?.includeMachine === true })
      const content = `${JSON.stringify(backup, null, 2)}\n`
      const id = targetId(body?.id)
      // The upload preview names either a particular Gist or a new one (null).
      // Compare at the point of selecting the destination, before either write.
      if (body?.expectedTarget !== undefined && body.expectedTarget !== id) {
        throw new ConfigSyncError('The upload target changed. Review the destination before uploading again.', 'stale-plan')
      }
      const ref = id === null
        ? await createGist(resolved.token, content)
        : await updateGist(resolved.token, id, content)
      // Remember where the cloud copy lives and when it was written, so the next
      // upload, the sync button, and the status line need no typing.
      writeSettings({
        gistId: ref.id,
        lastUpload: {
          gistId: ref.id,
          at: now(),
          files: backup.files.length,
          bytes: Buffer.byteLength(content),
          created: id === null,
          tokenSource: resolved.source,
        },
      })
      sendJson(response, 200, {
        ref,
        created: id === null,
        tokenSource: resolved.source,
        bytes: Buffer.byteLength(content),
        files: backup.files.length,
        createdAt: backup.createdAt,
        backupBytes: backupBytes(backup),
        // Machine-local dependency specs left out of what was uploaded, so the
        // page can say so instead of the user finding out on the other machine.
        dropped,
        droppedEntries,
      })
      return
    }
    if (route === '/api/gist/read' && method === 'POST') {
      const body = await readJsonBody(request)
      const resolved = await resolveTokenSource(body?.token)
      const id = targetId(body?.id)
      if (id === null) throw new ConfigSyncError('no cloud backup is set up yet', 'no-cloud')
      const { ref, backup } = await readGist(resolved.token, id)
      sendJson(response, 200, { ref, backup, preview: planRestore(backup), tokenSource: resolved.source })
      return
    }
    if (route === '/api/sync' && method === 'POST') {
      // One call for the whole job: read the cloud copy, then write it here with
      // an undo snapshot taken first.
      const body = await readJsonBody(request)
      const resolved = await resolveTokenSource(body?.token)
      const id = targetId(body?.id)
      if (id === null) {
        throw new ConfigSyncError('there is no cloud backup yet: upload this machine first', 'no-cloud')
      }
      const { ref, backup } = await readGist(resolved.token, id)
      const { report, warnings } = restoreGistConfiguration(ref, backup, { bindUploadTarget: true })
      sendJson(response, 200, { ref, report, tokenSource: resolved.source, undoDir: report.undoDir, ...(warnings.length ? { warnings } : {}) })
      return
    }
    sendJson(response, 404, { error: `no such route: ${route}`, code: 'notfound' })
  } catch (error) {
    sendJson(response, statusOf(error), describeError(error))
  } finally {
    release?.()
  }
}
