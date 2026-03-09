#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { fetchDailyMedSplListing } from './adapters/dailymed.mjs';
import { fetchOpenFdaLabelSummary } from './adapters/openfda.mjs';
import { fetchRxNormApproximateTerm } from './adapters/rxnorm.mjs';
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
    dosage_and_administration: cleanList(label && label.dosage_and_administration, 6),
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
  let queue = Promise.resolve();
  let lastStartedAt = 0;

  return async function cachedFetch(term) {
    const key = normalizeSearchTerm(term);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const task = async () => {
      if (minIntervalMs > 0) {
        const now = Date.now();
        const delay = Math.max(0, minIntervalMs - (now - lastStartedAt));
        if (delay > 0) {
          await sleep(delay);
        }
        lastStartedAt = Date.now();
      }

      return fetcher(term);
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

const fetchDailyMedCached = createCachedFetcher(fetchDailyMedSplListing);
const fetchOpenFdaCached = createCachedFetcher(fetchOpenFdaLabelSummary, { minIntervalMs: 450 });
const fetchRxNormCached = createCachedFetcher(fetchRxNormApproximateTerm);
const fetchDrugsFdaCached = createCachedFetcher(fetchDrugsFdaApproval, { minIntervalMs: 450 });

for (const med of syncTargets) {
  const genericName = med.generic_name;
  const links = new Set(med.source_links || []);
  const notes = [];
  const sourceTerms = buildSourceSearchTerms(med);

  try {
    const [dailyMedResolved, openFdaResolved, rxNormResolved, drugsFdaResolved] = await Promise.all([
      resolveSourceAcrossTerms(fetchDailyMedCached, sourceTerms, { maxTerms: 3 }),
      resolveSourceAcrossTerms(fetchOpenFdaCached, sourceTerms, { maxTerms: 1 }),
      resolveSourceAcrossTerms(fetchRxNormCached, sourceTerms, { maxTerms: 3 }),
      resolveSourceAcrossTerms(fetchDrugsFdaCached, sourceTerms, { maxTerms: 1 }),
    ]);

    [dailyMedResolved, openFdaResolved, rxNormResolved, drugsFdaResolved].forEach((resolved) => {
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

    const enrichment = {
      updated_at: new Date().toISOString(),
      search_terms: sourceTerms,
      openfda: extractOpenFdaEnrichment(openFdaData),
      dailymed: extractDailyMedEnrichment(dailyMedData),
      rxnorm: extractRxNormEnrichment(rxNormData),
      drugsfda: extractDrugsFdaEnrichment(drugsFdaData),
    };

    med.source_enrichment = enrichment;
    med.brand_names = mergeUnique(
      med.brand_names,
      [
        ...enrichment.openfda.brand_names,
        ...enrichment.drugsfda.brand_names,
      ],
      16,
    );
    med.aliases = mergeUnique(
      med.aliases,
      [
        ...(med.brand_names || []),
        ...enrichment.rxnorm.candidate_terms,
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
