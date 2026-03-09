/**
 * Drugs@FDA adapter (via openFDA drugsfda endpoint):
 * - approval metadata checks for product/brand validation
 */
async function fetchWithTimeout(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchDrugsFdaApproval(term) {
  const encoded = encodeURIComponent(term);
  const apiKey = process.env.OPENFDA_API_KEY ? `&api_key=${encodeURIComponent(process.env.OPENFDA_API_KEY)}` : '';
  const url = `https://api.fda.gov/drug/drugsfda.json?search=openfda.generic_name:%22${encoded}%22&limit=1${apiKey}`;

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
