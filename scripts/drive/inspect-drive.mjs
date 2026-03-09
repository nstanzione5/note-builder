#!/usr/bin/env node
import { callDriveAction, loadDriveConfig } from './drive-client.mjs';

function toFolderUrl(id) {
  return id ? `https://drive.google.com/drive/folders/${id}` : '';
}

function toFileUrl(id) {
  return id ? `https://drive.google.com/file/d/${id}/view` : '';
}

function userKeyFromEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '')
    .replace(/@/g, '-at-')
    .replace(/\./g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  const config = await loadDriveConfig();
  const health = await callDriveAction('health', {}, { config });
  const manifestResult = await callDriveAction('manifest.get', {}, { config });
  const manifest = manifestResult.manifest || {};
  const pathMap = manifest.pathMap || {};
  const userKey = userKeyFromEmail(config.userEmail || config.ownerEmail || '');
  const userDraftPath = userKey ? `data/draft/users/${userKey}/current.json` : '';
  const userRecentPath = userKey ? `data/draft/users/${userKey}/recent-patients.json` : '';

  const keyPaths = [
    'config/drive-manifest.json',
    'data/meds/source/medications.source.json',
    'data/meds/curated/medications.curated.json',
    'data/meds/compiled/medications.compiled.json',
    'data/meds/review/review-queue.json',
    'data/meds/review/review-report.json',
    'data/meds/review/source-sync-log.json',
    userDraftPath || 'data/draft/current.json',
    userRecentPath || 'data/draft/recent-patients.json',
    'logs/sync/med-refresh-requests.json',
  ];

  const files = keyPaths.map((path) => {
    const id = pathMap[path] && pathMap[path].id ? String(pathMap[path].id) : '';
    return {
      path,
      id,
      url: toFileUrl(id),
    };
  });

  console.log(JSON.stringify({
    ok: true,
    owner: health.owner || '',
    tokenConfigured: Boolean(health.tokenConfigured),
    allowlistedUsers: health.allowlistedUsers || [],
    requiredSharedDriveId: health.requiredSharedDriveId || '',
    userEmail: config.userEmail || config.ownerEmail || '',
    sharedDriveId: manifest.sharedDriveId || config.sharedDriveId || '',
    rootFolderName: manifest.rootFolderName || config.rootFolderName || '',
    rootFolderId: manifest.rootFolderId || '',
    rootFolderUrl: toFolderUrl(manifest.rootFolderId || ''),
    files,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
