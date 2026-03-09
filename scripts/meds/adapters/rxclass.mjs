/**
 * RxClass adapter:
 * - RxNorm class relationships by RxCUI
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

export async function fetchRxClassByRxcui(rxcui) {
  const encoded = encodeURIComponent(rxcui);
  const url = `https://rxnav.nlm.nih.gov/REST/rxclass/class/byRxcui.json?rxcui=${encoded}`;

  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`RxClass request failed (${response.status}) for RXCUI ${rxcui}`);
  }

  const payload = await response.json();
  const classes = payload.rxclassDrugInfoList && Array.isArray(payload.rxclassDrugInfoList.rxclassDrugInfo)
    ? payload.rxclassDrugInfoList.rxclassDrugInfo
    : [];

  return {
    source: 'RxClass',
    url,
    found: classes.length > 0,
    classes,
    updatedAt: new Date().toISOString(),
  };
}
