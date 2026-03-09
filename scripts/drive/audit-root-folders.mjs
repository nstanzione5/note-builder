#!/usr/bin/env node
import { callDriveAction, loadDriveConfig } from './drive-client.mjs';

async function main() {
  const config = await loadDriveConfig();
  const result = await callDriveAction('root.audit', {}, { config });
  console.log(JSON.stringify({
    ok: true,
    rootFolderName: result.rootFolderName || '',
    requiredSharedDriveId: result.requiredSharedDriveId || '',
    expectedSharedDriveId: result.expectedSharedDriveId || '',
    canonicalRoot: result.canonicalRoot || null,
    duplicateRoots: result.duplicateRoots || [],
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
