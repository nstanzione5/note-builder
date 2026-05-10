const LETTER_STORAGE_KEY = 'patientLettersDraft_v1';
const CLINICIAN_CONFIG_PATH = 'config/astra-clinicians.json';
const LETTER_GPT_URL = String(document.body.dataset.astraLetterGptUrl || '').trim();

const LETTER_TYPE_LABELS = {
  workSchoolNote: 'Work / School Note',
  returnToWorkSchool: 'Return to Work / School',
  treatmentVerification: 'Treatment Verification',
  accommodation: 'Accommodation Letter',
  esa: 'Emotional Support Animal Letter',
  medicationTreatmentSummary: 'Medication / Treatment Summary',
  medicalNecessity: 'Medical Necessity / Prior Authorization Support',
  custom: 'Custom Letter',
};

const DISCLOSURE_DEFAULTS = {
  letterConsentConfirmed: false,
  letterPreviousNoteUploaded: true,
  letterIncludeDiagnosis: false,
  letterIncludeMedications: false,
  letterIncludeSymptoms: false,
  letterIncludeFunctionalLimitations: false,
};

const FUNCTIONAL_LIMITATION_TYPES = new Set(['accommodation', 'esa', 'medicalNecessity']);
const STATE_CODES = ['NY', 'CT', 'DE'];

const fallbackClinicianConfig = {
  version: 1,
  clinicians: [
    {
      id: 'nick-stanzione',
      displayName: 'Nick Stanzione',
      credentials: 'PMHNP',
      title: 'Psychiatric Mental Health Nurse Practitioner',
      states: {
        NY: { license: '', address: '', signatureBlock: 'Nick Stanzione, PMHNP', signatureAsset: '' },
        CT: { license: '', address: '', signatureBlock: 'Nick Stanzione, PMHNP', signatureAsset: '' },
        DE: { license: '', address: '', signatureBlock: 'Nick Stanzione, PMHNP', signatureAsset: '' },
      },
    },
  ],
};

const state = {
  clinicianConfig: fallbackClinicianConfig,
  selectedClinicianId: 'nick-stanzione',
  selectedState: 'NY',
  configSource: 'local',
};

const els = {
  configStatus: document.getElementById('clinicianConfigStatus'),
  clinicianSelect: document.getElementById('clinicianSelect'),
  stateToggle: document.getElementById('clinicianStateToggle'),
  clinicianMeta: document.getElementById('clinicianMeta'),
  letterType: document.getElementById('letterType'),
  letterDate: document.getElementById('letterDate'),
  letterRecipient: document.getElementById('letterRecipient'),
  letterRecipientAddress: document.getElementById('letterRecipientAddress'),
  letterPurpose: document.getElementById('letterPurpose'),
  letterAttachmentManifest: document.getElementById('letterAttachmentManifest'),
  letterExportBox: document.getElementById('letterExportBox'),
  buildBtn: document.getElementById('buildLetterPacketBtn'),
  copyBtn: document.getElementById('copyLetterPacketBtn'),
  copyOpenBtn: document.getElementById('copyOpenLetterGptBtn'),
  openBtn: document.getElementById('openLetterGptBtn'),
  openRailBtn: document.getElementById('openLetterGptRailBtn'),
  clearBtn: document.getElementById('clearLetterFieldsBtn'),
  consentWarning: document.getElementById('letterConsentWarning'),
};

const fieldIds = [
  'letterType',
  'letterDate',
  'clinicianSelect',
  'letterRecipient',
  'letterRecipientAddress',
  'letterPurpose',
  'letterAttachmentManifest',
];

const checkboxIds = Object.keys(DISCLOSURE_DEFAULTS);

function getEl(id) {
  return document.getElementById(id);
}

function getValue(id) {
  const el = getEl(id);
  return el ? String(el.value || '').trim() : '';
}

function setValue(id, value) {
  const el = getEl(id);
  if (el) el.value = value == null ? '' : String(value);
}

function getChecked(id) {
  const el = getEl(id);
  return Boolean(el && el.checked);
}

function setChecked(id, value) {
  const el = getEl(id);
  if (el) el.checked = Boolean(value);
}

function yesNo(value) {
  return value ? 'Yes' : 'No';
}

function display(value, fallback = '[Not provided]') {
  const text = String(value || '').trim();
  return text || fallback;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getDriveConfig() {
  const dataset = document.body.dataset || {};
  return {
    enabled: dataset.driveSyncEnabled === 'true',
    endpointUrl: String(dataset.driveEndpointUrl || '').trim(),
    sharedDriveId: String(dataset.driveSharedDriveId || '').trim(),
    rootFolderId: String(dataset.driveRootFolderId || '').trim(),
    rootFolderName: String(dataset.driveRootFolderName || '').trim(),
    userEmail: String(dataset.driveUserEmail || '').trim(),
    ownerEmail: String(dataset.driveOwnerEmail || '').trim(),
    serviceToken: String(dataset.driveServiceToken || '').trim(),
    ownerToken: String(dataset.driveOwnerToken || '').trim(),
    appBuildId: String(dataset.appBuildId || '').trim(),
  };
}

async function callDriveFileGet(path) {
  const config = getDriveConfig();
  if (!config.enabled || !config.endpointUrl) {
    throw new Error('Drive config unavailable.');
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = controller ? window.setTimeout(() => controller.abort(), 2500) : null;

  try {
    const response = await fetch(config.endpointUrl, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-store',
      signal: controller ? controller.signal : undefined,
      body: JSON.stringify({
        action: 'file.get',
        path,
        sharedDriveId: config.sharedDriveId,
        rootFolderId: config.rootFolderId,
        rootFolderName: config.rootFolderName,
        userEmail: config.userEmail,
        serviceToken: config.serviceToken || config.ownerToken,
        ownerEmail: config.ownerEmail,
        ownerToken: config.ownerToken,
        clientBuildId: config.appBuildId,
        client: {
          app: 'note-builder-letter-writer',
          appBuildId: config.appBuildId,
          timestamp: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
          origin: window.location.origin || '',
        },
      }),
    });
    if (!response.ok) throw new Error(`Drive file.get failed (${response.status}).`);
    const payload = await response.json();
    if (payload && payload.ok === false) throw new Error(payload.error || 'Drive file.get failed.');
    const file = payload.file || payload;
    const content = typeof file.content === 'string' ? file.content : '';
    if (!content) throw new Error('Drive config file was empty.');
    return JSON.parse(content);
  } finally {
    if (timeout) window.clearTimeout(timeout);
  }
}

async function loadLocalClinicianConfig() {
  const response = await fetch(`./${CLINICIAN_CONFIG_PATH}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Local clinician config failed (${response.status}).`);
  return response.json();
}

function normalizeClinicianConfig(config) {
  const clinicians = Array.isArray(config && config.clinicians) ? config.clinicians : [];
  const cleanClinicians = clinicians
    .filter((clinician) => clinician && clinician.id && clinician.displayName)
    .map((clinician) => ({
      id: String(clinician.id),
      displayName: String(clinician.displayName),
      credentials: String(clinician.credentials || ''),
      title: String(clinician.title || ''),
      states: STATE_CODES.reduce((acc, code) => {
        const source = (clinician.states && clinician.states[code]) || {};
        acc[code] = {
          license: String(source.license || ''),
          address: String(source.address || ''),
          signatureBlock: String(source.signatureBlock || `${clinician.displayName}${clinician.credentials ? `, ${clinician.credentials}` : ''}`),
          signatureAsset: String(source.signatureAsset || source.signatureAssetPath || ''),
        };
        return acc;
      }, {}),
    }));

  return {
    version: Number(config && config.version) || 1,
    clinicians: cleanClinicians.length ? cleanClinicians : fallbackClinicianConfig.clinicians,
  };
}

async function loadClinicianConfig() {
  try {
    const driveConfig = await callDriveFileGet(CLINICIAN_CONFIG_PATH);
    state.clinicianConfig = normalizeClinicianConfig(driveConfig);
    state.configSource = 'Drive';
  } catch (driveError) {
    try {
      const localConfig = await loadLocalClinicianConfig();
      state.clinicianConfig = normalizeClinicianConfig(localConfig);
      state.configSource = 'local';
    } catch (localError) {
      console.error('Unable to load clinician config:', driveError, localError);
      state.clinicianConfig = fallbackClinicianConfig;
      state.configSource = 'fallback';
    }
  }

  renderClinicianOptions();
}

function getSelectedClinician() {
  return state.clinicianConfig.clinicians.find((clinician) => clinician.id === state.selectedClinicianId)
    || state.clinicianConfig.clinicians[0]
    || fallbackClinicianConfig.clinicians[0];
}

function getSelectedStateDetails() {
  const clinician = getSelectedClinician();
  return (clinician.states && clinician.states[state.selectedState]) || {};
}

function renderClinicianOptions() {
  const clinicians = state.clinicianConfig.clinicians;
  if (!clinicians.some((clinician) => clinician.id === state.selectedClinicianId)) {
    state.selectedClinicianId = clinicians[0] ? clinicians[0].id : 'nick-stanzione';
  }

  if (els.clinicianSelect) {
    els.clinicianSelect.innerHTML = clinicians
      .map((clinician) => `<option value="${escapeHtml(clinician.id)}">${escapeHtml(clinician.displayName)}</option>`)
      .join('');
    els.clinicianSelect.value = state.selectedClinicianId;
  }

  updateClinicianMeta();
}

function updateStateToggle() {
  document.querySelectorAll('[data-clinician-state]').forEach((btn) => {
    const active = btn.dataset.clinicianState === state.selectedState;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

function updateClinicianMeta() {
  const clinician = getSelectedClinician();
  const details = getSelectedStateDetails();
  updateStateToggle();

  if (els.configStatus) {
    els.configStatus.textContent = state.configSource === 'Drive'
      ? 'Clinicians from Drive'
      : 'Clinicians from local config';
  }

  if (els.clinicianMeta) {
    const license = details.license || 'License pending in config';
    const address = details.address || 'Address pending in config';
    const signature = details.signatureBlock || 'Signature block pending in config';
    els.clinicianMeta.innerHTML = `
      <span>${escapeHtml(clinician.displayName)}, ${escapeHtml(clinician.credentials || '')}</span>
      <span>${escapeHtml(state.selectedState)} license: ${escapeHtml(license)}</span>
      <span>${escapeHtml(address)}</span>
      <span>Signature: ${escapeHtml(signature)}</span>
    `;
  }
}

function setDefaultDate() {
  if (getValue('letterDate')) return;
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  setValue('letterDate', `${yyyy}-${mm}-${dd}`);
}

function applyDisclosureDefaults() {
  Object.entries(DISCLOSURE_DEFAULTS).forEach(([id, value]) => setChecked(id, value));
  setChecked('letterIncludeFunctionalLimitations', FUNCTIONAL_LIMITATION_TYPES.has(getValue('letterType')));
}

function syncControls() {
  updateClinicianMeta();
  if (els.consentWarning) {
    const hasRecipient = Boolean(getValue('letterRecipient') || getValue('letterRecipientAddress'));
    els.consentWarning.classList.toggle('hidden', getChecked('letterConsentConfirmed') || !hasRecipient);
  }

  const hasUrl = Boolean(LETTER_GPT_URL);
  [els.copyOpenBtn, els.openBtn, els.openRailBtn].forEach((btn) => {
    if (btn) btn.disabled = !hasUrl;
  });
}

function buildDraftPayload() {
  const fields = {};
  fieldIds.forEach((id) => {
    fields[id] = getValue(id);
  });
  const checkboxes = {};
  checkboxIds.forEach((id) => {
    checkboxes[id] = getChecked(id);
  });

  return {
    savedAt: new Date().toISOString(),
    selectedClinicianId: state.selectedClinicianId,
    selectedState: state.selectedState,
    fields,
    checkboxes,
    output: els.letterExportBox ? els.letterExportBox.value : '',
  };
}

function saveDraft() {
  localStorage.setItem(LETTER_STORAGE_KEY, JSON.stringify(buildDraftPayload()));
}

function getStoredDraft() {
  try {
    const raw = localStorage.getItem(LETTER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Unable to read letter draft:', error);
    return null;
  }
}

function applyDraft(draft) {
  applyDisclosureDefaults();
  setDefaultDate();
  if (!draft || typeof draft !== 'object') {
    syncControls();
    return;
  }

  if (draft.selectedClinicianId) state.selectedClinicianId = String(draft.selectedClinicianId);
  if (STATE_CODES.includes(draft.selectedState)) state.selectedState = draft.selectedState;
  if (draft.fields && typeof draft.fields === 'object') {
    Object.entries(draft.fields).forEach(([id, value]) => setValue(id, value));
    if (draft.fields.clinicianSelect) state.selectedClinicianId = String(draft.fields.clinicianSelect);
  }
  if (draft.checkboxes && typeof draft.checkboxes === 'object') {
    Object.entries(draft.checkboxes).forEach(([id, value]) => setChecked(id, value));
  }
  if (els.letterExportBox) els.letterExportBox.value = draft.output || '';

  setDefaultDate();
  renderClinicianOptions();
  syncControls();
}

function fieldChangeHandler(event) {
  if (els.clinicianSelect) {
    state.selectedClinicianId = els.clinicianSelect.value || state.selectedClinicianId;
  }
  if (event && event.target && event.target.id === 'letterType') {
    setChecked('letterIncludeFunctionalLimitations', FUNCTIONAL_LIMITATION_TYPES.has(getValue('letterType')));
  }
  syncControls();
  saveDraft();
}

function buildLetterPacketText() {
  const clinician = getSelectedClinician();
  const stateDetails = getSelectedStateDetails();
  const letterType = getValue('letterType') || 'workSchoolNote';
  const recipient = [
    `Organization/recipient: ${display(getValue('letterRecipient'))}`,
    `Address/fax: ${display(getValue('letterRecipientAddress'), '[Optional, not provided]')}`,
  ].join('\n');
  const hasRecipient = Boolean(getValue('letterRecipient') || getValue('letterRecipientAddress'));
  const consentConfirmed = getChecked('letterConsentConfirmed');
  const consentWarning = hasRecipient && !consentConfirmed
    ? 'WARNING:\nPatient consent/release has not been confirmed. Do not finalize or send this third-party letter until consent is confirmed.\n'
    : '';

  return [
    'ASTRA PATIENT LETTER REQUEST',
    consentWarning.trim(),
    '',
    'LETTER TYPE:',
    LETTER_TYPE_LABELS[letterType] || LETTER_TYPE_LABELS.workSchoolNote,
    '',
    'LETTER DATE:',
    display(getValue('letterDate')),
    '',
    'RECIPIENT:',
    recipient,
    '',
    'PURPOSE / KEY REQUEST DETAILS:',
    display(getValue('letterPurpose')),
    '',
    'CLINICIAN / STATE METADATA:',
    `Clinician: ${display(clinician.displayName)}`,
    `Credentials: ${display(clinician.credentials)}`,
    `Title: ${display(clinician.title)}`,
    `Selected state: ${state.selectedState}`,
    `License number: ${display(stateDetails.license)}`,
    `Practice/address: ${display(stateDetails.address)}`,
    `Signature block: ${display(stateDetails.signatureBlock)}`,
    `Signature asset label/path: ${display(stateDetails.signatureAsset, '[Not provided]')}`,
    '',
    'DISCLOSURE CONTROLS:',
    `Patient consent/release confirmed: ${yesNo(consentConfirmed)}`,
    `Prior note uploaded separately: ${yesNo(getChecked('letterPreviousNoteUploaded'))}`,
    `Include diagnosis: ${yesNo(getChecked('letterIncludeDiagnosis'))}`,
    `Include medications: ${yesNo(getChecked('letterIncludeMedications'))}`,
    `Include detailed symptoms: ${yesNo(getChecked('letterIncludeSymptoms'))}`,
    `Include functional limitations: ${yesNo(getChecked('letterIncludeFunctionalLimitations'))}`,
    '',
    'FILES / IMAGES TO UPLOAD WITH THIS REQUEST:',
    display(getValue('letterAttachmentManifest'), '[No files/images listed]'),
    '',
    'The clinician will upload the listed files/images to the Letter GPT with this packet. Review uploaded files only for the stated purpose. Do not include image/file contents unless clinically relevant and allowed by disclosure settings.',
    '',
    'CLINICIAN INSTRUCTIONS TO LETTER GPT:',
    'Write a polished, clinically appropriate Astra Psychiatry letter.',
    'Use Astra branding and professional formatting.',
    'Use the uploaded prior note for patient demographics, background, and clinically relevant context.',
    'Use the selected clinician, state, license, address, and signature metadata above.',
    'Incorporate the proper clinician signature or uploaded signature asset when available.',
    'Do not disclose diagnosis, medications, detailed symptoms, functional limitations, or other sensitive clinical details unless explicitly allowed above.',
    'If patient consent/release is not confirmed, clearly warn that the letter should not be finalized or sent until consent is confirmed.',
    'Use placeholders for missing required information rather than inventing facts.',
    'Do not overstate certainty.',
    'Avoid legal conclusions.',
    'Do not claim disability, impairment, need, or accommodation beyond what is clinically supported by the provided information.',
    'If uploaded files/images are referenced, review them only for the stated purpose.',
    'Produce a final letter ready for clinician review, editing, and signature.',
  ].filter((line, index, arr) => !(line === '' && arr[index - 1] === '')).join('\n');
}

function buildLetterPacket() {
  const packet = buildLetterPacketText();
  if (els.letterExportBox) els.letterExportBox.value = packet;
  saveDraft();
  return packet;
}

async function copyLetterPacket() {
  const packet = buildLetterPacket();
  try {
    await navigator.clipboard.writeText(packet);
    if (els.copyBtn) {
      const original = els.copyBtn.textContent;
      els.copyBtn.textContent = 'Copied';
      window.setTimeout(() => {
        els.copyBtn.textContent = original;
      }, 1100);
    }
    return true;
  } catch (error) {
    console.error(error);
    window.alert('Copy failed. Please copy manually from the preview.');
    return false;
  }
}

function openLetterGpt() {
  if (!LETTER_GPT_URL) {
    window.alert('No Letter GPT link is configured.');
    return;
  }
  window.location.assign(LETTER_GPT_URL);
}

function clearLetterFields() {
  fieldIds.forEach((id) => {
    if (id !== 'letterType' && id !== 'clinicianSelect') setValue(id, '');
  });
  setValue('letterType', 'workSchoolNote');
  state.selectedState = 'NY';
  state.selectedClinicianId = state.clinicianConfig.clinicians[0]?.id || 'nick-stanzione';
  if (els.letterExportBox) els.letterExportBox.value = '';
  applyDisclosureDefaults();
  setDefaultDate();
  renderClinicianOptions();
  localStorage.removeItem(LETTER_STORAGE_KEY);
  saveDraft();
  syncControls();
}

function attachEventListeners() {
  fieldIds.forEach((id) => {
    const el = getEl(id);
    if (!el) return;
    el.addEventListener('input', fieldChangeHandler);
    el.addEventListener('change', fieldChangeHandler);
    el.addEventListener('blur', saveDraft);
  });

  checkboxIds.forEach((id) => {
    const el = getEl(id);
    if (!el) return;
    el.addEventListener('change', fieldChangeHandler);
  });

  document.querySelectorAll('[data-clinician-state]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedState = STATE_CODES.includes(btn.dataset.clinicianState) ? btn.dataset.clinicianState : 'NY';
      syncControls();
      saveDraft();
    });
  });

  if (els.buildBtn) els.buildBtn.addEventListener('click', buildLetterPacket);
  if (els.copyBtn) els.copyBtn.addEventListener('click', copyLetterPacket);
  if (els.copyOpenBtn) {
    els.copyOpenBtn.addEventListener('click', async () => {
      const copied = await copyLetterPacket();
      if (copied) openLetterGpt();
    });
  }
  [els.openBtn, els.openRailBtn].forEach((btn) => {
    if (btn) btn.addEventListener('click', openLetterGpt);
  });
  if (els.clearBtn) {
    els.clearBtn.addEventListener('click', () => {
      if (window.confirm('Clear letter fields only?')) clearLetterFields();
    });
  }
}

async function init() {
  attachEventListeners();
  applyDraft(getStoredDraft());
  await loadClinicianConfig();
  applyDraft(getStoredDraft());
  syncControls();
}

init();
