# Astra Google Cloud Deployment

This deployment replaces the public Apps Script write endpoint with one
authenticated Cloud Run service. It keeps the existing Shared Drive root and
per-user JSON paths.

## One-time compliance and admin gate

Before any PHI-bearing request reaches the service:

1. Confirm the selected Google Cloud project belongs to Astra's BAA-covered
   organization and uses only generally available covered services.
2. Enable Cloud Run, Cloud Build, Artifact Registry, Drive API, and the Google
   Auth Platform.
3. Create the `astra-note-builder` service account without a downloaded key.
4. Add that service account to the existing Shared Drive with the minimum role
   that can read and update the Note App root.
5. Create a Google web OAuth client for the production Cloud Run origin.
6. Store these runtime values outside Git:
   `GOOGLE_OAUTH_CLIENT_ID`, `ASTRA_ALLOWED_USERS`,
   `ASTRA_SHARED_DRIVE_ID`, and `ASTRA_DRIVE_ROOT_FOLDER_ID`.

Do not place patient data, tokens, Drive IDs, user lists, or credentials in
source, build substitutions, container labels, or log metadata.

## Deployment

The build runs the complete test suite, builds an immutable image in Artifact
Registry, and deploys a tagged `candidate` Cloud Run revision with no production
traffic. Configure secrets/environment on the service before the build. Promote
traffic only after the candidate passes the checks below.

The web service is publicly reachable so the sign-in page can load. Every
PHI-bearing `/api/v1/actions` request independently requires a verified Google
ID token and the server-side allowlist; public reachability does not grant
Drive access.

Production verification uses a disposable non-PHI draft:

1. Sign in with each approved Workspace account without entering an email.
2. Confirm an unapproved account receives `identity_not_allowlisted`.
3. Save, refresh, restore, and revision-conflict test the disposable draft.
4. Confirm API responses and Cloud Logging contain no note content.
5. Confirm the UI and API report the same build ID.

Then promote that exact tested revision with Cloud Run traffic management. If
validation fails, leave production traffic unchanged and remove the candidate
tag; the current application remains the rollback target.

Keep the Apps Script deployment unlinked from production for 14 days as a
read-only reference. Cloud Run revision traffic provides application rollback.
After the observation window, disable the Apps Script web deployment and remove
the Vercel production surface.
