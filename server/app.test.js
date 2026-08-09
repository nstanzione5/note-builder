const assert = require('node:assert/strict');
const test = require('node:test');
const { createApp } = require('./app');

function fakeAuth(req, res, next) {
  const value = req.get('authorization');
  if (value !== 'Bearer approved') return res.status(401).json({ ok: false });
  req.astraUser = { email: 'approved@example.com', subject: 'test-user' };
  next();
}

function fakeStore() {
  return {
    sharedDriveId: 'drive-id', rootFolderId: 'root-id',
    health: async () => ({ rootOk: true, manifestOk: true, preflightStatus: 'ok' }),
    getManifest: async () => ({ manifest: { version: 2 }, revision: '1', checksum: 'abc' }),
    getFile: async (path, email) => ({ file: { path, content: '{}', revision: '1', user: email } }),
    putFile: async (path, content, revision, email) => ({ path, revision: '2', email, content }),
    bootstrap: async () => ({ manifestRevision: '1' }),
    appendBackup: async () => ({ backupId: 'backup-1' }),
    listBackups: async () => ({ backups: [] }),
    requestMedicationRefresh: async () => ({ revision: '2' }),
  };
}

async function withServer(run) {
  const app = createApp({ store: fakeStore(), requireUser: fakeAuth, clientId: 'client-id', allowedUsers: new Set(['approved@example.com']) });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); } finally { await new Promise((resolve) => server.close(resolve)); }
}

test('API rejects requests without a verified user', async () => withServer(async (base) => {
  const response = await fetch(`${base}/api/v1/actions`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'health' }),
  });
  assert.equal(response.status, 401);
}));

test('health derives identity from authentication', async () => withServer(async (base) => {
  const response = await fetch(`${base}/api/v1/actions`, {
    method: 'POST', headers: { authorization: 'Bearer approved', 'content-type': 'application/json' }, body: JSON.stringify({ action: 'health', userEmail: 'attacker@example.com' }),
  });
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.resolvedUserEmail, 'approved@example.com');
  assert.deepEqual(payload.allowlistedUsers, ['approved@example.com']);
  assert.equal(payload.preflightStatus, 'ok');
}));

test('automatic cleanup actions are non-destructive', async () => withServer(async (base) => {
  const response = await fetch(`${base}/api/v1/actions`, {
    method: 'POST', headers: { authorization: 'Bearer approved', 'content-type': 'application/json' }, body: JSON.stringify({ action: 'cleanup.apply' }),
  });
  const payload = await response.json();
  assert.equal(payload.mode, 'disabled');
  assert.equal(payload.done, true);
}));
