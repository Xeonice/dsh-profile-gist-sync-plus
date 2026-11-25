/**
 * The first run: a machine that has never had a cloud copy.
 *
 * This is the journey every new user takes, and the only one that cannot be
 * exercised against a real GitHub account without creating a Gist in it. The
 * GitHub HTTP layer is stubbed instead — which also gives the plugin a privacy
 * assertion worth having, because the stub refuses every host but
 * api.github.com: any request anywhere else fails this check.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createReport, makeProfile, tempDir, useProfile, callRoute, serveHandler, stubGithub, backupDocument, TEST_GIST_ID as NEW_ID, TEST_TOKEN } from './harness.mjs'

const { check, finish } = createReport('first run')

const home = tempDir('dpg-firstrun-')
const profile = makeProfile(join(home, 'profiles', 'test'))
useProfile(profile, home)
process.env.DSH_GITHUB_TOKEN = TEST_TOKEN

// The cloud copy this profile will find: the same v0.2 shape upstream writes.
const stub = stubGithub({
  gistId: NEW_ID,
  document: backupDocument('test', [{ path: 'data/note.json', lines: ['{"hello":"from the cloud"}'] }]),
})

const { registerRoutes, BASE_PATH } = await import('../lib/routes.js')
let handler = null
registerRoutes({ get: (name) => (name === 'webServer' ? { register: (route) => { handler = route.handler; return () => {} } } : undefined) })
const served = await serveHandler(handler)
const call = (path, body) => callRoute(served.base, `${BASE_PATH}${path}`, body)
const settingsFile = join(profile, '.dsh-config-sync-plus', 'settings.json')
// A machine may already run upstream. Its state is neither imported implicitly
// nor changed by the Plus fork, even when both point at the same profile.
const upstreamState = join(profile, '.dsh-config-sync')
mkdirSync(upstreamState)
const upstreamSettings = '{"gistId":"upstream-fixture"}\n'
writeFileSync(join(upstreamState, 'settings.json'), upstreamSettings)

check('a fresh Plus profile remembers nothing yet', !existsSync(settingsFile))
const before = await call('/api/status')
check('status reports no cloud copy', before.status === 200 && before.payload.cloud.gistId === null, JSON.stringify(before.payload.cloud))

// A fresh installation can adopt the *document* from upstream by id without
// importing its settings, uploading, or creating another Gist.
const legacy = await call('/api/gist/read', { id: NEW_ID })
check('Plus reads an existing upstream v0.2 Gist before the first upload',
  legacy.status === 200 && legacy.payload.backup?.format === 'dsh-profile-backup' && legacy.payload.backup.version === 0.2
  && !existsSync(settingsFile) && stub.calls.every(entry => entry.method === 'GET'))

// ---- the first upload creates a secret Gist ----------------------------
const upload = await call('/api/gist/upload', {})
check('the first upload creates a Gist', upload.status === 200 && upload.payload.created === true, JSON.stringify(upload.payload).slice(0, 160))
const creation = stub.calls.find(entry => entry.method === 'POST' && entry.path === '/gists')
check('exactly one Gist was created', stub.calls.filter(entry => entry.method === 'POST' && entry.path === '/gists').length === 1)
check('it is created secret, never public', creation?.body?.public === false, JSON.stringify(creation?.body?.public))
check('it carries exactly one file, the backup',
  Object.keys(creation?.body?.files ?? {}).join() === 'dsh-profile-backup.json', JSON.stringify(Object.keys(creation?.body?.files ?? {})))
check('the backup in it is a valid document', typeof creation?.body?.files['dsh-profile-backup.json'].content === 'string'
  && JSON.parse(creation.body.files['dsh-profile-backup.json'].content).format === 'dsh-profile-backup')
check('the token travels in the header only',
  String(creation?.headers?.authorization ?? '').includes(TEST_TOKEN)
  && !JSON.stringify(creation?.body ?? {}).includes(TEST_TOKEN),
  String(creation?.headers?.authorization ?? '').slice(0, 12))
check('the Gist description and user agent identify the fork',
  creation?.body?.description?.includes('dsh-profile-gist-sync-plus') === true && creation?.headers['user-agent'] === 'dsh-profile-gist-sync-plus')
check('the created id is remembered in this profile',
  existsSync(settingsFile) && JSON.parse(readFileSync(settingsFile, 'utf8')).gistId === NEW_ID)

const after = await call('/api/status')
check('status now reports the remembered Gist',
  after.payload.cloud.gistId === NEW_ID && after.payload.cloud.lastUpload?.created === true, JSON.stringify(after.payload.cloud))

// ---- a second upload updates the same Gist -----------------------------
const again = await call('/api/gist/upload', {})
check('a second upload updates instead of creating another',
  again.status === 200 && again.payload.created === false
  && stub.calls.filter(entry => entry.method === 'POST' && entry.path === '/gists').length === 1)
check('and it targets the remembered id', stub.calls.some(entry => entry.method === 'PATCH' && entry.path === `/gists/${NEW_ID}`))

// ---- reading and syncing that cloud copy -------------------------------
const read = await call('/api/gist/read', {})
check('the cloud copy reads back', read.status === 200 && read.payload.ref.id === NEW_ID, JSON.stringify(read.payload).slice(0, 160))
check('and the plan names what a restore would change', read.payload.preview.files.length > 0, JSON.stringify(read.payload.preview.counts))

const sync = await call('/api/sync', {})
check('sync applies the cloud copy here', sync.status === 200 && typeof sync.payload.undoDir === 'string', JSON.stringify(sync.payload).slice(0, 160))
check('the file it wrote holds the cloud content',
  readFileSync(join(profile, 'data', 'note.json'), 'utf8').includes('from the cloud'),
  readFileSync(join(profile, 'data', 'note.json'), 'utf8'))
check('an undo is offered', (await call('/api/status')).payload.undo !== null)

// ---- what the plugin never does ----------------------------------------
const paths = stub.calls.map(entry => entry.path)
check('every call went to api.github.com', stub.calls.length > 0 && paths.every(path => path.startsWith('/')))
check('no request carried a credential store', !JSON.stringify(stub.calls).includes('credentials'))
check('no request carried local usage counters', !JSON.stringify(stub.calls).includes('usage.json'))
check('the token is never written into the profile', !readFileSync(settingsFile, 'utf8').includes(TEST_TOKEN))
check('upstream settings were neither uploaded nor changed', !JSON.stringify(stub.calls).includes('upstream-fixture')
  && readFileSync(join(upstreamState, 'settings.json'), 'utf8') === upstreamSettings)

stub.restore()
served.close()
process.exit(finish())
