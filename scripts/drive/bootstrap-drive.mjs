#!/usr/bin/env node
import { callDriveAction, loadDriveConfig } from './drive-client.mjs';

async function main() {
  const config = await loadDriveConfig();

  const result = await callDriveAction('bootstrap', {
    sharedDriveId: config.sharedDriveId,
    rootFolderName: config.rootFolderName,
  }, { config });

  console.log(JSON.stringify({
    ok: true,
    rootFolderId: result.rootFolderId || '',
    sharedDriveId: result.sharedDriveId || config.sharedDriveId,
    createdFolders: result.createdFolders || [],
    manifestRevision: result.manifestRevision || '',
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
