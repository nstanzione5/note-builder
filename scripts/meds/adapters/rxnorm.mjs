/**
 * RxNorm / RxNav adapter:
 * - normalization + brand/generic linking + alias support
 * - source-derived only
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

export async function fetchRxNormApproximateTerm(term) {
  const encoded = encodeURIComponent(term);
  const url = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encoded}&maxEntries=5`;

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`RxNorm approximate term failed (${response.status}) for ${term}`);
  }

  const payload = await response.json();
  const candidates = payload.approximateGroup && Array.isArray(payload.approximateGroup.candidate)
    ? payload.approximateGroup.candidate
    : [];

  return {
    source: 'RxNorm',
    url,
    found: candidates.length > 0,
    candidates,
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchRxNormProperties(rxcui) {
  const encoded = encodeURIComponent(rxcui);
  const url = `https://rxnav.nlm.nih.gov/REST/rxcui/${encoded}/properties.json`;

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`RxNorm properties failed (${response.status}) for RXCUI ${rxcui}`);
  }

  const payload = await response.json();

  return {
    source: 'RxNorm',
    url,
    found: Boolean(payload.properties),
    properties: payload.properties || null,
    updatedAt: new Date().toISOString(),
  };
}
