# Astra Letter GPT Knowledge Upload

Use this checklist when configuring the Astra Document Generator GPT.

## Files To Add To GPT Knowledge

- Astra branding or letterhead reference.
- Provider signature image files.
- Optional clinician metadata reference if the GPT needs a static backup.
- The current `docs/astra-patient-letter-gpt-spec.md`.

Do not add PHI, patient notes, or patient-specific forms to GPT Knowledge. Upload patient-specific material only inside the individual GPT chat.

## Signature Assets

- Keep signature images out of the public app repo.
- Name each signature asset clearly, for example `Nick Stanzione signature`.
- Match that label in `config/astra-clinicians.json` under `signatureAsset`.
- If multiple clinicians are added, upload one signature asset per clinician and use distinct labels.

## Custom GPT Instructions

Paste the Custom GPT Instructions Draft from `docs/astra-patient-letter-gpt-spec.md` into the GPT instructions field.

The GPT should:

- Format letters with Astra branding and sensible spacing.
- Use the uploaded prior note for demographics and background.
- Use the selected clinician/state metadata from the packet.
- Use the matching signature asset from GPT Knowledge.
- Avoid diagnosis, medication, and functional limitation disclosure unless allowed by the packet.
- Avoid legal conclusions and unsupported certainty.

## Smoke Test

1. Open the Letter Writer app.
2. Select a clinician and state.
3. Enter a recipient and short purpose.
4. Click `Copy Packet`.
5. Open the Astra Document Generator GPT.
6. Upload a non-PHI sample prior note or use synthetic sample details.
7. Paste the packet.
8. Confirm the output has:
   - Astra header or letterhead styling
   - correct clinician and state license
   - correct signature asset or signature block
   - minimal disclosure
   - no invented facts
