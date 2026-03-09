#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { fetchDailyMedSplListing } from './adapters/dailymed.mjs';
import { fetchOpenFdaLabelSummary } from './adapters/openfda.mjs';
import { fetchRxNormApproximateTerm } from './adapters/rxnorm.mjs';
import { fetchDrugsFdaApproval } from './adapters/drugsfda.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

const sourcePath = path.join(rootDir, 'data/meds/source/medications.source.json');
const logPath = path.join(rootDir, 'data/meds/review/source-sync-log.json');
const compileScript = path.join(__dirname, 'compile-med-catalog.mjs');

const argv = process.argv.slice(2);
const limitArg = argv.find((arg) => arg.startsWith('--limit='));
const skipCompile = argv.includes('--skip-compile');
const limit = limitArg ? Number(limitArg.split('=')[1]) : 30;

if (Number.isNaN(limit) || limit < 1) {
  throw new Error('--limit must be a positive integer');
}

const sourcePayload = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const meds = Array.isArray(sourcePayload.medications) ? sourcePayload.medications : [];

const syncTargets = meds.slice(0, Math.min(limit, meds.length));
const syncLog = [];

for (const med of syncTargets) {
  const genericName = med.generic_name;
  const links = new Set(med.source_links || []);
  const notes = [];

  try {
    const [dailyMed, openFda, rxNorm, drugsFda] = await Promise.allSettled([
      fetchDailyMedSplListing(genericName),
      fetchOpenFdaLabelSummary(genericName),
      fetchRxNormApproximateTerm(genericName),
      fetchDrugsFdaApproval(genericName),
    ]);

    [dailyMed, openFda, rxNorm, drugsFda].forEach((result) => {
      if (result.status !== 'fulfilled') {
        notes.push(String(result.reason && result.reason.message ? result.reason.message : result.reason));
        return;
      }

      if (result.value.found) {
        links.add(result.value.url);
      }
    });

    med.source_links = Array.from(links);
    med.source_last_checked = new Date().toISOString();

    if (med.content_review_status === 'curated') {
      // Keep curated records curated; metadata changed underneath.
      med.content_review_status = 'curated';
    } else if (notes.length) {
      med.content_review_status = 'needs review';
    } else {
      med.content_review_status = 'source synced';
    }

    syncLog.push({
      id: med.id,
      generic_name: genericName,
      source_last_checked: med.source_last_checked,
      source_links_count: med.source_links.length,
      status: med.content_review_status,
      notes,
    });
  } catch (error) {
    syncLog.push({
      id: med.id,
      generic_name: genericName,
      source_last_checked: new Date().toISOString(),
      source_links_count: links.size,
      status: 'needs review',
      notes: [String(error && error.message ? error.message : error)],
    });
  }

  await new Promise((resolve) => setTimeout(resolve, 120));
}

sourcePayload.generated_at = new Date().toISOString();
sourcePayload.last_sync = {
  synced_at: new Date().toISOString(),
  synced_records: syncTargets.length,
};

fs.writeFileSync(sourcePath, JSON.stringify(sourcePayload, null, 2));
fs.writeFileSync(logPath, JSON.stringify({ generated_at: new Date().toISOString(), items: syncLog }, null, 2));

if (!skipCompile) {
  execFileSync(process.execPath, [compileScript], { stdio: 'inherit' });
}

console.log(`Source sync completed for ${syncTargets.length} medication records.`);
