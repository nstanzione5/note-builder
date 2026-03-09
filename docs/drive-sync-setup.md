# Astra Shared Drive Integration

This project now supports a Drive-primary sync mode through a Google Apps Script web endpoint.

## Folder bootstrap target

When `bootstrap` runs, the endpoint ensures this structure under **Astra Clinical Note Builder**:

- `app-shell`
- `data/meds/source`
- `data/meds/curated`
- `data/meds/compiled`
- `data/meds/review`
- `data/draft`
- `backups/notes`
- `logs/sync`
- `config`

It also creates/updates `config/drive-manifest.json` with revision/checksum/path maps.

## Apps Script setup

1. Open Apps Script and create a standalone project.
2. Enable the **Advanced Drive API** service in Apps Script.
3. Copy `scripts/drive/apps-script/Code.gs` and `scripts/drive/apps-script/appsscript.json` into the project.
4. Set script property `DRIVE_OWNER_EMAIL` (optional but recommended).
5. Deploy as web app:
   - Execute as: **User accessing the web app**
   - Access: your org/users as needed
6. Copy the deployment URL.

## Local configuration

Create `config/drive-sync.local.json` (not committed) from `config/drive-sync.config.example.json`:

```json
{
  "endpointUrl": "https://script.google.com/macros/s/.../exec",
  "sharedDriveId": "...",
  "rootFolderName": "Astra Clinical Note Builder",
  "ownerEmail": "nick@astrapsychiatry.com",
  "manifestPath": "config/drive-manifest.json"
}
```

## Runtime app configuration (browser)

In `index.html` `<body>` data attributes:

- `data-drive-sync-enabled="true"`
- `data-drive-endpoint-url="..."`
- `data-drive-shared-drive-id="..."`
- `data-drive-root-folder-name="Astra Clinical Note Builder"`
- `data-drive-owner-email="..."`
- `data-drive-sync-minutes="30"`

When enabled:

- Startup: health check + bootstrap + manifest pull + draft pull
- Background: sync cycle every `data-drive-sync-minutes`
- Retry queue: pending writes are retried with exponential backoff
- Conflict handling: revision mismatch triggers pull/merge/retry for draft writes
- Backups: snapshot appends are non-destructive

## CLI helpers

- `npm run drive:bootstrap` -> ensure folders + manifest
- `npm run drive:publish` -> push med artifacts + manifest
- `npm run drive:pull` -> pull med artifacts + manifest to local workspace

## Reliability notes

- The browser app keeps a local queue in `localStorage` when Drive is unavailable.
- `noteBuilderDraft_v1` remains the live local draft key.
- `noteBuilderSnapshots_v1` remains local snapshot history (last 3).
- `clear` only clears the current draft; snapshots stay intact by design.
