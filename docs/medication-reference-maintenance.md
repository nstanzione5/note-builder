# Medication Reference Maintenance

## Accuracy model

The medication system uses two independent layers:

1. Source-derived fields (official normalization + metadata)
- Brand/generic alias mapping
- Formulation and route metadata
- Source links + sync timestamps
- Reliability scoring (`reliability_score`, `reliability_tier`, `reliability_sources`)

2. Curated psychiatry fields (editorial)
- Psych-focused FDA and off-label display text
- Practical outpatient dosing summaries
- Psych interaction summaries
- Side effects, MOA, and clinical pearls

Source metadata can be refreshed without overwriting curated psych summaries.

### Reliability tiers

Source reliability is scored with weighted source signals and content coverage:

- `very-high`: curated editorial coverage (or equivalent high-confidence blend)
- `high`: multiple top-tier source hits + broad field coverage
- `moderate`: trusted source presence with partial psych-field coverage
- `low`: sparse source evidence and/or limited clinical field coverage

Current source weighting order:
- `DailyMed` > `openFDA` > `Drugs@FDA` > `RxNorm` > `RxClass` > `RxTerms` > `MedlinePlus`

Runtime supplemental fetches (in-drawer) now blend:
- `openFDA` labeling snippets
- `RxNorm` lookup/properties
- `RxTerms` free table API (ClinicalTables)
- `MedlinePlus Connect` summaries

## File structure

- `data/meds/source/medications.source.json`: source-derived metadata baseline
- `data/meds/curated/medications.curated.json`: curated psychiatry overrides
- `data/meds/compiled/medications.compiled.json`: runtime drawer catalog
- `data/meds/review/*.json`: review queue and sync logs
- `data/meds/review/runtime-fallbacks.json`: low-confidence runtime fallback entries captured from in-app lookup

## Update workflow

1. Run full knowledge check + compile + review + Drive publish
- `npm run med:knowledge-check`

2. Local-only check (no Drive publish)
- `npm run med:knowledge-check:local`

3. Staleness-aware full refresh (default 30-day threshold)
- `npm run med:refresh-if-stale`
- `npm run med:refresh-if-stale -- --force` (manual override)

4. Force initial backend sync/index/publish (explicit alias)
- `npm run med:initial-sync`

5. Manual steps (if needed)
- `npm run med:sync`
- `npm run med:compile`
- `npm run med:review`
- `npm run drive:publish`

## Auto-sync while app is open

The browser app runs a low-priority background loop:

- Weekly medication catalog drift check (manifest/checksum based)
- Monthly staleness threshold check for the compiled dataset
- If stale, queue a refresh request in Drive (`logs/sync/med-refresh-requests.json`)

All checks run on idle timers and avoid blocking note entry.

When Drive sync is enabled, each Drive sync cycle also pulls:
- `data/meds/compiled/medications.compiled.json`

This lets app runtime pick up newly published catalog data without requiring a page rebuild. The sync interval is controlled by:
- `<body data-drive-sync-minutes="...">` in `index.html`

## Important limits

- Runtime browser sync does not republish canonical catalog files.
- Shared canonical catalog updates are performed by owner-side maintenance (`med:refresh-if-stale` or `med:knowledge-check`).
- Curated psychiatry content should only be edited in curated files/scripts and reviewed clinically.
- Drive writes are gated by Apps Script allowlist/service token policy.
- `openFDA` endpoints can rate-limit sync jobs (HTTP 429). The sync script now defaults to slower openFDA pacing, but you can tune:
  - `OPENFDA_MIN_INTERVAL_MS` (default `1500`)
  - `OPENFDA_MAX_TERMS` (default `2`)
  - `DRUGSFDA_MAX_TERMS` (default `2`)
- For best coverage, set `OPENFDA_API_KEY` in your shell before running sync jobs, or add `openfdaApiKey` to `config/drive-sync.local.json`.
