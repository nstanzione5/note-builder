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
8. For one-time pointer reset before first stabilized rollout, clear:
   - `DRIVE_ROOT_FOLDER_ID`
   - `DRIVE_ROOT_FOLDER_NAME`
   - `DRIVE_ROOT_SHARED_DRIVE_ID`
   - `DRIVE_MANIFEST_FILE_ID`
   - `DRIVE_PATH_INDEX`
9. Deploy as web app:
   - Execute as: **User accessing the web app**
   - Access: **Anyone** (required for cross-origin browser + CLI calls)
10. Copy the deployment URL.

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
- `data-drive-user-email=""` (leave blank in production; optional `?driveUserEmail=...` override for troubleshooting only)
- `data-drive-owner-email="..."`
- `data-drive-service-token=""` (blank in browser; service token belongs in local automation config)
- `data-drive-sync-minutes="30"`

When enabled:

- Startup: health check + bootstrap + manifest pull + draft pull
- Background: sync cycle every `data-drive-sync-minutes`
- If `manifest.get` is unavailable, browser Drive writes are hard-blocked to prevent duplicate file churn.
- Retry queue: pending writes are retried with exponential backoff
- Conflict handling: revision mismatch triggers pull/merge/retry for draft writes
- Backups: snapshot appends are non-destructive
- Patient draft paths are user-scoped in Drive (`data/draft/users/<email-key>/...`)
- Scoped draft paths are keyed by backend-resolved user identity from `health`; if identity cannot be resolved, writes are blocked with `identity_missing` (fail-safe against cross-user leakage).
- A low-frequency My Drive cleanup pass can run at most once per day (`cleanup.apply`) to trash known legacy app artifacts.

## CLI helpers

- `npm run drive:bootstrap` -> ensure folders + manifest
- `npm run drive:audit-roots` -> report canonical vs duplicate root folders
- `npm run drive:cleanup:dry-run` -> preview high-volume direct-trash cleanup candidates (`cleanup.preview`)
- `npm run drive:cleanup:apply` -> apply batched direct-trash cleanup (`cleanup.apply`)
- `npm run drive:publish` -> push med artifacts, provider scripts, and manifest (skips unchanged files by checksum)
- `npm run drive:pull` -> pull med artifacts, provider scripts, and manifest to local workspace
- `npm run med:knowledge-check` -> full med source refresh + compile + review + Drive publish
- `npm run med:refresh-if-stale` -> staleness-aware refresh (monthly threshold unless forced)

## Reliability notes

- The browser app keeps a local queue in `localStorage` when Drive is unavailable.
- `noteBuilderDraft_v1` remains the live local draft key.
- `noteBuilderSnapshots_v1` remains local snapshot history (last 3).
- `clear` only clears the current draft; snapshots stay intact by design.
- During each Drive sync cycle, the app also pulls `data/meds/compiled/medications.compiled.json` so medication reference updates published to Drive can appear in runtime without rebuilding the app shell.
- During each Drive sync cycle, the app tries `config/provider-scripts.json` from Drive first for Astra provider scripts and keeps the bundled JSON as the offline fallback.
- Health now includes `appBuildId`, `resolvedUserEmail`, and explicit preflight status codes (`ok`, `root_missing`, `manifest_missing`, `identity_missing`, `version_mismatch`).
- Cleanup now uses direct trash batches (`cleanup.preview` / `cleanup.apply`) instead of archive-only condense for large-scale My Drive artifact removal.

## Apps Script troubleshooting

If the Apps Script web app page shows a repeating Google message such as "There was a problem" or "Something went wrong":

1. Open the deployment URL with `?action=health`. It should return JSON.
2. Open the deployment URL with `?ui=1`. It should show the Astra Drive Sync Status page.
3. In Apps Script, open **Executions** and inspect the latest failed run.
4. Confirm **Advanced Drive API** is enabled in the Apps Script project:
   - Open **Services** in Apps Script.
   - Add **Drive API**.
   - Confirm the identifier is exactly `Drive`.
   - Open the linked Google Cloud project and confirm **Google Drive API** is enabled there too.
5. Confirm the web app deployment is:
   - Execute as: **User accessing the web app**
   - Access: **Anyone**
6. Confirm `APP_BUILD_ID` in `scripts/drive/apps-script/Code.gs` matches the browser `data-app-build-id`.
7. Redeploy as a new web app version after changing Apps Script code.
8. Run `npm run drive:bootstrap` only after `?action=health` responds.

`version_mismatch` means the browser is newer than the deployed Apps Script backend. This is a safety block. Redeploy Apps Script rather than removing the block.

If an execution error points at `Drive.Files.get`, the script reached the Advanced Drive metadata call. That is usually one of three things: the Advanced Drive API service is missing, the linked Google Cloud Drive API is disabled, or the executing user cannot access the configured root/file. The health UI reports this as **Advanced Drive API** plus a detail message.

If `?action=health` still returns an old `appBuildId`, the Apps Script editor may have the new code but the public web app deployment is still old. Use **Deploy > Manage deployments > Edit > Version > New version > Deploy**, then reload the exact `/exec?action=health` URL.
