/**
 * RxTerms adapter:
 * - RxTerms all-info payload by RxCUI
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

export async function fetchRxTermsByRxcui(rxcui) {
  const encoded = encodeURIComponent(rxcui);
  const url = `https://rxnav.nlm.nih.gov/REST/RxTerms/rxcui/${encoded}/allinfo.json`;

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`RxTerms request failed (${response.status}) for RXCUI ${rxcui}`);
  }

  const payload = await response.json();
  const info = payload.rxtermsProperties || null;

  return {
    source: 'RxTerms',
    url,
    found: Boolean(info),
    info,
    updatedAt: new Date().toISOString(),
  };
}
