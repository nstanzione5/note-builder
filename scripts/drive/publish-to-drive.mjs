#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { callDriveAction, checksum, loadDriveConfig } from './drive-client.mjs';

const FILE_MAP = [
  ['data/meds/source/medications.source.json', 'data/meds/source/medications.source.json'],
  ['data/meds/curated/medications.curated.json', 'data/meds/curated/medications.curated.json'],
  ['data/meds/compiled/medications.compiled.json', 'data/meds/compiled/medications.compiled.json'],
  ['data/meds/review/review-queue.json', 'data/meds/review/review-queue.json'],
  ['data/meds/review/review-report.json', 'data/meds/review/review-report.json'],
  ['data/meds/review/source-sync-log.json', 'data/meds/review/source-sync-log.json'],
  ['docs/medication-reference-maintenance.md', 'app-shell/docs/medication-reference-maintenance.md'],
  ['config/drive-manifest.json', 'config/drive-manifest.json'],
];

async function readIfExists(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function main() {
  const config = await loadDriveConfig();

  await callDriveAction('bootstrap', {
    sharedDriveId: config.sharedDriveId,
    rootFolderName: config.rootFolderName,
  }, { config });

  const pushed = [];

  for (const [localPath, drivePath] of FILE_MAP) {
    const absolute = path.resolve(process.cwd(), localPath);
    const content = await readIfExists(absolute);
    if (content == null) continue;
    const localChecksum = checksum(content);

    let remoteChecksum = '';
    try {
      const existing = await callDriveAction('file.get', { path: drivePath }, { config });
      const existingFile = existing.file || existing;
      if (existingFile && typeof existingFile.content === 'string') {
        remoteChecksum = String(existingFile.checksum || checksum(existingFile.content));
      }
    } catch (error) {
      remoteChecksum = '';
    }

    if (remoteChecksum && remoteChecksum === localChecksum) {
      pushed.push({
        localPath,
        drivePath,
        revision: null,
        checksum: localChecksum,
        skipped: true,
      });
      continue;
    }

    const result = await callDriveAction('file.put', {
      path: drivePath,
      content,
      contentType: localPath.endsWith('.json') ? 'application/json' : 'text/plain',
      checksum: localChecksum,
    }, { config });

    pushed.push({
      localPath,
      drivePath,
      revision: result.revision || null,
      checksum: result.checksum || localChecksum,
      skipped: false,
    });
  }

  await callDriveAction('backup.append', {
    entry: {
      id: `publish-${Date.now()}`,
      savedAt: new Date().toISOString(),
      label: 'Medication artifact publish',
      note: 'Published source/curated/compiled/review assets from local workspace.',
      files: pushed,
    },
  }, { config });

  console.log(JSON.stringify({ ok: true, pushed }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
