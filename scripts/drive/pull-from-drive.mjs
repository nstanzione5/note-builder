#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { callDriveAction, loadDriveConfig } from './drive-client.mjs';

const FILE_MAP = [
  ['data/meds/source/medications.source.json', 'data/meds/source/medications.source.json'],
  ['data/meds/curated/medications.curated.json', 'data/meds/curated/medications.curated.json'],
  ['data/meds/compiled/medications.compiled.json', 'data/meds/compiled/medications.compiled.json'],
  ['data/meds/review/review-queue.json', 'data/meds/review/review-queue.json'],
  ['data/meds/review/review-report.json', 'data/meds/review/review-report.json'],
  ['data/meds/review/source-sync-log.json', 'data/meds/review/source-sync-log.json'],
  ['data/meds/review/runtime-fallbacks.json', 'data/meds/review/runtime-fallbacks.json'],
  ['config/drive-manifest.json', 'config/drive-manifest.json'],
];

async function ensureParentDir(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  const config = await loadDriveConfig();
  const pulled = [];

  for (const [localPath, drivePath] of FILE_MAP) {
    const result = await callDriveAction('file.get', { path: drivePath }, { config });
    const file = result.file || result;

    if (!file || typeof file.content !== 'string') {
      continue;
    }

    const absolute = path.resolve(process.cwd(), localPath);
    await ensureParentDir(absolute);
    await fs.writeFile(absolute, file.content, 'utf8');

    pulled.push({
      drivePath,
      localPath,
      revision: file.revision || null,
    });
  }

  console.log(JSON.stringify({ ok: true, pulled }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
