# Medication Reference Maintenance

## Accuracy model

The medication system uses two independent layers:

1. Source-derived fields (official normalization + metadata)
- Brand/generic alias mapping
- Formulation and route metadata
- Source links + sync timestamps
- Review status flags

2. Curated psychiatry fields (editorial)
- Psych-focused FDA and off-label display text
- Practical outpatient dosing summaries
- Psych interaction summaries
- Side effects, MOA, and clinical pearls

Source metadata can be refreshed without overwriting curated psych summaries.

## File structure

- `data/meds/source/medications.source.json`: source-derived metadata baseline
- `data/meds/curated/medications.curated.json`: curated psychiatry overrides
- `data/meds/compiled/medications.compiled.json`: runtime drawer catalog
- `data/meds/review/*.json`: review queue and sync logs

## Update workflow

1. Run full knowledge check + compile + review + Drive publish
- `npm run med:knowledge-check`

2. Local-only check (no Drive publish)
- `npm run med:knowledge-check:local`

3. Force initial backend sync/index/publish (explicit alias)
- `npm run med:initial-sync`

4. Manual steps (if needed)
- `npm run med:sync`
- `npm run med:compile`
- `npm run med:review`
- `npm run drive:publish`

## Auto-sync while app is open

The browser app runs a low-priority background sync loop:

- Catalog refresh check approximately every 6 hours
- Incremental source signal refresh approximately every 24 hours
- Broader refresh approximately every 7 days

These checks run on idle timers and keep interaction work non-blocking.

When Drive sync is enabled, each Drive sync cycle also pulls:
- `data/meds/compiled/medications.compiled.json`

This lets app runtime pick up newly published catalog data without requiring a page rebuild. The sync interval is controlled by:
- `<body data-drive-sync-minutes="...">` in `index.html`

## Important limits

- Runtime browser sync updates local cache only (localStorage).
- For shared canonical catalog updates, run `npm run med:knowledge-check` from this workspace.
- Curated psychiatry content should only be edited in curated files/scripts and reviewed clinically.
- Drive writes are owner-gated at the Apps Script layer (`DRIVE_OWNER_EMAIL` and/or `DRIVE_OWNER_TOKEN`).
