/**
 * MedlinePlus Connect adapter:
 * - knowledge summaries by RxNorm code (RxCUI)
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

export async function fetchMedlinePlusByRxcui(rxcui) {
  const params = new URLSearchParams({
    'mainSearchCriteria.v.cs': '2.16.840.1.113883.6.88',
    'mainSearchCriteria.v.c': String(rxcui || ''),
    knowledgeResponseType: 'application/json',
    'informationRecipient.languageCode.c': 'en',
  });
  const url = `https://connect.medlineplus.gov/service?${params.toString()}`;

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`MedlinePlus request failed (${response.status}) for RXCUI ${rxcui}`);
  }

  const payload = await response.json();
  const entries = payload.feed && Array.isArray(payload.feed.entry) ? payload.feed.entry : [];

  return {
    source: 'MedlinePlus',
    url,
    found: entries.length > 0,
    entries,
    updatedAt: new Date().toISOString(),
  };
}
