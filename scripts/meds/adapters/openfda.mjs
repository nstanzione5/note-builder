/**
 * openFDA adapter:
 * - source-derived labeling metadata only
 * - never writes curated psych summaries
 */
import { appendOpenFdaApiKey } from './openfda-key.mjs';

async function fetchWithTimeout(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function sanitizeOpenFdaTerm(value) {
  return String(value || '')
    .replace(/["']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function scoreLabelRecord(record) {
  if (!record || typeof record !== 'object') return -1;
  const dosage = toArray(record.dosage_and_administration).length;
  const indications = toArray(record.indications_and_usage).length;
  const warnings = toArray(record.warnings).length + toArray(record.boxed_warning).length;
  const reactions = toArray(record.adverse_reactions).length;

  return (dosage * 4) + (indications * 3) + (warnings * 2) + reactions;
}

export async function fetchOpenFdaLabelSummary(genericName) {
  const term = sanitizeOpenFdaTerm(genericName);
  const search = encodeURIComponent(
    `openfda.generic_name:"${term}" OR openfda.brand_name:"${term}" OR openfda.substance_name:"${term}"`,
  );
  const baseUrl = `https://api.fda.gov/drug/label.json?search=${search}&limit=5`;
  const url = appendOpenFdaApiKey(baseUrl);

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`openFDA request failed (${response.status}) for ${genericName}`);
  }

  const payload = await response.json();
  const records = payload.results && Array.isArray(payload.results) ? payload.results : [];
  let result = null;
  let bestScore = -1;

  records.forEach((candidate) => {
    const score = scoreLabelRecord(candidate);
    if (score > bestScore) {
      bestScore = score;
      result = candidate;
    }
  });

  return {
    source: 'openFDA',
    url,
    found: Boolean(result),
    updatedAt: new Date().toISOString(),
    result,
  };
}
