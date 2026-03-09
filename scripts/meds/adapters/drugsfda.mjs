/**
 * Drugs@FDA adapter (via openFDA drugsfda endpoint):
 * - approval metadata checks for product/brand validation
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

export async function fetchDrugsFdaApproval(term) {
  const cleaned = sanitizeOpenFdaTerm(term);
  const search = encodeURIComponent(
    `openfda.generic_name:"${cleaned}" OR openfda.brand_name:"${cleaned}" OR products.active_ingredients.name:"${cleaned}"`,
  );
  const baseUrl = `https://api.fda.gov/drug/drugsfda.json?search=${search}&limit=3`;
  const url = appendOpenFdaApiKey(baseUrl);

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`Drugs@FDA request failed (${response.status}) for ${term}`);
  }

  const payload = await response.json();
  const result = payload.results && payload.results[0] ? payload.results[0] : null;

  return {
    source: 'Drugs@FDA',
    url,
    found: Boolean(result),
    result,
    updatedAt: new Date().toISOString(),
  };
}
