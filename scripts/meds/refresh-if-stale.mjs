#!/usr/bin/env node
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { callDriveAction, loadDriveConfig } from '../drive/drive-client.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const refreshScript = path.join(__dirname, 'refresh-and-publish.mjs');

const DRIVE_COMPILED_PATH = 'data/meds/compiled/medications.compiled.json';
const DRIVE_REFRESH_QUEUE_PATH = 'logs/sync/med-refresh-requests.json';

const argv = process.argv.slice(2);
const force = argv.includes('--force');
const staleDaysArg = argv.find((arg) => arg.startsWith('--stale-days='));
const parsedStaleDays = staleDaysArg ? Number(staleDaysArg.split('=')[1]) : 30;
const staleDays = Number.isFinite(parsedStaleDays) && parsedStaleDays > 0 ? Math.floor(parsedStaleDays) : 30;
const staleMs = staleDays * 24 * 60 * 60 * 1000;

function parseJson(text) {
  try {
    return JSON.parse(String(text || ''));
  } catch (error) {
    return null;
  }
}

function toTimestamp(value) {
  const ms = Date.parse(String(value || ''));
  return Number.isFinite(ms) ? ms : 0;
}

async function getCompiledGeneratedAt(config) {
  const result = await callDriveAction('file.get', { path: DRIVE_COMPILED_PATH }, { config });
  const file = result.file || result;
  const content = typeof file.content === 'string' ? file.content : '';
  const payload = parseJson(content);
  return payload && payload.generated_at ? String(payload.generated_at) : '';
}

async function getLatestRefreshRequestAt(config) {
  try {
    const result = await callDriveAction('file.get', { path: DRIVE_REFRESH_QUEUE_PATH }, { config });
    const file = result.file || result;
    const content = typeof file.content === 'string' ? file.content : '';
    const payload = parseJson(content);
    const items = payload && Array.isArray(payload.items) ? payload.items : [];
    return items.reduce((latest, item) => {
      const ts = toTimestamp(item && item.requestedAt ? item.requestedAt : '');
      return Math.max(latest, ts);
    }, 0);
  } catch (error) {
    return 0;
  }
}

function runRefreshPipeline() {
  execFileSync(process.execPath, [refreshScript], {
    cwd: rootDir,
    stdio: 'inherit',
  });
}

async function main() {
  const config = await loadDriveConfig();
  const now = Date.now();
  const generatedAt = await getCompiledGeneratedAt(config);
  const generatedAtMs = toTimestamp(generatedAt);
  const ageMs = generatedAtMs ? Math.max(0, now - generatedAtMs) : Number.POSITIVE_INFINITY;
  const latestRequestAtMs = await getLatestRefreshRequestAt(config);

  const stale = !generatedAtMs || ageMs >= staleMs;
  const queueHasRequests = latestRequestAtMs > 0;
  const queueNewerThanCatalog = Boolean(generatedAtMs && latestRequestAtMs > generatedAtMs);

  console.log(JSON.stringify({
    force,
    staleDays,
    generatedAt: generatedAt || null,
    generatedAtAgeDays: Number.isFinite(ageMs) ? Math.round((ageMs / (24 * 60 * 60 * 1000)) * 10) / 10 : null,
    queueHasRequests,
    queueNewerThanCatalog,
    action: force || stale ? 'run-refresh' : 'skip-refresh',
  }, null, 2));

  if (!force && !stale) {
    return;
  }

  runRefreshPipeline();
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
