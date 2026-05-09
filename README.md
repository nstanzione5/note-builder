# Astra Note Builder

## Where to Upload Astra Files

The Astra Letter Generator is a GPT packet generator only. It does not create final documents, write to Google Drive, or upload patient notes. Providers should paste the generated packet into the Astra Clinical Letter GPT and upload the most recent patient note directly to that GPT when using an approved secure clinical workflow.

Local app files:

- `/public/astra/logo.png` - Astra logo used as the configured logo reference.
- `/public/astra/letterhead-background.png` - optional Astra letterhead background reference.
- `/public/signatures/nick-stanzione.png` - Nick Stanzione signature image.
- `/public/signatures/kris-generales.png` - Kris Generales signature image.
- `/src/config/astraProviders.json` - editable provider names, credentials, state license lines, signature paths, active status, and signature fallback text.
- `/src/config/astraDocumentTypes.json` - editable document type dropdown options and GPT guidance.
- `/src/config/astraBranding.json` - editable practice contact info, logo paths, letterhead path, and Astra colors.

Recommended Google Drive folder for manual source-of-truth storage:

`Astra GPT Provider Assets`

Suggested contents:

- `Astra_Provider_Info.json`
- `Astra_Branding_Info.json`
- `Astra_Document_Types.json`
- `Nick_Stanzione_Signature.png`
- `Kris_Generales_Signature.png`
- `Astra_Logo.png`
- `Astra_Letterhead.png` or `Astra_Letterhead.docx`
- `Astra_Custom_GPT_Instructions.txt`

If using the Custom GPT as the source of generation, upload the same provider, branding, document type, logo, letterhead, and signature files as GPT knowledge files. If using Google Drive as a manual source of truth, keep the Drive folder updated and copy/download current files into the local app paths or GPT knowledge files as needed.

This app does not require or perform Google Drive writes. Future read-only Google Sheet or Drive-hosted JSON loading can replace the local config files without rewriting the Letter Generator UI.
