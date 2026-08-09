const path = require('node:path');
const express = require('express');
const { createAuthMiddleware, parseAllowedUsers } = require('./auth');
const { DriveStore } = require('./drive-store');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BUILD_ID = process.env.ASTRA_BUILD_ID || '20260809-google-cloud-auth';

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function createApp(options = {}) {
  const app = express();
  const allowedUsers = options.allowedUsers instanceof Set
    ? options.allowedUsers
    : parseAllowedUsers(options.allowedUsers || process.env.ASTRA_ALLOWED_USERS);
  const store = options.store || new DriveStore({ buildId: BUILD_ID });
  const requireUser = options.requireUser || createAuthMiddleware({
    clientId: options.clientId || process.env.GOOGLE_OAUTH_CLIENT_ID,
    allowedUsers,
    verifier: options.verifier,
  });

  app.disable('x-powered-by');
  app.use(express.json({ limit: '5mb', type: ['application/json', 'text/plain'] }));
  app.use((req, res, next) => {
    res.set('Referrer-Policy', 'no-referrer');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (req.path.startsWith('/api/')) res.set('Cache-Control', 'no-store');
    next();
  });

  app.get('/healthz', (req, res) => res.json({ ok: true, buildId: BUILD_ID }));
  app.get('/api/v1/config', (req, res) => res.json({
    ok: true,
    buildId: BUILD_ID,
    googleOAuthClientId: String(options.clientId || process.env.GOOGLE_OAUTH_CLIENT_ID || ''),
  }));

  app.post('/api/v1/actions', requireUser, asyncRoute(async (req, res) => {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const action = String(payload.action || 'health');
    const email = req.astraUser.email;
    let result;

    switch (action) {
      case 'health': {
        const health = await store.health(email);
        result = {
          appBuildId: BUILD_ID,
          resolvedUserEmail: email,
          allowlistedUsers: [email],
          requiredSharedDriveId: store.sharedDriveId,
          requiredRootFolderId: store.rootFolderId,
          resolvedRootFolderId: health.rootOk ? store.rootFolderId : '',
          canonicalRoot: health.rootOk ? { id: store.rootFolderId, driveId: store.sharedDriveId } : null,
          preflightStatus: health.preflightStatus,
          preflightReason: health.preflightStatus === 'ok' ? '' : 'Astra Shared Drive storage is not ready.',
          advancedDriveStatus: 'available',
          runtime: 'google-cloud-run',
        };
        break;
      }
      case 'bootstrap':
      case 'drive.repair':
        result = await store.bootstrap(email);
        break;
      case 'manifest.get':
        result = await store.getManifest(email);
        break;
      case 'file.get':
        result = await store.getFile(payload.path, email);
        break;
      case 'file.put':
        result = await store.putFile(payload.path, payload.content, payload.expectedRevision, email, payload.contentType);
        break;
      case 'backup.append':
        result = await store.appendBackup(payload.entry || {}, email);
        break;
      case 'backup.list':
        result = await store.listBackups(email);
        break;
      case 'med.refresh.request':
        result = await store.requestMedicationRefresh(payload, email);
        break;
      case 'cleanup.preview':
      case 'cleanup.snapshot':
      case 'cleanup.apply':
        result = { mode: 'disabled', done: true, reason: 'Cloud backend does not perform automatic destructive cleanup.' };
        break;
      default:
        return res.status(400).json({ ok: false, code: 'action_unsupported', error: 'Unsupported action.' });
    }

    return res.json({ ok: true, action, ...result });
  }));

  const staticFile = (url, file, cache = 'no-cache') => app.get(url, (req, res) => {
    res.set('Cache-Control', cache);
    res.sendFile(path.join(PROJECT_ROOT, file));
  });
  staticFile('/', 'index.html');
  for (const file of ['index.html', 'letter.html', 'app.js', 'letter.js', 'auth.js', 'styles.css', 'sw.js', 'manifest.json']) {
    staticFile(`/${file}`, file, file === 'sw.js' || file.endsWith('.html') ? 'no-cache' : 'public, max-age=300');
  }
  app.use('/assets', express.static(path.join(PROJECT_ROOT, 'assets'), { maxAge: '1h', fallthrough: false }));
  app.use('/icons', express.static(path.join(PROJECT_ROOT, 'icons'), { maxAge: '1h', fallthrough: false }));
  staticFile('/config/astra-clinicians.json', 'config/astra-clinicians.json');
  staticFile('/config/provider-scripts.json', 'config/provider-scripts.json');
  staticFile('/data/meds/compiled/medications.compiled.json', 'data/meds/compiled/medications.compiled.json', 'public, max-age=300');
  staticFile('/data/meds/review/runtime-fallbacks.json', 'data/meds/review/runtime-fallbacks.json', 'public, max-age=300');

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = Number(error.status || 500);
    if (status >= 500) console.error(JSON.stringify({ event: 'request_failed', code: error.code || 'internal_error' }));
    return res.status(status).json({
      ok: false,
      code: error.code || (status >= 500 ? 'internal_error' : 'request_failed'),
      error: status >= 500 ? 'Astra storage request failed.' : String(error.message || 'Request failed.'),
    });
  });

  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 8080);
  createApp().listen(port, '0.0.0.0', () => console.log(`Astra service listening on ${port}`));
}

module.exports = { createApp, BUILD_ID };
