# Astra Drive Sync

The supported design is the authenticated Google Cloud service documented in
[`google-cloud-deployment.md`](./google-cloud-deployment.md). The browser no
longer accepts a typed email, service token, Drive identifier, or Apps Script
URL. It obtains a Google ID token and the server independently verifies both
the token and the server-side user allowlist before accessing the Shared Drive.

## Operational model

- Cloud Run serves the application and `/api/v1/actions` from one origin.
- Application Default Credentials give the service account Drive access; no
  downloadable service-account key is used.
- Each approved user's drafts remain isolated in that user's existing folder.
- Writes use Drive revision checks so an older browser cannot silently replace
  a newer draft.
- The browser queues unsynced work locally and reports sync state explicitly.

## Legacy Apps Script fallback

The former Apps Script deployment is not linked from the production client and
must remain read-only during the 14-day migration observation period. It is a
recovery reference only, not a second active writer. After production save,
refresh, restore, and conflict tests pass for both approved users, disable the
web deployment and remove its stored service token.

Do not paste patient data, OAuth tokens, user lists, Drive IDs, or deployment
URLs into issues, commits, build substitutions, or diagnostic messages.
