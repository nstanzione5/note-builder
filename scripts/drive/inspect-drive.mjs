#!/usr/bin/env node
import { callDriveAction, loadDriveConfig } from './drive-client.mjs';

function toFolderUrl(id) {
  return id ? `https://drive.google.com/drive/folders/${id}` : '';
}

function toFileUrl(id) {
  return id ? `https://drive.google.com/file/d/${id}/view` : '';
}

async function main() {
  const config = await loadDriveConfig();
  const health = await callDriveAction('health', {}, { config });
  const manifestResult = await callDriveAction('manifest.get', {}, { config });
  const manifest = manifestResult.manifest || {};
  const pathMap = manifest.pathMap || {};

  const keyPaths = [
    'config/drive-manifest.json',
    'data/meds/source/medications.source.json',
    'data/meds/curated/medications.curated.json',
    'data/meds/compiled/medications.compiled.json',
    'data/meds/review/review-queue.json',
    'data/meds/review/review-report.json',
    'data/meds/review/source-sync-log.json',
    'data/draft/current.json',
    'data/draft/recent-patients.json',
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
