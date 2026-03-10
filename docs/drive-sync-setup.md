# Astra Shared Drive Integration

This project now supports a Drive-primary sync mode through a Google Apps Script web endpoint.

## Folder bootstrap target

When `bootstrap` runs, the endpoint ensures this structure under **Note App**:

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
4. Set script property `DRIVE_REQUIRED_SHARED_DRIVE_ID` to your Astra shared drive ID.
5. Set script property `DRIVE_ALLOWED_USER_EMAILS` (comma-separated), e.g. `nick@astrapsychiatry.com,kris@astrapsychiatry.com`.
6. Set script property `DRIVE_SERVICE_TOKEN` to a long random secret for CLI/service automation.
7. Optional legacy compatibility: `DRIVE_OWNER_EMAIL`.
8. Deploy as web app:
   - Execute as: **Me**
   - Access: **Anyone** (required for cross-origin browser + CLI calls)
9. Copy the deployment URL.

## Local configuration

Create `config/drive-sync.local.json` (not committed) from `config/drive-sync.config.example.json`:

```json
{
  "endpointUrl": "https://script.google.com/macros/s/.../exec",
  "sharedDriveId": "...",
  "rootFolderName": "Note App",
  "userEmail": "nick@astrapsychiatry.com",
  "ownerEmail": "nick@astrapsychiatry.com",
  "serviceToken": "same-value-as-DRIVE_SERVICE_TOKEN",
  "manifestPath": "config/drive-manifest.json"
}
```

## Runtime app configuration (browser)

In `index.html` `<body>` data attributes:

- `data-drive-sync-enabled="true"`
- `data-drive-endpoint-url="..."`
- `data-drive-shared-drive-id="..."`
- `data-drive-root-folder-name="Note App"`
- `data-drive-user-email="nick@astrapsychiatry.com"` (or `?driveUserEmail=...` query override)
- `data-drive-owner-email="..."`
- `data-drive-service-token=""` (blank in browser; service token belongs in local automation config)
- `data-drive-sync-minutes="30"`

When enabled:

- Startup: health check + bootstrap + manifest pull + draft pull
- Background: sync cycle every `data-drive-sync-minutes`
- Retry queue: pending writes are retried with exponential backoff
- Conflict handling: revision mismatch triggers pull/merge/retry for draft writes
- Backups: snapshot appends are non-destructive
- Patient draft paths are user-scoped in Drive (`data/draft/users/<email-key>/...`)

## CLI helpers

- `npm run drive:bootstrap` -> ensure folders + manifest
- `npm run drive:audit-roots` -> report canonical vs duplicate root folders
- `npm run drive:cleanup:dry-run` -> preview archive-only cleanup candidates for duplicate My Drive clutter
- `npm run drive:cleanup:apply` -> move duplicate My Drive clutter into an archive folder (no delete)
- `npm run drive:publish` -> push med artifacts + manifest (skips unchanged files by checksum)
- `npm run drive:pull` -> pull med artifacts + manifest to local workspace
- `npm run med:knowledge-check` -> full med source refresh + compile + review + Drive publish
- `npm run med:refresh-if-stale` -> staleness-aware refresh (monthly threshold unless forced)

## Reliability notes

- The browser app keeps a local queue in `localStorage` when Drive is unavailable.
- `noteBuilderDraft_v1` remains the live local draft key.
- `noteBuilderSnapshots_v1` remains local snapshot history (last 3).
- `clear` only clears the current draft; snapshots stay intact by design.
- During each Drive sync cycle, the app also pulls `data/meds/compiled/medications.compiled.json` so medication reference updates published to Drive can appear in runtime without rebuilding the app shell.
