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

1. Compile baseline catalog (source + curated merge)
- `npm run med:compile`

2. Refresh source metadata from adapters
- `npm run med:sync`

3. Generate review report
- `npm run med:review`

4. (Optional) Publish to Astra Shared Drive canonical storage
- `npm run drive:publish`

## Auto-sync while app is open

The browser app runs a low-priority background sync loop:

- Catalog refresh check approximately every 6 hours
- Incremental source signal refresh approximately every 24 hours
- Broader refresh approximately every 7 days

These checks run on idle timers and keep interaction work non-blocking.

## Important limits

- Runtime browser sync updates local cache only (localStorage).
- For shared canonical catalog updates, run scripts and commit generated JSON.
- Curated psychiatry content should only be edited in curated files/scripts and reviewed clinically.
- Drive writes are owner-gated at the Apps Script layer (`DRIVE_OWNER_EMAIL` / `ownerEmail`).
