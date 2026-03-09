#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

const sourcePath = path.join(rootDir, 'data/meds/source/medications.source.json');
const syncScript = path.join(__dirname, 'sync-source-metadata.mjs');
const reviewScript = path.join(__dirname, 'build-review-report.mjs');
const publishScript = path.join(rootDir, 'scripts/drive/publish-to-drive.mjs');

const argv = process.argv.slice(2);
const skipPublish = argv.includes('--skip-publish');
const limitArg = argv.find((arg) => arg.startsWith('--limit='));

const sourcePayload = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const sourceRecords = Array.isArray(sourcePayload.medications) ? sourcePayload.medications : [];
const autoLimit = sourceRecords.length || 1;
const parsedLimit = limitArg ? Number(limitArg.split('=')[1]) : autoLimit;
const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.floor(parsedLimit) : autoLimit;

function runNodeScript(scriptPath, args = []) {
  execFileSync(process.execPath, [scriptPath, ...args], {
    cwd: rootDir,
    stdio: 'inherit',
  });
}

const startedAt = new Date().toISOString();
console.log(`[med-refresh] Started at ${startedAt}`);
console.log(`[med-refresh] Syncing ${limit} records (source total: ${sourceRecords.length}).`);

runNodeScript(syncScript, [`--limit=${limit}`]);
runNodeScript(reviewScript);

if (!skipPublish) {
  runNodeScript(publishScript);
}

const finishedAt = new Date().toISOString();
console.log(`[med-refresh] Completed at ${finishedAt}.`);
console.log(`[med-refresh] Publish step: ${skipPublish ? 'skipped' : 'completed'}.`);
