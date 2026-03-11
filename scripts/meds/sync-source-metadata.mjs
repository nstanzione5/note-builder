#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { fetchDailyMedSplListing } from './adapters/dailymed.mjs';
import { fetchOpenFdaLabelSummary } from './adapters/openfda.mjs';
import { fetchRxNormApproximateTerm, fetchRxNormRxcuiByString } from './adapters/rxnorm.mjs';
import { fetchRxClassByRxcui } from './adapters/rxclass.mjs';
import { fetchRxTermsByRxcui } from './adapters/rxterms.mjs';
import { fetchMedlinePlusByRxcui } from './adapters/medlineplus.mjs';
import { fetchDrugsFdaApproval } from './adapters/drugsfda.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

const sourcePath = path.join(rootDir, 'data/meds/source/medications.source.json');
const logPath = path.join(rootDir, 'data/meds/review/source-sync-log.json');
const compileScript = path.join(__dirname, 'compile-med-catalog.mjs');

const argv = process.argv.slice(2);
const limitArg = argv.find((arg) => arg.startsWith('--limit='));
const skipCompile = argv.includes('--skip-compile');
const limit = limitArg ? Number(limitArg.split('=')[1]) : 30;

if (Number.isNaN(limit) || limit < 1) {
  throw new Error('--limit must be a positive integer');
}

const rateConfig = {
  dailymed: {
    minIntervalMs: Number(process.env.DAILYMED_MIN_INTERVAL_MS || 220),
    maxCalls: Number(process.env.DAILYMED_MAX_CALLS || 2400),
  },
  openfda: {
    minIntervalMs: Number(process.env.OPENFDA_MIN_INTERVAL_MS || 1500),
    maxCalls: Number(process.env.OPENFDA_MAX_CALLS || 900),
  },
  rxnorm: {
    minIntervalMs: Number(process.env.RXNORM_MIN_INTERVAL_MS || 140),
    maxCalls: Number(process.env.RXNORM_MAX_CALLS || 2800),
  },
  rxclass: {
    minIntervalMs: Number(process.env.RXCLASS_MIN_INTERVAL_MS || 180),
    maxCalls: Number(process.env.RXCLASS_MAX_CALLS || 2400),
  },
  rxterms: {
    minIntervalMs: Number(process.env.RXTERMS_MIN_INTERVAL_MS || 180),
    maxCalls: Number(process.env.RXTERMS_MAX_CALLS || 2400),
  },
  medlineplus: {
    minIntervalMs: Number(process.env.MEDLINEPLUS_MIN_INTERVAL_MS || 260),
    maxCalls: Number(process.env.MEDLINEPLUS_MAX_CALLS || 1800),
  },
  drugsfda: {
    minIntervalMs: Number(process.env.DRUGSFDA_MIN_INTERVAL_MS || 450),
    maxCalls: Number(process.env.DRUGSFDA_MAX_CALLS || 900),
  },
};

const OPENFDA_MAX_TERMS = Number.isFinite(Number(process.env.OPENFDA_MAX_TERMS))
  ? Math.max(1, Math.floor(Number(process.env.OPENFDA_MAX_TERMS)))
  : 2;
const DRUGSFDA_MAX_TERMS = Number.isFinite(Number(process.env.DRUGSFDA_MAX_TERMS))
  ? Math.max(1, Math.floor(Number(process.env.DRUGSFDA_MAX_TERMS)))
  : 2;

const sourcePayload = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const meds = Array.isArray(sourcePayload.medications) ? sourcePayload.medications : [];

const syncTargets = meds.slice(0, Math.min(limit, meds.length));
const syncLog = [];

function coerceArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function cleanSnippet(value, maxLength = 220) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function cleanList(value, maxItems = 6, maxLength = 220) {
  const items = coerceArray(value)
    .map((entry) => cleanSnippet(entry, maxLength))
    .filter(Boolean);

  const deduped = Array.from(new Set(items));
  return deduped.slice(0, maxItems);
}

function cleanTokenList(value, maxItems = 10) {
  const items = coerceArray(value)
    .map((entry) => cleanSnippet(entry, 80))
    .filter(Boolean);
  return Array.from(new Set(items)).slice(0, maxItems);
}

function extractOpenFdaEnrichment(result) {
  const label = result && result.result ? result.result : null;
  const openfda = label && label.openfda ? label.openfda : {};

  return {
    found: Boolean(result && result.found && label),
    url: result && result.url ? result.url : '',
    term_used: cleanSnippet(result && result.term_used ? result.term_used : '', 80),
    indications_and_usage: cleanList(label && label.indications_and_usage, 6),
    // Keep longer dosage text so compile can reliably extract numeric dose ranges.
    dosage_and_administration: cleanList(label && label.dosage_and_administration, 8, 1600),
    drug_interactions: cleanList(label && label.drug_interactions, 6),
    adverse_reactions: cleanList(label && label.adverse_reactions, 6),
    boxed_warning: cleanList(label && label.boxed_warning, 3),
    warnings: cleanList(label && label.warnings, 4),
    mechanism_of_action: cleanList(label && label.mechanism_of_action, 2),
    brand_names: cleanTokenList(openfda.brand_name, 10),
    dosage_forms: cleanTokenList(openfda.dosage_form, 8),
    routes: cleanTokenList(openfda.route, 8),
  };
}

function extractDailyMedEnrichment(result) {
  const entries = result && Array.isArray(result.entries) ? result.entries : [];
  const titles = entries
    .map((entry) => cleanSnippet(entry && entry.title ? entry.title : '', 120))
    .filter(Boolean);
  const setIds = entries
    .map((entry) => cleanSnippet(entry && entry.setid ? entry.setid : '', 80))
    .filter(Boolean);

  return {
    found: Boolean(result && result.found),
    url: result && result.url ? result.url : '',
    term_used: cleanSnippet(result && result.term_used ? result.term_used : '', 80),
    spl_count: entries.length,
    titles: Array.from(new Set(titles)).slice(0, 8),
    setids: Array.from(new Set(setIds)).slice(0, 8),
  };
}

function extractRxNormEnrichment(result) {
  const candidates = result && Array.isArray(result.candidates) ? result.candidates : [];
  const names = candidates
    .map((candidate) => cleanSnippet(candidate && candidate.rxstring ? candidate.rxstring : '', 100))
    .filter(Boolean);
  const rxcuis = candidates
    .map((candidate) => cleanSnippet(candidate && candidate.rxcui ? candidate.rxcui : '', 40))
    .filter(Boolean);

  return {
    found: Boolean(result && result.found),
    url: result && result.url ? result.url : '',
    term_used: cleanSnippet(result && result.term_used ? result.term_used : '', 80),
    candidate_count: candidates.length,
    candidate_terms: Array.from(new Set(names)).slice(0, 10),
    rxcuis: Array.from(new Set(rxcuis)).slice(0, 10),
  };
}

function extractRxClassEnrichment(result) {
  const classes = result && Array.isArray(result.classes) ? result.classes : [];
  const classNames = classes
    .map((entry) => cleanSnippet(entry && entry.rxclassMinConceptItem && entry.rxclassMinConceptItem.className, 120))
    .filter(Boolean);
  const classTypes = classes
    .map((entry) => cleanSnippet(entry && entry.rxclassMinConceptItem && entry.rxclassMinConceptItem.classType, 80))
    .filter(Boolean);

  return {
    found: Boolean(result && result.found),
    url: result && result.url ? result.url : '',
    rxcui: cleanSnippet(result && result.rxcui ? result.rxcui : '', 40),
    class_count: classes.length,
    class_names: Array.from(new Set(classNames)).slice(0, 12),
    class_types: Array.from(new Set(classTypes)).slice(0, 8),
  };
}

function extractRxTermsEnrichment(result) {
  const info = result && result.info ? result.info : null;

  return {
    found: Boolean(result && result.found && info),
    url: result && result.url ? result.url : '',
    rxcui: cleanSnippet(result && result.rxcui ? result.rxcui : '', 40),
    brand_name: cleanSnippet(info && info.brandName ? info.brandName : '', 120),
    generic_name: cleanSnippet(info && info.genericName ? info.genericName : '', 120),
    strength: cleanSnippet(info && info.strength ? info.strength : '', 120),
    route: cleanSnippet(info && info.route ? info.route : '', 80),
    dose_form: cleanSnippet(info && info.rxtermsDoseForm ? info.rxtermsDoseForm : '', 120),
  };
}

function extractMedlinePlusEnrichment(result) {
  const entries = result && Array.isArray(result.entries) ? result.entries : [];
  const titles = entries
    .map((entry) => {
      const title = entry && entry.title;
      if (title && typeof title === 'object' && Object.prototype.hasOwnProperty.call(title, '_value')) {
        return cleanSnippet(title._value, 160);
      }
      return cleanSnippet(title, 160);
    })
    .filter(Boolean);
  const links = entries
    .map((entry) => entry && entry.link && entry.link.href ? String(entry.link.href) : '')
    .filter(Boolean);

  return {
    found: Boolean(result && result.found),
    url: result && result.url ? result.url : '',
    rxcui: cleanSnippet(result && result.rxcui ? result.rxcui : '', 40),
    entry_count: entries.length,
    titles: Array.from(new Set(titles)).slice(0, 8),
    links: Array.from(new Set(links)).slice(0, 8),
  };
}

function extractDrugsFdaEnrichment(result) {
  const item = result && result.result ? result.result : null;
  const products = item && Array.isArray(item.products) ? item.products : [];

  const brands = products
    .map((product) => cleanSnippet(product && product.brand_name ? product.brand_name : '', 80))
    .filter(Boolean);
  const routes = products
    .flatMap((product) => cleanTokenList(product && product.route, 6));
  const dosageForms = products
    .flatMap((product) => cleanTokenList(product && product.dosage_form, 6));

  return {
    found: Boolean(result && result.found && item),
    url: result && result.url ? result.url : '',
    term_used: cleanSnippet(result && result.term_used ? result.term_used : '', 80),
    application_number: cleanSnippet(item && item.application_number ? item.application_number : '', 40),
    sponsor_name: cleanSnippet(item && item.sponsor_name ? item.sponsor_name : '', 100),
    products_count: products.length,
    brand_names: Array.from(new Set(brands)).slice(0, 10),
    routes: Array.from(new Set(routes)).slice(0, 10),
    dosage_forms: Array.from(new Set(dosageForms)).slice(0, 10),
  };
}

function mergeUnique(existing, additions, maxItems = 24) {
  const merged = Array.from(new Set([...(existing || []), ...(additions || [])].filter(Boolean)));
  return merged.slice(0, maxItems);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeSearchTerm(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripFormulationTokens(value) {
  return normalizeSearchTerm(value)
    .replace(/\b(ir|xr|er|odt|pm|dr|cr|sr)\b/g, ' ')
    .replace(/\b(oral|transdermal|nasal|chewable|suspension|solution|tablet|capsule|patch)\b/g, ' ')
    .replace(/\b(immediate release|extended release|delayed release|mixed salts)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSourceSearchTerms(medication) {
  const generic = medication && medication.generic_name ? medication.generic_name : '';
  const stripped = stripFormulationTokens(generic);
  const seeds = [
    stripped,
    generic,
    ...((medication && medication.brand_names) || []).slice(0, 3),
    ...((medication && medication.aliases) || []).slice(0, 4),
  ];

  return Array.from(new Set(
    seeds
      .map((term) => normalizeSearchTerm(term))
      .filter((term) => term.length >= 3),
  )).slice(0, 4);
}

async function resolveSourceAcrossTerms(fetcher, terms) {
  const options = arguments.length > 2 && arguments[2] ? arguments[2] : {};
  const maxTerms = Number.isFinite(Number(options.maxTerms)) ? Math.max(1, Math.floor(Number(options.maxTerms))) : terms.length;
  const searchTerms = terms.slice(0, maxTerms);
  const errors = [];
  let firstResponse = null;

  for (const term of searchTerms) {
    try {
      const response = await fetcher(term);
      const tagged = {
        ...response,
        term_used: term,
      };

      if (!firstResponse) {
        firstResponse = tagged;
      }

      if (tagged.found) {
        return {
          value: tagged,
          errors,
        };
      }
    } catch (error) {
      const message = String(error && error.message ? error.message : error);
      errors.push(message);
      if (/\(429\)/.test(message)) {
        break;
      }
    }
  }

  return {
    value: firstResponse || {
      found: false,
      source: '',
      url: '',
      updatedAt: new Date().toISOString(),
      term_used: searchTerms[0] || '',
    },
    errors,
  };
}

function createCachedFetcher(fetcher, options = {}) {
  const cache = new Map();
  const minIntervalMs = Number.isFinite(Number(options.minIntervalMs)) ? Math.max(0, Math.floor(Number(options.minIntervalMs))) : 0;
  const maxCalls = Number.isFinite(Number(options.maxCalls)) ? Math.max(1, Math.floor(Number(options.maxCalls))) : Number.POSITIVE_INFINITY;
  const maxRetries = Number.isFinite(Number(options.maxRetries)) ? Math.max(0, Math.floor(Number(options.maxRetries))) : 3;
  let queue = Promise.resolve();
  let lastStartedAt = 0;
  let callCount = 0;

  return async function cachedFetch(arg) {
    const key = typeof arg === 'string' ? normalizeSearchTerm(arg) : JSON.stringify(arg);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const task = async () => {
      if (callCount >= maxCalls) {
        throw new Error(`Request budget exceeded for ${options.label || 'source'}`);
      }

      if (minIntervalMs > 0) {
        const now = Date.now();
        const delay = Math.max(0, minIntervalMs - (now - lastStartedAt));
        if (delay > 0) {
          await sleep(delay);
        }
        lastStartedAt = Date.now();
      }

      callCount += 1;

      let attempt = 0;
      while (true) {
        try {
          return await fetcher(arg);
        } catch (error) {
          const message = String(error && error.message ? error.message : error);
          const retryable = /\(429\)|\b5\d\d\b/i.test(message);
          if (!retryable || attempt >= maxRetries) {
            throw error;
          }
          attempt += 1;
          const backoff = Math.min(6000, 400 * (2 ** attempt));
          const jitter = Math.floor(Math.random() * 220);
          await sleep(backoff + jitter);
        }
      }
    };

    const run = minIntervalMs > 0
      ? (queue = queue.then(task, task))
      : task();

    const promise = Promise.resolve(run)
      .catch((error) => {
        cache.delete(key);
        throw error;
      });

    cache.set(key, promise);
    return promise;
  };
}

async function resolvePreferredRxcuiAcrossTerms(terms, fetchStringLookup, fetchApproximateLookup) {
  const errors = [];
  const seen = new Set();
  const candidates = [];

  for (const term of terms) {
    try {
      const byString = await fetchStringLookup(term);
      const ids = byString && Array.isArray(byString.rxcuis) ? byString.rxcuis : [];
      ids.forEach((id) => {
        const normalized = cleanSnippet(id, 40);
        if (normalized && !seen.has(normalized)) {
          seen.add(normalized);
          candidates.push(normalized);
        }
      });
      if (candidates.length) {
        break;
      }
    } catch (error) {
      errors.push(String(error && error.message ? error.message : error));
    }
  }

  if (!candidates.length) {
    for (const term of terms) {
      try {
        const approximate = await fetchApproximateLookup(term);
        const approxCandidates = approximate && Array.isArray(approximate.candidates) ? approximate.candidates : [];
        approxCandidates.forEach((entry) => {
          const normalized = cleanSnippet(entry && entry.rxcui ? entry.rxcui : '', 40);
          if (normalized && !seen.has(normalized)) {
            seen.add(normalized);
            candidates.push(normalized);
          }
        });
        if (candidates.length) {
          break;
        }
      } catch (error) {
        errors.push(String(error && error.message ? error.message : error));
      }
    }
  }

  return {
    primary: candidates[0] || '',
    candidates,
    errors,
  };
}

async function resolveSourceByRxcui(fetcher, rxcui) {
  const errors = [];
  if (!rxcui) {
    return {
      value: { found: false, source: '', url: '', rxcui: '' },
      errors,
    };
  }

  try {
    const response = await fetcher(rxcui);
    return {
      value: {
        ...response,
        rxcui,
      },
      errors,
    };
  } catch (error) {
    errors.push(String(error && error.message ? error.message : error));
    return {
      value: { found: false, source: '', url: '', rxcui },
      errors,
    };
  }
}

const fetchDailyMedCached = createCachedFetcher(fetchDailyMedSplListing, {
  ...rateConfig.dailymed,
  label: 'DailyMed',
});
const fetchOpenFdaCached = createCachedFetcher(fetchOpenFdaLabelSummary, {
  ...rateConfig.openfda,
  label: 'openFDA',
});
const fetchRxNormApproximateCached = createCachedFetcher(fetchRxNormApproximateTerm, {
  ...rateConfig.rxnorm,
  label: 'RxNorm approximate',
});
const fetchRxNormByStringCached = createCachedFetcher(fetchRxNormRxcuiByString, {
  ...rateConfig.rxnorm,
  label: 'RxNorm rxcui',
});
const fetchRxClassCached = createCachedFetcher(fetchRxClassByRxcui, {
  ...rateConfig.rxclass,
  label: 'RxClass',
});
const fetchRxTermsCached = createCachedFetcher(fetchRxTermsByRxcui, {
  ...rateConfig.rxterms,
  label: 'RxTerms',
});
const fetchMedlinePlusCached = createCachedFetcher(fetchMedlinePlusByRxcui, {
  ...rateConfig.medlineplus,
  label: 'MedlinePlus',
});
const fetchDrugsFdaCached = createCachedFetcher(fetchDrugsFdaApproval, {
  ...rateConfig.drugsfda,
  label: 'Drugs@FDA',
});

for (const med of syncTargets) {
  const genericName = med.generic_name;
  const links = new Set(med.source_links || []);
  const notes = [];
  const sourceTerms = buildSourceSearchTerms(med);

  try {
    const rxcuiResolution = await resolvePreferredRxcuiAcrossTerms(
      sourceTerms,
      fetchRxNormByStringCached,
      fetchRxNormApproximateCached,
    );
    const primaryRxcui = rxcuiResolution.primary || '';

    const [dailyMedResolved, openFdaResolved, rxNormResolved, drugsFdaResolved, rxClassResolved, rxTermsResolved, medlinePlusResolved] = await Promise.all([
      resolveSourceAcrossTerms(fetchDailyMedCached, sourceTerms, { maxTerms: 3 }),
      resolveSourceAcrossTerms(fetchOpenFdaCached, sourceTerms, { maxTerms: OPENFDA_MAX_TERMS }),
      resolveSourceAcrossTerms(fetchRxNormApproximateCached, sourceTerms, { maxTerms: 3 }),
      resolveSourceAcrossTerms(fetchDrugsFdaCached, sourceTerms, { maxTerms: DRUGSFDA_MAX_TERMS }),
      resolveSourceByRxcui(fetchRxClassCached, primaryRxcui),
      resolveSourceByRxcui(fetchRxTermsCached, primaryRxcui),
      resolveSourceByRxcui(fetchMedlinePlusCached, primaryRxcui),
    ]);

    notes.push(...(rxcuiResolution.errors || []));
    [dailyMedResolved, openFdaResolved, rxNormResolved, drugsFdaResolved, rxClassResolved, rxTermsResolved, medlinePlusResolved].forEach((resolved) => {
      if (!resolved) return;
      notes.push(...(resolved.errors || []));
      if (resolved.value && resolved.value.found && resolved.value.url) {
        links.add(resolved.value.url);
      }
    });

    const dailyMedData = dailyMedResolved ? dailyMedResolved.value : null;
    const openFdaData = openFdaResolved ? openFdaResolved.value : null;
    const rxNormData = rxNormResolved ? rxNormResolved.value : null;
    const drugsFdaData = drugsFdaResolved ? drugsFdaResolved.value : null;
    const rxClassData = rxClassResolved ? rxClassResolved.value : null;
    const rxTermsData = rxTermsResolved ? rxTermsResolved.value : null;
    const medlinePlusData = medlinePlusResolved ? medlinePlusResolved.value : null;

    const enrichment = {
      updated_at: new Date().toISOString(),
      search_terms: sourceTerms,
      primary_rxcui: primaryRxcui,
      rxcui_candidates: rxcuiResolution.candidates || [],
      openfda: extractOpenFdaEnrichment(openFdaData),
      dailymed: extractDailyMedEnrichment(dailyMedData),
      rxnorm: extractRxNormEnrichment(rxNormData),
      rxclass: extractRxClassEnrichment(rxClassData),
      rxterms: extractRxTermsEnrichment(rxTermsData),
      medlineplus: extractMedlinePlusEnrichment(medlinePlusData),
      drugsfda: extractDrugsFdaEnrichment(drugsFdaData),
    };

    (enrichment.medlineplus.links || []).forEach((link) => links.add(link));

    med.source_enrichment = enrichment;
    med.brand_names = mergeUnique(
      med.brand_names,
      [
        ...enrichment.openfda.brand_names,
        ...enrichment.drugsfda.brand_names,
        ...(enrichment.rxterms.brand_name ? [enrichment.rxterms.brand_name] : []),
      ],
      16,
    );
    med.aliases = mergeUnique(
      med.aliases,
      [
        ...(med.brand_names || []),
        ...enrichment.rxnorm.candidate_terms,
        ...(enrichment.rxterms.generic_name ? [enrichment.rxterms.generic_name] : []),
      ],
      30,
    );

    med.source_links = Array.from(links);
    med.source_last_checked = new Date().toISOString();

    if (med.content_review_status === 'curated') {
      // Keep curated records curated; metadata changed underneath.
      med.content_review_status = 'curated';
    } else {
      med.content_review_status = 'source scored';
    }

    syncLog.push({
      id: med.id,
      generic_name: genericName,
      source_last_checked: med.source_last_checked,
      source_links_count: med.source_links.length,
      enrichment_sources_found: [
        enrichment.openfda.found ? 'openFDA' : '',
        enrichment.dailymed.found ? 'DailyMed' : '',
        enrichment.rxnorm.found ? 'RxNorm' : '',
        enrichment.rxclass.found ? 'RxClass' : '',
        enrichment.rxterms.found ? 'RxTerms' : '',
        enrichment.medlineplus.found ? 'MedlinePlus' : '',
        enrichment.drugsfda.found ? 'Drugs@FDA' : '',
      ].filter(Boolean),
      status: med.content_review_status,
      notes,
    });
  } catch (error) {
    syncLog.push({
      id: med.id,
      generic_name: genericName,
      source_last_checked: new Date().toISOString(),
      source_links_count: links.size,
      status: 'source scored',
      notes: [String(error && error.message ? error.message : error)],
    });
  }

  await new Promise((resolve) => setTimeout(resolve, 280));
}

sourcePayload.generated_at = new Date().toISOString();
sourcePayload.last_sync = {
  synced_at: new Date().toISOString(),
  synced_records: syncTargets.length,
};

fs.writeFileSync(sourcePath, JSON.stringify(sourcePayload, null, 2));
fs.writeFileSync(logPath, JSON.stringify({ generated_at: new Date().toISOString(), items: syncLog }, null, 2));

if (!skipCompile) {
  execFileSync(process.execPath, [compileScript], { stdio: 'inherit' });
}

console.log(`Source sync completed for ${syncTargets.length} medication records.`);
