/**
 * DailyMed adapter:
 * - SPL listing + source URLs
 * - source-derived metadata only
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

export async function fetchDailyMedSplListing(drugName) {
  const encoded = encodeURIComponent(drugName);
  const url = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=${encoded}&pagesize=3`;

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`DailyMed request failed (${response.status}) for ${drugName}`);
  }

  const payload = await response.json();
  const entries = Array.isArray(payload.data) ? payload.data : [];

  return {
    source: 'DailyMed',
    url,
    found: entries.length > 0,
    entries,
    updatedAt: new Date().toISOString(),
  };
}
