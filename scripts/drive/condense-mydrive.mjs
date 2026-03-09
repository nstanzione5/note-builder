#!/usr/bin/env node
import { callDriveAction, loadDriveConfig } from './drive-client.mjs';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const archiveArg = args.find((arg) => arg.startsWith('--archive='));
const rootArg = args.find((arg) => arg.startsWith('--root='));
const archiveFolderName = archiveArg ? archiveArg.slice('--archive='.length).trim() : '';
const rootFolderName = rootArg ? rootArg.slice('--root='.length).trim() : '';

async function main() {
  const config = await loadDriveConfig();
  const result = await callDriveAction('mydrive.condense', {
    dryRun: !apply,
    archiveFolderName: archiveFolderName || undefined,
    rootFolderName: rootFolderName || config.rootFolderName,
  }, { config });

  console.log(JSON.stringify({
    ok: true,
    dryRun: Boolean(result.dryRun),
    archiveFolderName: result.archiveFolderName || '',
    archiveFolderId: result.archiveFolderId || '',
    archiveFolderUrl: result.archiveFolderUrl || '',
    candidateCount: Number(result.candidateCount || 0),
    movedCount: Number(result.movedCount || 0),
    candidates: result.candidates || [],
    moved: result.moved || [],
    errors: result.errors || [],
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
