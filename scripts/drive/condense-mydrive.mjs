#!/usr/bin/env node
import { callDriveAction, loadDriveConfig } from './drive-client.mjs';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const rootArg = args.find((arg) => arg.startsWith('--root='));
const maxArg = args.find((arg) => arg.startsWith('--max='));
const batchArg = args.find((arg) => arg.startsWith('--batch='));
const rootFolderName = rootArg ? rootArg.slice('--root='.length).trim() : '';
const maxItems = maxArg ? Number(maxArg.slice('--max='.length)) : NaN;
const batchSize = batchArg ? Number(batchArg.slice('--batch='.length)) : NaN;

async function main() {
  const config = await loadDriveConfig();
  const action = apply ? 'cleanup.apply' : 'cleanup.preview';
  const result = await callDriveAction(action, {
    rootFolderName: rootFolderName || config.rootFolderName,
    maxItems: Number.isFinite(maxItems) && maxItems > 0 ? Math.floor(maxItems) : undefined,
    batchSize: Number.isFinite(batchSize) && batchSize > 0 ? Math.floor(batchSize) : undefined,
    sampleSize: 20,
  }, { config });

  if (!apply) {
    console.log(JSON.stringify({
      ok: true,
      mode: 'preview',
      candidateCount: Number(result.candidateCount || 0),
      summary: result.summary || { totals: { files: 0, folders: 0 }, topGroups: [] },
      sample: result.sample || [],
      protectedIdCount: Number(result.protectedIdCount || 0),
    }, null, 2));
    return;
  }

  console.log(JSON.stringify({
    ok: true,
    mode: 'apply',
    processedCount: Number(result.processedCount || 0),
    trashedCount: Number(result.trashedCount || 0),
    remainingCount: Number(result.remainingCount || 0),
    done: Boolean(result.done),
    checkpoint: result.checkpoint || null,
    errors: result.errors || [],
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
