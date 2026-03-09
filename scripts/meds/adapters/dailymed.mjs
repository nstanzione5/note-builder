/**
 * DailyMed adapter:
 * - SPL listing + source URLs
 * - source-derived metadata only
 */
export async function fetchDailyMedSplListing(drugName) {
  const encoded = encodeURIComponent(drugName);
  const url = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=${encoded}&pagesize=3`;

  const response = await fetch(url);
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
