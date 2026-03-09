/**
 * openFDA adapter:
 * - source-derived labeling metadata only
 * - never writes curated psych summaries
 */
export async function fetchOpenFdaLabelSummary(genericName) {
  const term = encodeURIComponent(genericName);
  const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22${term}%22&limit=1`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`openFDA request failed (${response.status}) for ${genericName}`);
  }

  const payload = await response.json();
  const result = payload.results && payload.results[0] ? payload.results[0] : null;

  return {
    source: 'openFDA',
    url,
    found: Boolean(result),
    updatedAt: new Date().toISOString(),
    result,
  };
}
