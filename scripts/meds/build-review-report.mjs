#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

const compiledPath = path.join(rootDir, 'data/meds/compiled/medications.compiled.json');
const reportPath = path.join(rootDir, 'data/meds/review/review-report.json');

const payload = JSON.parse(fs.readFileSync(compiledPath, 'utf8'));
const meds = Array.isArray(payload.medications) ? payload.medications : [];

const report = {
  generated_at: new Date().toISOString(),
  totals: {
    records: meds.length,
    curated: meds.filter((med) => med.content_review_status === 'curated').length,
    source_synced: meds.filter((med) => med.content_review_status === 'source synced').length,
    needs_review: meds.filter((med) => med.content_review_status === 'needs review').length,
    missing_fields: meds.filter((med) => Array.isArray(med.missing_data_flags) && med.missing_data_flags.length > 0).length,
  },
  review_queue: meds
    .filter((med) => med.content_review_status !== 'curated' || (med.missing_data_flags || []).length)
    .map((med) => ({
      id: med.id,
      generic_name: med.generic_name,
      psych_class: med.psych_class,
      content_review_status: med.content_review_status,
      missing_data_flags: med.missing_data_flags || [],
      source_last_checked: med.source_last_checked || null,
    })),
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`Review report written: ${reportPath}`);
console.log(`Needs review: ${report.totals.needs_review}`);
console.log(`Missing fields: ${report.totals.missing_fields}`);
