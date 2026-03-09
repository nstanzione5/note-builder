const state = {
  practice: 'astra',
  visitType: 'followup',
  currentModality: '',
  followModality: '',
  scriptVisible: false,
  followupMode: 'scheduled',
  selectedInterval: '',
  therapyInterwovenTier: '0',
  topbarCondensed: false,
  medDrawerOpen: false,
  medDrawerPinned: false,
  medClassFilter: 'all',
  selectedMedicationId: '',
  selectedFormulationId: '',
  selectedRoute: '',
};

const els = {
  body: document.body,
  topbar: document.getElementById('topbar'),
  astraBtn: document.getElementById('astraBtn'),
  ebhBtn: document.getElementById('ebhBtn'),
  followBtn: document.getElementById('followBtn'),
  intakeBtn: document.getElementById('intakeBtn'),
  scriptToggle: document.getElementById('scriptToggle'),
  scriptToggleCard: document.getElementById('scriptToggleCard'),
  scriptPanel: document.getElementById('scriptPanel'),
  workspaceGrid: document.getElementById('workspaceGrid'),
  workflowChip: document.getElementById('workflowChip'),
  workflowRibbonCopy: document.getElementById('workflowRibbonCopy'),
  brandKicker: document.getElementById('brandKicker'),
  brandTitle: document.getElementById('brandTitle'),
  brandSubtitle: document.getElementById('brandSubtitle'),
  brandModePill: document.getElementById('brandModePill'),
  astraLogo: document.getElementById('astraLogo'),
  ebhLogo: document.getElementById('ebhLogo'),
  brandLogoFallback: document.getElementById('brandLogoFallback'),
  previousPlanCard: document.getElementById('previousPlanCard'),
  previousPlanCompletionStatus: document.getElementById('previousPlanCompletionStatus'),
  astraScreeners: document.getElementById('astraScreeners'),
  astraScreenersCompletionStatus: document.getElementById('astraScreenersCompletionStatus'),
  astraScreenersFields: document.getElementById('astraScreenersFields'),
  ebhTests: document.getElementById('ebhTests'),
  ebhTestsCompletionStatus: document.getElementById('ebhTestsCompletionStatus'),
  currentModality: document.getElementById('currentModality'),
  followModality: document.getElementById('followModality'),
  therapyInterwoven: document.getElementById('therapyInterwoven'),
  exportBox: document.getElementById('exportBox'),
  copyBtn: document.getElementById('copyBtn'),
  copyOpenBtn: document.getElementById('copyOpenBtn'),
  openGptBtn: document.getElementById('openGptBtn'),
  clearBtn: document.getElementById('clearBtn'),
  exportHelper: document.getElementById('exportHelper'),
  activeGptUrl: document.getElementById('activeGptUrl'),
  followDate: document.getElementById('followDate'),
  prnHelperText: document.getElementById('prnHelperText'),
  age: document.getElementById('age'),
  practiceModeBanner: document.getElementById('practiceModeBanner'),
  practiceModeKicker: document.getElementById('practiceModeKicker'),
  practiceModeText: document.getElementById('practiceModeText'),
  practiceContextPanel: document.getElementById('practiceContextPanel'),
  practiceContextLabelPrimary: document.getElementById('practiceContextLabelPrimary'),
  practiceContextTextPrimary: document.getElementById('practiceContextTextPrimary'),
  practiceContextLabelSecondary: document.getElementById('practiceContextLabelSecondary'),
  practiceContextTextSecondary: document.getElementById('practiceContextTextSecondary'),
  setupCompletionStatus: document.getElementById('setupCompletionStatus'),
  notesCompletionStatus: document.getElementById('notesCompletionStatus'),
  closingCompletionStatus: document.getElementById('closingCompletionStatus'),
  setupSection: document.querySelector('[data-section="setup"]'),
  notesSection: document.querySelector('[data-section="notes"]'),
  closingSection: document.querySelector('[data-section="closing"]'),
  setupSectionCopy: document.getElementById('setupSectionCopy'),
  previousPlanSectionCopy: document.getElementById('previousPlanSectionCopy'),
  notesSectionCopy: document.getElementById('notesSectionCopy'),
  scriptSectionCopy: document.getElementById('scriptSectionCopy'),
  closingSectionCopy: document.getElementById('closingSectionCopy'),
  exportSectionCopy: document.getElementById('exportSectionCopy'),
  setupMiniBadge: document.getElementById('setupMiniBadge'),
  previousPlanMiniBadge: document.getElementById('previousPlanMiniBadge'),
  notesMiniBadge: document.getElementById('notesMiniBadge'),
  scriptMiniBadge: document.getElementById('scriptMiniBadge'),
  closingMiniBadge: document.getElementById('closingMiniBadge'),
  exportMiniBadge: document.getElementById('exportMiniBadge'),
  backupList: document.getElementById('backupList'),
  backupEmpty: document.getElementById('backupEmpty'),
  medDrawerBtn: document.getElementById('medDrawerBtn'),
  medDrawer: document.getElementById('medDrawer'),
  medDrawerBackdrop: document.getElementById('medDrawerBackdrop'),
  medPinBtn: document.getElementById('medPinBtn'),
  medCloseBtn: document.getElementById('medCloseBtn'),
  medSearchInput: document.getElementById('medSearchInput'),
  medClassFilters: document.getElementById('medClassFilters'),
  medFavoritesRow: document.getElementById('medFavoritesRow'),
  medRecentsRow: document.getElementById('medRecentsRow'),
  medResultList: document.getElementById('medResultList'),
  medEmptyState: document.getElementById('medEmptyState'),
  medRequestBtn: document.getElementById('medRequestBtn'),
  medDetailEmpty: document.getElementById('medDetailEmpty'),
  medDetailContent: document.getElementById('medDetailContent'),
  medExportMissingBtn: document.getElementById('medExportMissingBtn'),
  medMissingCount: document.getElementById('medMissingCount'),
};

const inputIds = [
  'age',
  'gender',
  'scheduledStart',
  'currentModality',
  'startTime',
  'cc',
  'previousPlan',
  'phq9',
  'gad7',
  'asrsA',
  'asrsB',
  'pcl5',
  'mdq',
  'otherScreener',
  'testDump',
  'notes',
  'followModality',
  'followDate',
  'followTime',
  'therapyInterwoven',
  'endTime',
  'docEnd',
];

const SCREENER_IDS = ['phq9', 'gad7', 'asrsA', 'asrsB', 'pcl5', 'mdq', 'otherScreener'];
const TIME_FIELD_IDS = ['scheduledStart', 'startTime', 'followTime', 'endTime', 'docEnd'];

const brandConfig = {
  astra: {
    kicker: 'Astra Psychiatry',
    subtitle: 'Structured, readable capture for Astra psychiatric note workflows.',
    fallback: 'A',
  },
  ebh: {
    kicker: 'Evolve Brain Health',
    subtitle: 'Structured, readable capture for EBH intake and follow-up documentation.',
    fallback: 'E',
  },
};

const STORAGE_KEY = 'noteBuilderDraft_v1';
const SNAPSHOT_KEY = 'noteBuilderSnapshots_v1';
const MAX_SNAPSHOTS = 3;
const CONDENSE_ENTER_Y = 130;
const CONDENSE_EXIT_Y = 72;

const MED_CATALOG_URL = './data/meds/compiled/medications.compiled.json';
const MED_FAVORITES_KEY = 'medDrawerFavorites_v1';
const MED_RECENTS_KEY = 'medDrawerRecents_v1';
const MED_MISSING_REQUESTS_KEY = 'medDrawerMissingRequests_v1';
const MED_RUNTIME_OVERRIDES_KEY = 'medDrawerRuntimeOverrides_v1';
const MED_AUTOSYNC_META_KEY = 'medDrawerAutoSyncMeta_v1';

let snapshotTimer = null;
const timeControlMap = new Map();
let medicationCatalog = [];
let medicationCatalogGeneratedAt = '';
let medicationSearchResults = [];
let medicationFocusedResultIndex = -1;
let medAutoSyncTimer = null;
let medAutoSyncRunning = false;

function getEl(id) {
  return document.getElementById(id);
}

function getValue(id) {
  const el = getEl(id);
  return el ? String(el.value || '').trim() : '';
}

function setValue(id, value) {
  if (TIME_FIELD_IDS.includes(id)) {
    setTimeControlValue(id, value || '');
    return;
  }

  const el = getEl(id);
  if (el) el.value = value;
}

function isFilled(id) {
  return getValue(id) !== '';
}

function isVisible(element) {
  return Boolean(element) && !element.classList.contains('hidden');
}

function safeShowLogo(imgEl, shouldShow) {
  if (!imgEl) return;
  imgEl.classList.toggle('hidden', !shouldShow);
}

function setActiveByData(selector, key, value) {
  document.querySelectorAll(selector).forEach((btn) => {
    const isActive = btn.dataset[key] === value;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

function setActiveButtons(containerSelector, clickedButton) {
  document.querySelectorAll(`${containerSelector} .seg-btn`).forEach((btn) => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });

  clickedButton.classList.add('active');
  clickedButton.setAttribute('aria-pressed', 'true');
}

function setSectionCompletion(statusEl, sectionEl, isComplete) {
  if (statusEl) {
    statusEl.textContent = isComplete ? 'Complete' : 'Pending';
    statusEl.classList.toggle('completion-status-complete', isComplete);
    statusEl.classList.toggle('completion-status-pending', !isComplete);
  }

  if (sectionEl) {
    sectionEl.classList.toggle('is-complete', isComplete);
  }
}

function format12Hour(hours24, minutes) {
  const meridiem = hours24 >= 12 ? 'PM' : 'AM';
  const normalizedHour = hours24 % 12 || 12;
  return `${normalizedHour}:${String(minutes).padStart(2, '0')} ${meridiem}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getStorageJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch (error) {
    return fallback;
  }
}

function setStorageJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function updateBranding() {
  const brand = brandConfig[state.practice];
  const isAstra = state.practice === 'astra';
  const isIntake = state.visitType === 'intake';

  els.body.dataset.practice = state.practice;
  els.body.dataset.visitType = state.visitType;

  if (els.brandKicker) els.brandKicker.textContent = brand.kicker;
  if (els.brandTitle) els.brandTitle.textContent = 'Clinical Note Builder';

  if (els.brandSubtitle) {
    els.brandSubtitle.textContent = isAstra
      ? 'Readable intake/follow-up capture with a consistent Astra export format.'
      : isIntake
        ? 'Readable intake capture for EBH with imported pre-visit screening support.'
        : 'Readable EBH follow-up capture with prior-plan context first.';
  }

  if (els.brandLogoFallback) {
    els.brandLogoFallback.textContent = brand.fallback;
  }

  safeShowLogo(els.astraLogo, isAstra);
  safeShowLogo(els.ebhLogo, !isAstra);

  if (els.workflowChip) {
    els.workflowChip.textContent = `${isAstra ? 'Astra' : 'EBH'} ${isIntake ? 'Intake' : 'Follow-Up'}`;
  }

  if (els.brandModePill) {
    els.brandModePill.textContent = isAstra
      ? 'Astra Workflow'
      : isIntake
        ? 'EBH Intake'
        : 'EBH Follow-Up';
  }

  if (els.workflowRibbonCopy) {
    els.workflowRibbonCopy.textContent = isAstra
      ? 'A high-clarity workflow designed for fast Astra handoff and reliable section completion.'
      : isIntake
        ? 'A pre-visit-first intake workflow designed for imported EBH screening data.'
        : 'A pre-visit-first follow-up workflow designed for prior-plan continuity.';
  }

  if (els.practiceModeBanner && els.practiceModeKicker && els.practiceModeText) {
    els.practiceModeBanner.classList.remove('hidden');
    els.practiceModeKicker.textContent = isAstra ? 'Astra Mode' : 'EBH Mode';
    els.practiceModeText.textContent = isAstra
      ? 'Astra mode active: one GPT route for intake and follow-up with section-level completion.'
      : isIntake
        ? 'EBH intake mode active: paste imported screening output first, then document intake.'
        : 'EBH follow-up mode active: prior plan first, then follow-up note capture and handoff.';
  }

  if (els.practiceContextPanel) {
    els.practiceContextPanel.classList.remove('hidden');
  }

  if (els.practiceContextLabelPrimary && els.practiceContextTextPrimary) {
    els.practiceContextLabelPrimary.textContent = isAstra ? 'Astra note flow' : 'EBH note flow';
    els.practiceContextTextPrimary.textContent = isAstra
      ? 'Astra routes both intake and follow-up exports into one GPT destination.'
      : isIntake
        ? 'EBH intake uses imported pre-visit data before chief complaint and live notes.'
        : 'EBH follow-up uses prior-plan context before visit setup and note capture.';
  }

  if (els.practiceContextLabelSecondary && els.practiceContextTextSecondary) {
    els.practiceContextLabelSecondary.textContent = 'Workflow emphasis';
    els.practiceContextTextSecondary.textContent = isAstra
      ? 'Pre-visit context first, then setup, notes, and closing with follow-up scheduling before close times.'
      : 'Pre-visit context first, then setup, notes, and closing with schedule-first sequencing.';
  }

  if (els.setupSectionCopy) {
    els.setupSectionCopy.textContent = isAstra
      ? 'Capture setup after pre-visit context so chief complaint and timing align with live encounter flow.'
      : 'Capture setup after pre-visit context so imported data and chief complaint stay in sequence.';
  }

  if (els.previousPlanSectionCopy) {
    els.previousPlanSectionCopy.textContent = isAstra
      ? 'Paste prior treatment context before starting setup and chief complaint.'
      : 'Paste prior EBH treatment context before setup and chief complaint.';
  }

  if (els.notesSectionCopy) {
    els.notesSectionCopy.textContent = isAstra
      ? 'Write freeform notes as the encounter unfolds; export formatting is handled automatically.'
      : 'Write freeform notes as the encounter unfolds; export formatting is handled automatically.';
  }

  if (els.scriptSectionCopy) {
    els.scriptSectionCopy.textContent = 'Verbatim intake interview prompts are available during intake workflows.';
  }

  if (els.closingSectionCopy) {
    els.closingSectionCopy.textContent = 'Schedule follow-up first, then capture therapy interwoven tier and closing times.';
  }

  if (els.exportSectionCopy) {
    els.exportSectionCopy.textContent = isAstra
      ? 'Preview the structured Astra raw input live, then copy or open your target GPT.'
      : isIntake
        ? 'Preview the structured EBH intake raw input live, then copy or open EBH Intake GPT.'
        : 'Preview the structured EBH follow-up raw input live, then copy or open EBH Follow-Up GPT.';
  }

  if (els.setupMiniBadge) els.setupMiniBadge.textContent = 'Visit setup';
  if (els.previousPlanMiniBadge) els.previousPlanMiniBadge.textContent = 'Pre-visit context';
  if (els.notesMiniBadge) els.notesMiniBadge.textContent = isIntake ? 'Intake narrative' : 'Live note capture';
  if (els.scriptMiniBadge) els.scriptMiniBadge.textContent = 'Verbatim script';
  if (els.closingMiniBadge) els.closingMiniBadge.textContent = 'Follow-up + close';
  if (els.exportMiniBadge) {
    els.exportMiniBadge.textContent = isAstra ? 'Final handoff' : isIntake ? 'EBH intake handoff' : 'EBH follow-up handoff';
  }
}

function updateScriptVisibility() {
  const isIntake = state.visitType === 'intake';

  if (els.scriptToggleCard) {
    els.scriptToggleCard.classList.toggle('hidden', !isIntake);
  }

  if (!isIntake) {
    state.scriptVisible = false;
    if (els.scriptToggle) els.scriptToggle.checked = false;
  }

  if (els.scriptPanel) {
    els.scriptPanel.classList.toggle('hidden', !(isIntake && state.scriptVisible));
  }

  if (els.workspaceGrid && els.scriptPanel) {
    els.workspaceGrid.classList.toggle('workspace-grid-single', els.scriptPanel.classList.contains('hidden'));
  }
}

function updatePracticeSections() {
  const isAstra = state.practice === 'astra';
  const isIntake = state.visitType === 'intake';

  if (els.previousPlanCard) {
    els.previousPlanCard.classList.toggle('hidden', isIntake);
  }

  if (els.astraScreeners) {
    els.astraScreeners.classList.toggle('hidden', !(isAstra && isIntake));
  }

  if (els.ebhTests) {
    els.ebhTests.classList.toggle('hidden', !(!isAstra && isIntake));
  }
}

function updateTopbarState(forceRecalc = false) {
  if (!els.topbar) return;

  const y = window.scrollY;

  if (forceRecalc) {
    state.topbarCondensed = y >= CONDENSE_ENTER_Y;
  } else if (!state.topbarCondensed && y >= CONDENSE_ENTER_Y) {
    state.topbarCondensed = true;
  } else if (state.topbarCondensed && y <= CONDENSE_EXIT_Y) {
    state.topbarCondensed = false;
  }

  els.topbar.classList.toggle('topbar-condensed', state.topbarCondensed);
}

function updateActiveGptUrl() {
  let url = '';

  if (state.practice === 'astra') {
    url = els.body.dataset.astraGptUrl || '';
  } else if (state.visitType === 'intake') {
    url = els.body.dataset.ebhIntakeGptUrl || '';
  } else {
    url = els.body.dataset.ebhFollowupGptUrl || '';
  }

  if (els.activeGptUrl) {
    els.activeGptUrl.value = url;
  }

  if (els.exportHelper) {
    els.exportHelper.textContent = state.practice === 'astra'
      ? 'Astra mode routes to your Astra GPT for both intake and follow-up.'
      : state.visitType === 'intake'
        ? 'EBH intake mode routes to your EBH Intake GPT.'
        : 'EBH follow-up mode routes to your EBH Follow-Up GPT.';
  }
}

function parseTimeInputValue(rawValue, meridiemHint = 'AM') {
  const raw = String(rawValue || '').trim();
  if (!raw) return null;

  const normalized = raw.toLowerCase().replace(/\s+/g, '');
  let hour;
  let minute = '00';
  let suffix = '';

  const compactMatch = normalized.match(/^(\d{3,4})(a|am|p|pm)?$/);
  if (compactMatch) {
    const digits = compactMatch[1];
    hour = Number(digits.slice(0, digits.length - 2));
    minute = digits.slice(-2);
    suffix = compactMatch[2] || '';
  } else {
    const generalMatch = normalized.match(/^(\d{1,2})(?::?(\d{1,2}))?(a|am|p|pm)?$/);
    if (!generalMatch) return null;

    hour = Number(generalMatch[1]);
    minute = generalMatch[2] ? generalMatch[2].padStart(2, '0') : '00';
    suffix = generalMatch[3] || '';
  }

  if (Number.isNaN(hour)) return null;

  const minuteNumber = Number(minute);
  if (Number.isNaN(minuteNumber) || minuteNumber > 59) return null;

  let meridiem = meridiemHint === 'PM' ? 'PM' : 'AM';

  if (suffix) {
    meridiem = suffix.startsWith('p') ? 'PM' : 'AM';
    if (hour < 1 || hour > 12) return null;
  } else {
    if (hour > 23) return null;
    if (hour === 0) {
      hour = 12;
      meridiem = 'AM';
    } else if (hour === 12) {
      meridiem = 'PM';
    } else if (hour > 12) {
      hour -= 12;
      meridiem = 'PM';
    }
  }

  return {
    hour: String(hour),
    minute: String(minuteNumber).padStart(2, '0'),
    meridiem,
    canonical: `${hour}:${String(minuteNumber).padStart(2, '0')} ${meridiem}`,
  };
}

function getTimeControl(id) {
  return timeControlMap.get(id) || null;
}

function setMeridiemButtons(control, meridiem) {
  if (!control) return;
  control.meridiemButtons.forEach((btn) => {
    const isActive = btn.dataset.meridiem === meridiem;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

function markTimeControlValidity(control, isValid) {
  if (!control || !control.root) return;
  control.root.classList.toggle('time-control-invalid', !isValid);
}

function setTimeControlValue(id, canonicalValue) {
  const control = getTimeControl(id);
  if (!control) return;

  const parsed = parseTimeInputValue(canonicalValue, control.activeMeridiem || 'AM');

  if (!parsed) {
    control.hourInput.value = '';
    control.minuteInput.value = '';
    control.activeMeridiem = 'AM';
    setMeridiemButtons(control, 'AM');
    control.hidden.value = '';
    markTimeControlValidity(control, true);
    return;
  }

  control.hourInput.value = parsed.hour;
  control.minuteInput.value = parsed.minute;
  control.activeMeridiem = parsed.meridiem;
  setMeridiemButtons(control, parsed.meridiem);
  control.hidden.value = parsed.canonical;
  markTimeControlValidity(control, true);
}

function collectTimeControlParts(control) {
  return {
    hour: control.hourInput.value.replace(/\D/g, ''),
    minute: control.minuteInput.value.replace(/\D/g, ''),
    meridiem: control.activeMeridiem || 'AM',
  };
}

function commitTimeControlValue(id, options = {}) {
  const control = getTimeControl(id);
  if (!control) return;

  const { validateStrict = false, notify = false } = options;
  const { hour, minute, meridiem } = collectTimeControlParts(control);

  control.hourInput.value = hour;
  control.minuteInput.value = minute;

  if (!hour && !minute) {
    control.hidden.value = '';
    markTimeControlValidity(control, true);
    if (notify) handleFieldMutation(id);
    return;
  }

  if (!hour || !minute) {
    control.hidden.value = '';
    markTimeControlValidity(control, !validateStrict);
    if (notify) handleFieldMutation(id);
    return;
  }

  const hourNumber = Number(hour);
  const minuteNumber = Number(minute);

  const isValid = Number.isInteger(hourNumber)
    && Number.isInteger(minuteNumber)
    && hourNumber >= 1
    && hourNumber <= 12
    && minuteNumber >= 0
    && minuteNumber <= 59;

  if (!isValid) {
    control.hidden.value = '';
    markTimeControlValidity(control, false);
    if (notify) handleFieldMutation(id);
    return;
  }

  const canonical = `${hourNumber}:${String(minuteNumber).padStart(2, '0')} ${meridiem}`;
  control.hidden.value = canonical;
  markTimeControlValidity(control, true);

  if (notify) handleFieldMutation(id);
}

function applyParsedTimeToControl(id, parsed, notify = true) {
  const control = getTimeControl(id);
  if (!control || !parsed) return;

  control.hourInput.value = parsed.hour;
  control.minuteInput.value = parsed.minute;
  control.activeMeridiem = parsed.meridiem;
  setMeridiemButtons(control, parsed.meridiem);
  control.hidden.value = parsed.canonical;
  markTimeControlValidity(control, true);

  if (notify) handleFieldMutation(id);
}

function maybeParseFullTimeEntry(id, rawValue) {
  const control = getTimeControl(id);
  if (!control) return false;

  const raw = String(rawValue || '').trim();
  if (!raw) return false;

  const looksComplete = /[apm:]/i.test(raw) || raw.replace(/\D/g, '').length >= 3;
  if (!looksComplete) return false;

  const parsed = parseTimeInputValue(raw, control.activeMeridiem || 'AM');
  if (!parsed) return false;

  applyParsedTimeToControl(id, parsed, true);
  control.minuteInput.focus();
  control.minuteInput.select();
  return true;
}

function attachTimeControlListeners() {
  TIME_FIELD_IDS.forEach((id) => {
    const root = document.querySelector(`.time-control[data-time-field="${id}"]`);
    const hidden = getEl(id);
    if (!root || !hidden) return;

    const hourInput = root.querySelector('[data-time-part="hour"]');
    const minuteInput = root.querySelector('[data-time-part="minute"]');
    const meridiemButtons = Array.from(root.querySelectorAll('.time-meridiem-btn'));

    if (!hourInput || !minuteInput) return;

    const control = {
      id,
      root,
      hidden,
      hourInput,
      minuteInput,
      meridiemButtons,
      activeMeridiem: 'AM',
    };

    timeControlMap.set(id, control);
    setMeridiemButtons(control, 'AM');

    const handleMeridiemShortcut = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return false;
      const key = event.key.toLowerCase();
      if (key !== 'a' && key !== 'p') return false;

      event.preventDefault();
      control.activeMeridiem = key === 'a' ? 'AM' : 'PM';
      setMeridiemButtons(control, control.activeMeridiem);
      commitTimeControlValue(id, { notify: true });
      return true;
    };

    const handlePartInput = (part, event) => {
      if (handleMeridiemShortcut(event)) return;

      if (maybeParseFullTimeEntry(id, event.target.value)) {
        return;
      }

      const digits = event.target.value.replace(/\D/g, '');
      if (part === 'hour') {
        event.target.value = digits.slice(0, 2);
        if (event.target.value.length === 2) {
          minuteInput.focus();
          minuteInput.select();
        }
      } else {
        event.target.value = digits.slice(0, 2);
      }

      commitTimeControlValue(id, { notify: true });
    };

    const handlePartBlur = (part, event) => {
      if (part === 'minute') {
        const digits = event.target.value.replace(/\D/g, '');
        if (digits.length === 1) {
          event.target.value = digits.padStart(2, '0');
        }
      }

      commitTimeControlValue(id, { validateStrict: true, notify: true });
    };

    hourInput.addEventListener('input', (event) => handlePartInput('hour', event));
    minuteInput.addEventListener('input', (event) => handlePartInput('minute', event));

    hourInput.addEventListener('blur', (event) => handlePartBlur('hour', event));
    minuteInput.addEventListener('blur', (event) => handlePartBlur('minute', event));

    hourInput.addEventListener('keydown', (event) => {
      if (handleMeridiemShortcut(event)) return;
      if (event.key === ':' || event.key === '.') {
        event.preventDefault();
        minuteInput.focus();
      }
    });

    minuteInput.addEventListener('keydown', (event) => {
      handleMeridiemShortcut(event);
    });

    [hourInput, minuteInput].forEach((input) => {
      input.addEventListener('paste', (event) => {
        const pasted = event.clipboardData ? event.clipboardData.getData('text') : '';
        if (!pasted) return;

        if (maybeParseFullTimeEntry(id, pasted)) {
          event.preventDefault();
        }
      });
    });

    meridiemButtons.forEach((btn) => {
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', () => {
        control.activeMeridiem = btn.dataset.meridiem === 'PM' ? 'PM' : 'AM';
        setMeridiemButtons(control, control.activeMeridiem);
        commitTimeControlValue(id, { notify: true });
      });
    });
  });
}

function buildScreenersText() {
  if (state.practice !== 'astra' || state.visitType !== 'intake') return '';

  const lines = [
    ['PHQ-9', getValue('phq9')],
    ['GAD-7', getValue('gad7')],
    ['ASRS Part A', getValue('asrsA')],
    ['ASRS Part B', getValue('asrsB')],
    ['PCL-5', getValue('pcl5')],
    ['MDQ', getValue('mdq')],
    ['Other', getValue('otherScreener')],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `- ${label}: ${value}`);

  return lines.length ? lines.join('\n') : 'No screener data entered.';
}

function buildVisitDetails() {
  const cc = getValue('cc');
  const ccText = cc ? `"${cc}"` : '';

  return [
    `Age: ${getValue('age')}`,
    `Gender: ${getValue('gender')}`,
    `Scheduled Start: ${getValue('scheduledStart')}`,
    `Current Encounter Modality: ${getValue('currentModality')}`,
    `Face-to-Face Start: ${getValue('startTime')}`,
    `Chief Complaint: ${ccText}`,
  ].join('\n');
}

function buildFollowupDetails() {
  const lines = [
    `Follow-Up Modality: ${getValue('followModality')}`,
  ];

  if (state.followupMode === 'prn') {
    lines.push('Follow-Up Scheduling: PRN / no appointment scheduled during this encounter.');
    lines.push('No follow-up appointment was scheduled during this encounter.');
    lines.push('Patient is not ready to schedule a follow-up appointment yet and will reach out later to schedule.');
  } else {
    lines.push(`Follow-Up Date: ${getValue('followDate')}`);
    lines.push(`Follow-Up Time: ${getValue('followTime')}`);
  }

  lines.push(`Therapy Interwoven: ${getValue('therapyInterwoven') || '0'}`);
  lines.push(`Face-to-Face End: ${getValue('endTime')}`);
  lines.push(`Documentation End: ${getValue('docEnd')}`);

  return lines.join('\n');
}

function buildExport() {
  const visitDetails = buildVisitDetails();
  const followupDetails = buildFollowupDetails();
  const previousPlan = getValue('previousPlan');
  const notes = getValue('notes');
  const ebhTests = getValue('testDump');
  const screeners = buildScreenersText();

  if (state.practice === 'astra' && state.visitType === 'followup') {
    return [
      'VISIT DETAILS',
      visitDetails,
      '',
      'PREVIOUS PLAN',
      previousPlan,
      '',
      'FREEFORM APPOINTMENT NOTES',
      notes,
      '',
      'FOLLOW-UP',
      followupDetails,
    ].join('\n');
  }

  if (state.practice === 'astra' && state.visitType === 'intake') {
    return [
      'VISIT DETAILS',
      visitDetails,
      '',
      'SCREENERS',
      screeners,
      '',
      'INTAKE NOTES',
      notes,
      '',
      'FOLLOW-UP',
      followupDetails,
    ].join('\n');
  }

  if (state.practice === 'ebh' && state.visitType === 'followup') {
    return [
      'VISIT DETAILS',
      visitDetails,
      '',
      'PREVIOUS PLAN',
      previousPlan,
      '',
      'FOLLOW-UP VISIT NOTES',
      notes,
      '',
      'NEXT APPOINTMENT',
      followupDetails,
    ].join('\n');
  }

  return [
    'VISIT DETAILS',
    visitDetails,
    '',
    'TESTS / SCREENERS / IMPORTED DATA',
    ebhTests,
    '',
    'INTAKE NOTES',
    notes,
    '',
    'FOLLOW-UP',
    followupDetails,
  ].join('\n');
}

function updateExport() {
  if (!els.exportBox) return;
  els.exportBox.value = buildExport();
}

function evaluateCompletion() {
  let previsitComplete = false;
  if (isVisible(els.previousPlanCard)) {
    previsitComplete = isFilled('previousPlan');
  } else if (isVisible(els.astraScreeners)) {
    previsitComplete = SCREENER_IDS.some((id) => isFilled(id));
  } else if (isVisible(els.ebhTests)) {
    previsitComplete = isFilled('testDump');
  }

  const setupComplete = [
    isFilled('age'),
    isFilled('gender'),
    isFilled('scheduledStart'),
    isFilled('currentModality'),
    isFilled('startTime'),
    isFilled('cc'),
  ].every(Boolean);

  const notesComplete = isFilled('notes');

  const closingComplete = [
    isFilled('followModality'),
    isFilled('therapyInterwoven'),
    isFilled('endTime'),
    isFilled('docEnd'),
    state.followupMode === 'prn' ? true : isFilled('followDate'),
    state.followupMode === 'prn' ? true : isFilled('followTime'),
  ].every(Boolean);

  return {
    previsitComplete,
    setupComplete,
    notesComplete,
    closingComplete,
  };
}

function updateCompletionIndicators() {
  const { previsitComplete, setupComplete, notesComplete, closingComplete } = evaluateCompletion();

  setSectionCompletion(els.setupCompletionStatus, els.setupSection, setupComplete);
  setSectionCompletion(els.notesCompletionStatus, els.notesSection, notesComplete);
  setSectionCompletion(els.closingCompletionStatus, els.closingSection, closingComplete);

  if (isVisible(els.previousPlanCard)) {
    setSectionCompletion(els.previousPlanCompletionStatus, els.previousPlanCard, previsitComplete);
  } else {
    setSectionCompletion(els.previousPlanCompletionStatus, els.previousPlanCard, false);
  }

  if (isVisible(els.astraScreeners)) {
    setSectionCompletion(els.astraScreenersCompletionStatus, els.astraScreeners, previsitComplete);
  } else {
    setSectionCompletion(els.astraScreenersCompletionStatus, els.astraScreeners, false);
  }

  if (isVisible(els.ebhTests)) {
    setSectionCompletion(els.ebhTestsCompletionStatus, els.ebhTests, previsitComplete);
  } else {
    setSectionCompletion(els.ebhTestsCompletionStatus, els.ebhTests, false);
  }
}

function updateIntervalButtons() {
  document.querySelectorAll('.interval-btn').forEach((btn) => {
    const isPrnButton = btn.dataset.followupMode === 'prn';
    const isActive = isPrnButton
      ? state.followupMode === 'prn'
      : state.followupMode === 'scheduled' && btn.dataset.weeks === state.selectedInterval;

    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

function updateTherapyButtons() {
  document.querySelectorAll('#therapyInterwovenToggle .seg-btn').forEach((btn) => {
    const isActive = btn.dataset.therapyTier === state.therapyInterwovenTier;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  if (els.therapyInterwoven) {
    els.therapyInterwoven.value = state.therapyInterwovenTier;
  }
}

function updateFollowupSchedulingUI() {
  const isPrn = state.followupMode === 'prn';

  if (els.followDate) {
    els.followDate.disabled = isPrn;
    if (isPrn) els.followDate.value = '';
  }

  if (isPrn) {
    setValue('followTime', '');
  }

  const followTimeControl = getTimeControl('followTime');
  if (followTimeControl) {
    followTimeControl.hourInput.disabled = isPrn;
    followTimeControl.minuteInput.disabled = isPrn;
    followTimeControl.meridiemButtons.forEach((btn) => {
      btn.disabled = isPrn;
    });
  }

  if (els.prnHelperText) {
    els.prnHelperText.classList.toggle('hidden', !isPrn);
  }

  updateIntervalButtons();
}

function loadSnapshotsFromStorage() {
  const parsed = getStorageJSON(SNAPSHOT_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveSnapshotsToStorage(snapshots) {
  setStorageJSON(SNAPSHOT_KEY, snapshots.slice(0, MAX_SNAPSHOTS));
}

function formatSnapshotLabel(entry) {
  const age = entry && entry.draft && entry.draft.inputs ? String(entry.draft.inputs.age || '').trim() : '';
  const gender = entry && entry.draft && entry.draft.inputs ? String(entry.draft.inputs.gender || '').trim() : '';
  const ageText = age || '?';
  const genderText = gender || '?';
  return `Age ${ageText}, ${genderText}`;
}

function renderBackupHistory() {
  if (!els.backupList || !els.backupEmpty) return;

  const snapshots = loadSnapshotsFromStorage();
  els.backupList.innerHTML = '';

  if (!snapshots.length) {
    els.backupEmpty.classList.remove('hidden');
    return;
  }

  els.backupEmpty.classList.add('hidden');

  snapshots.forEach((entry, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'restore-btn';
    button.dataset.snapshotIndex = String(index);
    button.textContent = formatSnapshotLabel(entry);

    if (entry && entry.savedAt) {
      button.title = `Saved ${new Date(entry.savedAt).toLocaleString()}`;
    }

    els.backupList.appendChild(button);
  });
}

function queueSnapshot(draft) {
  if (snapshotTimer) {
    window.clearTimeout(snapshotTimer);
  }

  snapshotTimer = window.setTimeout(() => {
    const snapshots = loadSnapshotsFromStorage();
    const signature = JSON.stringify({ state: draft.state, inputs: draft.inputs });

    if (snapshots[0] && snapshots[0].signature === signature) {
      return;
    }

    snapshots.unshift({
      id: Date.now(),
      savedAt: new Date().toISOString(),
      practice: draft.state.practice,
      visitType: draft.state.visitType,
      signature,
      draft,
    });

    saveSnapshotsToStorage(snapshots);
    renderBackupHistory();
  }, 350);
}

function saveDraft() {
  const draft = {
    state: {
      practice: state.practice,
      visitType: state.visitType,
      currentModality: state.currentModality,
      followModality: state.followModality,
      scriptVisible: state.scriptVisible,
      followupMode: state.followupMode,
      selectedInterval: state.selectedInterval,
      therapyInterwovenTier: state.therapyInterwovenTier,
    },
    inputs: {},
  };

  inputIds.forEach((id) => {
    draft.inputs[id] = getValue(id);
  });

  setStorageJSON(STORAGE_KEY, draft);
  queueSnapshot(draft);
}

function applyDraft(draft) {
  if (!draft) return;

  if (draft.state) {
    state.practice = draft.state.practice || state.practice;
    state.visitType = draft.state.visitType || state.visitType;
    state.currentModality = draft.state.currentModality || '';
    state.followModality = draft.state.followModality || '';
    state.scriptVisible = Boolean(draft.state.scriptVisible);
    state.followupMode = draft.state.followupMode || 'scheduled';
    state.selectedInterval = draft.state.selectedInterval || '';
    state.therapyInterwovenTier = draft.state.therapyInterwovenTier || '0';
  }

  if (draft.inputs) {
    inputIds.forEach((id) => {
      if (Object.prototype.hasOwnProperty.call(draft.inputs, id)) {
        setValue(id, draft.inputs[id] || '');
      }
    });
  }

  if (!state.therapyInterwovenTier) {
    state.therapyInterwovenTier = getValue('therapyInterwoven') || '0';
  }

  if (!getValue('therapyInterwoven')) {
    setValue('therapyInterwoven', state.therapyInterwovenTier || '0');
  }

  state.currentModality = getValue('currentModality') || state.currentModality;
  state.followModality = getValue('followModality') || state.followModality;
}

function loadInitialData() {
  try {
    const rawDraft = localStorage.getItem(STORAGE_KEY);

    if (rawDraft) {
      applyDraft(JSON.parse(rawDraft));
      return 'draft';
    }

    const snapshots = loadSnapshotsFromStorage();
    if (snapshots.length && snapshots[0].draft) {
      applyDraft(snapshots[0].draft);
      return 'snapshot';
    }
  } catch (error) {
    console.error('Unable to load saved draft:', error);
  }

  return 'none';
}

function restoreSnapshot(index) {
  const snapshots = loadSnapshotsFromStorage();
  const selected = snapshots[index];
  if (!selected || !selected.draft) return;

  applyDraft(selected.draft);
  syncToggleStates();
  refreshUI(false);
  saveDraft();
}

function setCurrentModality(value, button) {
  state.currentModality = value;
  setValue('currentModality', value);
  setActiveButtons('#currentModalityToggle', button);
  handleFieldMutation('currentModality');
}

function setFollowModality(value, button) {
  state.followModality = value;
  setValue('followModality', value);
  setActiveButtons('#followModalityToggle', button);
  handleFieldMutation('followModality');
}

function setTherapyTier(value, button) {
  state.therapyInterwovenTier = value;
  setValue('therapyInterwoven', value);
  setActiveButtons('#therapyInterwovenToggle', button);
  handleFieldMutation('therapyInterwoven');
}

function setTimeNow(targetId) {
  const now = new Date();
  setValue(targetId, format12Hour(now.getHours(), now.getMinutes()));
  handleFieldMutation(targetId);
}

function setFollowupWeeks(weeks) {
  state.followupMode = 'scheduled';
  state.selectedInterval = String(weeks);

  const base = new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() + (Number(weeks) * 7));

  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  const day = String(base.getDate()).padStart(2, '0');
  setValue('followDate', `${year}-${month}-${day}`);

  updateFollowupSchedulingUI();
  updateCompletionIndicators();
  updateExport();
  saveDraft();
}

function setPrnFollowup() {
  if (state.followupMode === 'prn') {
    state.followupMode = 'scheduled';
    state.selectedInterval = '';
  } else {
    state.followupMode = 'prn';
    state.selectedInterval = 'prn';
    setValue('followDate', '');
    setValue('followTime', '');
  }

  updateFollowupSchedulingUI();
  updateCompletionIndicators();
  updateExport();
  saveDraft();
}

function setPractice(practice) {
  state.practice = practice;
  setActiveByData('#practiceToggle .seg-btn', 'practice', practice);
  refreshUI();
}

function setVisitType(visitType) {
  state.visitType = visitType;
  setActiveByData('#visitTypeToggle .seg-btn', 'visitType', visitType);

  if (visitType === 'intake') {
    state.scriptVisible = true;
    if (els.scriptToggle) els.scriptToggle.checked = true;
  } else {
    state.scriptVisible = false;
    if (els.scriptToggle) els.scriptToggle.checked = false;
  }

  refreshUI();
}

function syncToggleStates() {
  setActiveByData('#practiceToggle .seg-btn', 'practice', state.practice);
  setActiveByData('#visitTypeToggle .seg-btn', 'visitType', state.visitType);
  setActiveByData('#currentModalityToggle .seg-btn', 'currentModality', state.currentModality);
  setActiveByData('#followModalityToggle .seg-btn', 'followModality', state.followModality);
  setActiveByData('#therapyInterwovenToggle .seg-btn', 'therapyTier', state.therapyInterwovenTier);

  if (els.scriptToggle) {
    els.scriptToggle.checked = Boolean(state.scriptVisible);
  }
}

function refreshUI(persist = true) {
  updateBranding();
  updatePracticeSections();
  updateScriptVisibility();
  updateActiveGptUrl();
  updateFollowupSchedulingUI();
  updateTherapyButtons();
  updateCompletionIndicators();
  updateExport();
  updateTopbarState(true);
  renderBackupHistory();

  if (persist) {
    saveDraft();
  }
}

function clearAll() {
  inputIds.forEach((id) => setValue(id, ''));

  state.currentModality = '';
  state.followModality = '';
  state.followupMode = 'scheduled';
  state.selectedInterval = '';
  state.therapyInterwovenTier = '0';
  state.scriptVisible = false;

  setValue('therapyInterwoven', '0');

  document.querySelectorAll('#currentModalityToggle .seg-btn, #followModalityToggle .seg-btn, #therapyInterwovenToggle .seg-btn, .interval-btn').forEach((btn) => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });

  if (els.scriptToggle) {
    els.scriptToggle.checked = false;
  }

  localStorage.removeItem(STORAGE_KEY);
  refreshUI(false);

  try {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    // ignore
  }

  window.setTimeout(() => {
    if (els.age) els.age.focus();
  }, 120);
}

function handleFieldMutation(id) {
  if ((id === 'followDate' || id === 'followTime') && state.followupMode === 'prn') {
    return;
  }

  if (id === 'followDate' || id === 'followTime') {
    state.followupMode = 'scheduled';
    if (!state.selectedInterval || state.selectedInterval === 'prn') {
      state.selectedInterval = '';
    }
    updateIntervalButtons();
  }

  if (id === 'therapyInterwoven') {
    state.therapyInterwovenTier = getValue('therapyInterwoven') || '0';
    updateTherapyButtons();
  }

  if (id === 'currentModality') {
    state.currentModality = getValue('currentModality');
  }

  if (id === 'followModality') {
    state.followModality = getValue('followModality');
  }

  updateCompletionIndicators();
  updateExport();
  saveDraft();
}

function attachInputListeners() {
  inputIds.forEach((id) => {
    if (TIME_FIELD_IDS.includes(id)) return;

    const element = getEl(id);
    if (!element) return;

    const syncFieldState = () => handleFieldMutation(id);

    element.addEventListener('input', syncFieldState);
    element.addEventListener('change', syncFieldState);
  });
}

function attachLogoFallbacks() {
  [
    { img: els.astraLogo, fallbackText: 'A' },
    { img: els.ebhLogo, fallbackText: 'E' },
  ].forEach(({ img, fallbackText }) => {
    if (!img) return;

    img.addEventListener('error', () => {
      if (!els.brandLogoFallback) return;
      els.brandLogoFallback.textContent = fallbackText;
      els.brandLogoFallback.classList.remove('hidden');
      img.classList.add('hidden');
    });

    img.addEventListener('load', () => {
      if (!els.brandLogoFallback) return;
      els.brandLogoFallback.classList.add('hidden');
    });
  });
}

function getMedicationById(id) {
  return medicationCatalog.find((med) => med.id === id) || null;
}

function getMedicationFavorites() {
  const favorites = getStorageJSON(MED_FAVORITES_KEY, []);
  return Array.isArray(favorites) ? favorites : [];
}

function saveMedicationFavorites(list) {
  setStorageJSON(MED_FAVORITES_KEY, list);
}

function getMedicationRecents() {
  const recents = getStorageJSON(MED_RECENTS_KEY, []);
  return Array.isArray(recents) ? recents : [];
}

function saveMedicationRecents(list) {
  setStorageJSON(MED_RECENTS_KEY, list);
}

function getMissingMedicationRequests() {
  const requests = getStorageJSON(MED_MISSING_REQUESTS_KEY, []);
  return Array.isArray(requests) ? requests : [];
}

function saveMissingMedicationRequests(list) {
  setStorageJSON(MED_MISSING_REQUESTS_KEY, list);
}

function getRuntimeOverrides() {
  const overrides = getStorageJSON(MED_RUNTIME_OVERRIDES_KEY, {});
  return overrides && typeof overrides === 'object' ? overrides : {};
}

function saveRuntimeOverrides(overrides) {
  setStorageJSON(MED_RUNTIME_OVERRIDES_KEY, overrides);
}

function mergeMedicationWithRuntimeOverrides(medication) {
  const overrides = getRuntimeOverrides();
  const override = overrides[medication.id];
  if (!override) return medication;

  return {
    ...medication,
    ...override,
    source_links: Array.from(new Set([...(medication.source_links || []), ...(override.source_links || [])])),
  };
}

function getMedicationClasses() {
  const classes = Array.from(new Set(
    medicationCatalog
      .map((med) => med.psych_class)
      .filter(Boolean)
  )).sort((a, b) => a.localeCompare(b));

  return ['all', ...classes];
}

function toggleMedicationFavorite(medicationId) {
  const favorites = getMedicationFavorites();
  const next = favorites.includes(medicationId)
    ? favorites.filter((id) => id !== medicationId)
    : [medicationId, ...favorites].slice(0, 24);

  saveMedicationFavorites(next);
  renderMedicationRows();
  renderMedicationResults();
  renderMedicationDetail();
}

function addMedicationRecent(medicationId) {
  const recents = getMedicationRecents();
  const filtered = recents.filter((entry) => entry.id !== medicationId);
  const updated = [{ id: medicationId, viewedAt: new Date().toISOString() }, ...filtered].slice(0, 24);
  saveMedicationRecents(updated);
  renderMedicationRows();
}

function normalizeMedicationQueryToken(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9+\-\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function isSubsequence(query, candidate) {
  let q = 0;
  let c = 0;
  while (q < query.length && c < candidate.length) {
    if (query[q] === candidate[c]) q += 1;
    c += 1;
  }
  return q === query.length;
}

function scoreMedication(query, med) {
  const q = normalizeMedicationQueryToken(query);
  if (!q) return 1;

  const candidates = [
    med.generic_name,
    ...(med.brand_names || []),
    ...(med.aliases || []),
    med.psych_class,
    ...((med.formulations || []).map((form) => form.label || '')),
  ]
    .filter(Boolean)
    .map((value) => normalizeMedicationQueryToken(value));

  let score = 0;

  candidates.forEach((candidate, idx) => {
    if (!candidate) return;

    if (candidate === q) {
      score = Math.max(score, 280 - idx);
      return;
    }

    if (candidate.startsWith(q)) {
      score = Math.max(score, 220 - idx);
      return;
    }

    if (candidate.includes(q)) {
      score = Math.max(score, 170 - idx);
      return;
    }

    if (isSubsequence(q, candidate)) {
      score = Math.max(score, 120 - Math.max(0, candidate.length - q.length));
    }
  });

  return score;
}

function renderMedicationClassFilters() {
  if (!els.medClassFilters) return;

  const classes = getMedicationClasses();
  els.medClassFilters.innerHTML = '';

  classes.forEach((medClass) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'med-filter-btn';
    btn.dataset.medClass = medClass;
    btn.textContent = medClass === 'all' ? 'All classes' : medClass;

    const isActive = state.medClassFilter === medClass;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));

    btn.addEventListener('click', () => {
      state.medClassFilter = medClass;
      renderMedicationClassFilters();
      runMedicationSearch(els.medSearchInput ? els.medSearchInput.value : '');
    });

    els.medClassFilters.appendChild(btn);
  });
}

function renderMedicationRows() {
  const favorites = getMedicationFavorites();
  const recents = getMedicationRecents();

  if (els.medFavoritesRow) {
    if (!favorites.length) {
      els.medFavoritesRow.innerHTML = '';
    } else {
      const chips = favorites
        .map((id) => getMedicationById(id))
        .filter(Boolean)
        .slice(0, 8)
        .map((med) => `<button type="button" class="med-chip" data-med-id="${escapeHtml(med.id)}">★ ${escapeHtml(med.generic_name)}</button>`)
        .join('');
      els.medFavoritesRow.innerHTML = `<span class="helper-text">Favorites:</span>${chips}`;
    }
  }

  if (els.medRecentsRow) {
    if (!recents.length) {
      els.medRecentsRow.innerHTML = '';
    } else {
      const chips = recents
        .map((entry) => getMedicationById(entry.id))
        .filter(Boolean)
        .slice(0, 8)
        .map((med) => `<button type="button" class="med-chip" data-med-id="${escapeHtml(med.id)}">${escapeHtml(med.generic_name)}</button>`)
        .join('');
      els.medRecentsRow.innerHTML = `<span class="helper-text">Recent:</span>${chips}`;
    }
  }
}

function setMedicationSelection(medicationId) {
  const med = getMedicationById(medicationId);
  if (!med) return;

  state.selectedMedicationId = med.id;
  addMedicationRecent(med.id);

  const activeFormulations = (med.formulations || []).filter((form) => form.active !== false);

  if (activeFormulations.length === 1) {
    state.selectedFormulationId = activeFormulations[0].formulation_id;
    state.selectedRoute = activeFormulations[0].route || '';
  } else {
    const selectedForm = activeFormulations.find((form) => form.formulation_id === state.selectedFormulationId);
    if (!selectedForm) {
      state.selectedFormulationId = '';
    }

    if (selectedForm) {
      state.selectedRoute = selectedForm.route || '';
    }
  }

  renderMedicationResults();
  renderMedicationDetail();
}

function runMedicationSearch(rawQuery) {
  const query = normalizeMedicationQueryToken(rawQuery);
  const favorites = new Set(getMedicationFavorites());

  const filteredByClass = medicationCatalog.filter((med) => {
    if (med.active === false) return false;
    if (state.medClassFilter === 'all') return true;
    return med.psych_class === state.medClassFilter;
  });

  if (!query) {
    const sorted = [...filteredByClass].sort((a, b) => {
      const aFav = favorites.has(a.id) ? 1 : 0;
      const bFav = favorites.has(b.id) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      return a.generic_name.localeCompare(b.generic_name);
    });

    medicationSearchResults = sorted.slice(0, 120);
  } else {
    medicationSearchResults = filteredByClass
      .map((med) => ({ med, score: scoreMedication(query, med) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.med.generic_name.localeCompare(b.med.generic_name);
      })
      .slice(0, 150)
      .map((item) => item.med);
  }

  medicationFocusedResultIndex = medicationSearchResults.length ? 0 : -1;
  renderMedicationResults();

  if (query && medicationSearchResults.length) {
    const exact = medicationSearchResults.find((med) => {
      const q = query.toLowerCase();
      const exactCandidates = [
        med.generic_name,
        ...(med.brand_names || []),
        ...(med.aliases || []),
      ].map((token) => normalizeMedicationQueryToken(token));
      return exactCandidates.includes(q);
    });

    if (exact) {
      setMedicationSelection(exact.id);
    }
  }
}

function renderMedicationResults() {
  if (!els.medResultList || !els.medEmptyState) return;

  const favorites = new Set(getMedicationFavorites());
  const activeQuery = els.medSearchInput ? normalizeMedicationQueryToken(els.medSearchInput.value) : '';

  els.medResultList.innerHTML = '';

  if (!medicationSearchResults.length) {
    els.medEmptyState.classList.remove('hidden');
    if (els.medRequestBtn) {
      const label = activeQuery ? `Request "${activeQuery}"` : 'Request this medication';
      els.medRequestBtn.textContent = label;
    }
    return;
  }

  els.medEmptyState.classList.add('hidden');

  medicationSearchResults.forEach((med, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'med-result-item';
    button.dataset.medId = med.id;
    button.dataset.resultIndex = String(index);

    const isSelected = state.selectedMedicationId === med.id;
    if (isSelected) {
      button.classList.add('is-selected');
    }

    const favoriteFlag = favorites.has(med.id) ? '★' : '☆';
    const brandPreview = (med.brand_names || []).slice(0, 2).join(', ');

    button.innerHTML = `
      <div class="med-result-top">
        <div>
          <div class="med-result-name">${escapeHtml(med.generic_name)}</div>
          <div class="med-result-sub">${escapeHtml(brandPreview || 'No brand aliases listed')}</div>
        </div>
        <span aria-hidden="true">${favoriteFlag}</span>
      </div>
      <div class="med-result-sub">${escapeHtml(med.psych_class || 'Unclassified')}</div>
    `;

    button.addEventListener('click', () => {
      setMedicationSelection(med.id);
    });

    els.medResultList.appendChild(button);
  });
}

function listHtml(items, fallback) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!safeItems.length) {
    return `<p class="helper-text">${escapeHtml(fallback)}</p>`;
  }

  return `<ul>${safeItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function getSelectedMedicationContext() {
  const med = getMedicationById(state.selectedMedicationId);
  if (!med) return null;

  const medication = mergeMedicationWithRuntimeOverrides(med);
  const formulations = (medication.formulations || []).filter((form) => form.active !== false);

  let selectedFormulation = formulations.find((form) => form.formulation_id === state.selectedFormulationId) || null;
  if (!selectedFormulation && formulations.length === 1) {
    selectedFormulation = formulations[0];
    state.selectedFormulationId = selectedFormulation.formulation_id;
    state.selectedRoute = selectedFormulation.route || '';
  }

  const availableRoutes = Array.from(new Set(
    formulations
      .map((form) => form.route)
      .filter(Boolean)
  ));

  if (!state.selectedRoute && selectedFormulation && selectedFormulation.route) {
    state.selectedRoute = selectedFormulation.route;
  }

  return {
    medication,
    formulations,
    selectedFormulation,
    availableRoutes,
  };
}

function buildMedicationSummaryText(context) {
  const { medication, selectedFormulation } = context;
  const dosing = selectedFormulation && selectedFormulation.common_adult_psych_dosing
    ? selectedFormulation.common_adult_psych_dosing
    : null;

  const lines = [
    `Medication: ${medication.generic_name}${(medication.brand_names || []).length ? ` (${medication.brand_names.join(', ')})` : ''}`,
    `Class: ${medication.psych_class || 'Unclassified'}`,
    `FDA psych uses: ${(medication.fda_psych_uses || []).join('; ') || 'No curated summary available yet'}`,
    `Common off-label psych uses: ${(medication.off_label_psych_uses || []).join('; ') || 'No curated summary available yet'}`,
  ];

  if (dosing) {
    lines.push(`Dosing start/target/max: ${dosing.start || 'n/a'} / ${dosing.target || 'n/a'} / ${dosing.max || 'n/a'}`);
  } else {
    lines.push('Dosing: Select formulation to view formulation-specific psych dosing.');
  }

  lines.push(`Common side effects: ${(medication.common_side_effects || []).join('; ') || 'No curated summary available yet'}`);
  lines.push(`Psych interaction guide: ${(medication.psych_interactions || []).join('; ') || 'No curated summary available yet'}`);

  return lines.join('\n');
}

async function copyMedicationSummary(context) {
  const text = buildMedicationSummaryText(context);

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Unable to copy medication summary:', error);
    window.alert('Unable to copy medication summary.');
  }
}

function renderMedicationDetail() {
  if (!els.medDetailEmpty || !els.medDetailContent) return;

  const context = getSelectedMedicationContext();

  if (!context) {
    els.medDetailEmpty.classList.remove('hidden');
    els.medDetailContent.classList.add('hidden');
    els.medDetailContent.innerHTML = '';
    return;
  }

  const { medication, formulations, selectedFormulation, availableRoutes } = context;
  const favorites = new Set(getMedicationFavorites());
  const isFavorite = favorites.has(medication.id);

  const hasMultipleFormulations = formulations.length > 1;
  const shouldPromptForFormulation = hasMultipleFormulations && !selectedFormulation;
  const dosing = selectedFormulation ? selectedFormulation.common_adult_psych_dosing || {} : null;

  const formulationButtons = formulations.map((form) => {
    const active = selectedFormulation && selectedFormulation.formulation_id === form.formulation_id;
    return `<button type="button" class="med-control-btn${active ? ' active' : ''}" data-formulation-id="${escapeHtml(form.formulation_id)}">${escapeHtml(form.label || form.dosage_form || 'Formulation')}</button>`;
  }).join('');

  const routeButtons = availableRoutes.map((route) => {
    const active = state.selectedRoute === route;
    return `<button type="button" class="med-control-btn${active ? ' active' : ''}" data-route="${escapeHtml(route)}">${escapeHtml(route)}</button>`;
  }).join('');

  const sourceLinks = Array.from(new Set([
    ...(medication.source_links || []),
    ...((selectedFormulation && selectedFormulation.source_links) || []),
  ]));

  const sideEffects = [
    ...(medication.common_side_effects || []),
    ...((selectedFormulation && selectedFormulation.formulation_specific_side_effect_notes) || []),
  ];

  const interactions = [
    ...(medication.psych_interactions || []),
    ...((selectedFormulation && selectedFormulation.formulation_specific_interactions) || []),
  ];

  const pearls = [
    ...(medication.clinical_pearls || []),
    ...((selectedFormulation && selectedFormulation.formulation_specific_pearls) || []),
  ];

  els.medDetailContent.innerHTML = `
    <article class="med-card-header">
      <div class="med-header-title-row">
        <div>
          <h3 class="med-header-title">${escapeHtml(medication.generic_name)}</h3>
          <p class="med-header-sub">${escapeHtml((medication.brand_names || []).join(', ') || 'No brand aliases listed')}</p>
        </div>
        <div class="med-control-row">
          <button type="button" class="med-control-btn" data-action="copy-summary">Copy summary</button>
          <button type="button" class="med-control-btn${isFavorite ? ' active' : ''}" data-action="toggle-favorite">${isFavorite ? 'Favorited' : 'Favorite'}</button>
        </div>
      </div>
      <div class="med-badge-row">
        <span class="med-badge">${escapeHtml(medication.psych_class || 'Unclassified')}</span>
        ${(medication.formulations || []).slice(0, 8).map((form) => `<span class="med-badge">${escapeHtml(form.label || form.dosage_form || 'Formulation')}</span>`).join('')}
        ${medication.newer_brand ? '<span class="med-badge med-badge-new">Newer brand</span>' : ''}
      </div>
    </article>

    <section class="med-section">
      <h3>FDA-Approved Psychiatric Uses</h3>
      ${listHtml(medication.fda_psych_uses, 'No curated summary available yet.')}
    </section>

    <section class="med-section">
      <h3>Common Psychiatric Off-Label Uses</h3>
      ${listHtml(medication.off_label_psych_uses, 'No curated summary available yet.')}
    </section>

    <section class="med-section">
      <h3>Psych Dosing Guide</h3>
      ${shouldPromptForFormulation ? '<p>Select formulation to view formulation-specific psych dosing.</p>' : ''}
      ${dosing ? `
        <div class="med-dosing-grid">
          <div class="med-dose-card"><div class="med-dose-label">Start</div><div class="med-dose-value">${escapeHtml(dosing.start || 'Verify official source')}</div></div>
          <div class="med-dose-card"><div class="med-dose-label">Target</div><div class="med-dose-value">${escapeHtml(dosing.target || 'Verify official source')}</div></div>
          <div class="med-dose-card"><div class="med-dose-label">Max</div><div class="med-dose-value">${escapeHtml(dosing.max || 'Verify official source')}</div></div>
        </div>
        ${listHtml(selectedFormulation.titration_notes, 'No titration notes available yet.')}
        ${listHtml(selectedFormulation.administration_notes, 'No administration notes available yet.')}
      ` : ''}
    </section>

    <section class="med-section">
      <h3>Common Formulations</h3>
      <div class="med-control-row">${formulationButtons || '<p class="helper-text">No formulation data available.</p>'}</div>
    </section>

    <section class="med-section">
      <h3>Route</h3>
      ${availableRoutes.length > 1 ? `<div class="med-control-row">${routeButtons}</div>` : `<p>${escapeHtml(availableRoutes[0] || selectedFormulation?.route || 'Oral')}</p>`}
    </section>

    <section class="med-section">
      <h3>Psych Interaction Guide</h3>
      ${listHtml(interactions, 'No curated summary available yet.')}
    </section>

    <section class="med-section">
      <h3>Most Common Side Effects</h3>
      ${listHtml(sideEffects, 'No curated summary available yet.')}
      ${listHtml(medication.important_risks, 'No important serious risk summary available yet.')}
    </section>

    <section class="med-section">
      <h3>Basic Neurotransmitter / Mechanism Of Action</h3>
      <p>${escapeHtml(medication.moa_summary || 'No curated summary available yet.')}</p>
    </section>

    <section class="med-section">
      <h3>Clinical Pearls</h3>
      ${listHtml(pearls, 'No curated summary available yet.')}
    </section>

    <section class="med-section">
      <h3>Source + Freshness</h3>
      <p>Last source sync: ${escapeHtml(medication.source_last_checked || 'Unknown')}</p>
      <p>Editorial review: ${escapeHtml(medication.editorial_last_reviewed || 'Pending review')}</p>
      <p>Status: ${escapeHtml(medication.content_review_status || 'pending review')}</p>
      <div class="med-links">
        ${sourceLinks.length ? sourceLinks.map((url) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`).join('') : '<span class="helper-text">No source links yet.</span>'}
      </div>
    </section>
  `;

  els.medDetailEmpty.classList.add('hidden');
  els.medDetailContent.classList.remove('hidden');
}

function updateMissingRequestCount() {
  if (!els.medMissingCount) return;
  const count = getMissingMedicationRequests().length;
  els.medMissingCount.textContent = `Missing requests: ${count}`;
}

function addMissingMedicationRequest(term, context = {}) {
  const cleaned = normalizeMedicationQueryToken(term);
  if (!cleaned) return;

  const requests = getMissingMedicationRequests();
  requests.unshift({
    term: cleaned,
    createdAt: new Date().toISOString(),
    practice: state.practice,
    visitType: state.visitType,
    context,
  });

  saveMissingMedicationRequests(requests.slice(0, 300));
  updateMissingRequestCount();
}

function exportMissingMedicationRequests() {
  const requests = getMissingMedicationRequests();
  const payload = {
    exportedAt: new Date().toISOString(),
    total: requests.length,
    requests,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `medication-missing-requests-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function focusMedicationSearch() {
  if (!els.medSearchInput) return;
  window.setTimeout(() => {
    els.medSearchInput.focus();
    els.medSearchInput.select();
  }, 40);
}

function setMedicationDrawerOpen(isOpen, options = {}) {
  if (!els.medDrawer || !els.medDrawerBackdrop) return;

  const { force = false, query = '', medicationId = '' } = options;

  if (!isOpen && state.medDrawerPinned && !force) {
    return;
  }

  state.medDrawerOpen = isOpen;
  els.medDrawer.classList.toggle('hidden', !isOpen);
  els.medDrawerBackdrop.classList.toggle('hidden', !isOpen);
  els.medDrawer.setAttribute('aria-hidden', String(!isOpen));

  if (!isOpen) return;

  if (query && els.medSearchInput) {
    els.medSearchInput.value = query;
  }

  if (medicationId) {
    setMedicationSelection(medicationId);
  } else {
    runMedicationSearch(els.medSearchInput ? els.medSearchInput.value : '');
  }

  focusMedicationSearch();
}

function toggleMedicationDrawerPin() {
  state.medDrawerPinned = !state.medDrawerPinned;
  if (els.medPinBtn) {
    els.medPinBtn.classList.toggle('active', state.medDrawerPinned);
    els.medPinBtn.setAttribute('aria-pressed', String(state.medDrawerPinned));
    els.medPinBtn.textContent = state.medDrawerPinned ? 'Pinned' : 'Pin';
  }
}

function handleMedicationResultsKeyboard(event) {
  if (!medicationSearchResults.length) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    medicationFocusedResultIndex = Math.min(medicationSearchResults.length - 1, medicationFocusedResultIndex + 1);
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    medicationFocusedResultIndex = Math.max(0, medicationFocusedResultIndex - 1);
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    const med = medicationSearchResults[medicationFocusedResultIndex] || medicationSearchResults[0];
    if (med) setMedicationSelection(med.id);
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    setMedicationDrawerOpen(false);
  }

  const focusBtn = els.medResultList
    ? els.medResultList.querySelector(`button[data-result-index="${medicationFocusedResultIndex}"]`)
    : null;

  if (focusBtn) {
    focusBtn.focus();
  }
}

function extractMedicationQueryFromField(fieldId) {
  const field = getEl(fieldId);
  if (!field || typeof field.value !== 'string') return '';

  const text = field.value;

  if (typeof field.selectionStart === 'number' && typeof field.selectionEnd === 'number' && field.selectionEnd > field.selectionStart) {
    return text.slice(field.selectionStart, field.selectionEnd).trim();
  }

  const cursor = typeof field.selectionStart === 'number' ? field.selectionStart : text.length;
  const left = text.slice(0, cursor);
  const right = text.slice(cursor);

  const leftToken = left.split(/[\s,;()\[\]{}\n\r]+/).pop() || '';
  const rightToken = (right.split(/[\s,;()\[\]{}\n\r]+/)[0] || '');
  const merged = `${leftToken}${rightToken}`.trim();

  if (merged) return merged;

  return text.trim().split(/\s+/).slice(0, 3).join(' ');
}

function looksLikeMedicationQuery(text) {
  const cleaned = normalizeMedicationQueryToken(text);
  return cleaned.length >= 2 && cleaned.length <= 64 && /[a-z]/i.test(cleaned);
}

function handleMedicationContextOpen(fieldId) {
  const rawQuery = extractMedicationQueryFromField(fieldId);
  const query = looksLikeMedicationQuery(rawQuery) ? normalizeMedicationQueryToken(rawQuery) : '';

  setMedicationDrawerOpen(true, { query });

  if (!query) {
    return;
  }

  runMedicationSearch(query);
}

async function loadMedicationCatalog() {
  if (typeof fetch !== 'function') {
    medicationCatalog = [];
    renderMedicationClassFilters();
    renderMedicationRows();
    runMedicationSearch('');
    renderMedicationDetail();
    updateMissingRequestCount();
    return;
  }

  try {
    const response = await fetch(`${MED_CATALOG_URL}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Medication catalog request failed: ${response.status}`);
    }

    const payload = await response.json();
    const medications = Array.isArray(payload) ? payload : payload.medications;

    if (!Array.isArray(medications)) {
      throw new Error('Medication catalog format invalid.');
    }

    medicationCatalog = medications;
    medicationCatalogGeneratedAt = payload.generated_at || '';

    renderMedicationClassFilters();
    renderMedicationRows();
    runMedicationSearch(els.medSearchInput ? els.medSearchInput.value : '');
    renderMedicationDetail();
  } catch (error) {
    console.error('Unable to load medication catalog:', error);
    medicationCatalog = [];
    renderMedicationClassFilters();
    renderMedicationRows();
    runMedicationSearch('');
    renderMedicationDetail();
  }

  updateMissingRequestCount();
}

async function fetchOpenFdaSignal(genericName) {
  if (typeof fetch !== 'function') return null;

  const term = encodeURIComponent(genericName);
  const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22${term}%22&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const json = await response.json();
    const result = json.results && json.results[0] ? json.results[0] : null;
    if (!result) return null;
    return {
      source: 'openFDA',
      url,
      hasResult: true,
    };
  } catch (error) {
    return null;
  }
}

async function fetchRxNormSignal(genericName) {
  if (typeof fetch !== 'function') return null;

  const term = encodeURIComponent(genericName);
  const url = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${term}&maxEntries=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const json = await response.json();
    const hasResult = Boolean(json.approximateGroup && Array.isArray(json.approximateGroup.candidate) && json.approximateGroup.candidate.length);
    return {
      source: 'RxNorm',
      url,
      hasResult,
    };
  } catch (error) {
    return null;
  }
}

async function fetchDailyMedSignal(genericName) {
  if (typeof fetch !== 'function') return null;

  const term = encodeURIComponent(genericName);
  const url = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=${term}&pagesize=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const json = await response.json();
    const hasResult = Boolean(json.data && Array.isArray(json.data) && json.data.length);
    return {
      source: 'DailyMed',
      url,
      hasResult,
    };
  } catch (error) {
    return null;
  }
}

async function refreshMedicationSignalsInBackground(limit = 10) {
  const recentIds = getMedicationRecents().map((entry) => entry.id);
  const favoriteIds = getMedicationFavorites();
  const uniqueIds = Array.from(new Set([...recentIds, ...favoriteIds])).slice(0, limit);

  if (!uniqueIds.length) return;

  const nowIso = new Date().toISOString();
  const overrides = getRuntimeOverrides();

  for (const id of uniqueIds) {
    const med = getMedicationById(id);
    if (!med) continue;

    const [openFda, rxNorm, dailyMed] = await Promise.all([
      fetchOpenFdaSignal(med.generic_name),
      fetchRxNormSignal(med.generic_name),
      fetchDailyMedSignal(med.generic_name),
    ]);

    const links = [
      ...(med.source_links || []),
      ...(openFda && openFda.hasResult ? [openFda.url] : []),
      ...(rxNorm && rxNorm.hasResult ? [rxNorm.url] : []),
      ...(dailyMed && dailyMed.hasResult ? [dailyMed.url] : []),
    ];

    overrides[id] = {
      source_last_checked: nowIso,
      source_links: Array.from(new Set(links)),
    };

    await new Promise((resolve) => setTimeout(resolve, 180));
  }

  saveRuntimeOverrides(overrides);

  if (state.selectedMedicationId) {
    renderMedicationDetail();
  }
}

async function refreshCatalogIfChanged() {
  if (typeof fetch !== 'function') return;

  try {
    const response = await fetch(`${MED_CATALOG_URL}?check=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) return;

    const payload = await response.json();
    const generatedAt = payload.generated_at || '';
    const medications = Array.isArray(payload.medications) ? payload.medications : [];

    if (!medications.length) return;

    if (generatedAt && generatedAt === medicationCatalogGeneratedAt) return;

    medicationCatalog = medications;
    medicationCatalogGeneratedAt = generatedAt;

    renderMedicationClassFilters();
    renderMedicationRows();
    runMedicationSearch(els.medSearchInput ? els.medSearchInput.value : '');
    renderMedicationDetail();
  } catch (error) {
    // swallow to keep sync quiet
  }
}

function runWhenIdle(task) {
  const wrapped = () => {
    Promise.resolve()
      .then(task)
      .catch((error) => console.error('Background medication sync failed:', error));
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(wrapped, { timeout: 4000 });
    return;
  }

  window.setTimeout(wrapped, 1200);
}

async function runMedicationAutoSyncCycle(force = false) {
  if (medAutoSyncRunning) return;
  medAutoSyncRunning = true;

  try {
    const meta = getStorageJSON(MED_AUTOSYNC_META_KEY, {
      lastCatalogCheck: 0,
      lastIncrementalSync: 0,
      lastWeeklySync: 0,
    });

    const now = Date.now();

    const shouldCatalogCheck = force || now - (meta.lastCatalogCheck || 0) >= 6 * 60 * 60 * 1000;
    const shouldIncremental = force || now - (meta.lastIncrementalSync || 0) >= 24 * 60 * 60 * 1000;
    const shouldWeekly = force || now - (meta.lastWeeklySync || 0) >= 7 * 24 * 60 * 60 * 1000;

    if (shouldCatalogCheck) {
      await refreshCatalogIfChanged();
      meta.lastCatalogCheck = now;
    }

    if (shouldIncremental) {
      await refreshMedicationSignalsInBackground(10);
      meta.lastIncrementalSync = now;
    }

    if (shouldWeekly) {
      await refreshMedicationSignalsInBackground(24);
      meta.lastWeeklySync = now;
    }

    setStorageJSON(MED_AUTOSYNC_META_KEY, meta);
  } finally {
    medAutoSyncRunning = false;
  }
}

function startMedicationAutoSync() {
  if (typeof fetch !== 'function') return;

  if (medAutoSyncTimer) {
    window.clearInterval(medAutoSyncTimer);
  }

  runWhenIdle(() => runMedicationAutoSyncCycle(true));

  medAutoSyncTimer = window.setInterval(() => {
    runWhenIdle(() => runMedicationAutoSyncCycle(false));
  }, 60 * 60 * 1000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      runWhenIdle(() => runMedicationAutoSyncCycle(false));
    }
  });
}

function attachMedicationListeners() {
  if (els.medDrawerBtn) {
    els.medDrawerBtn.addEventListener('click', () => setMedicationDrawerOpen(true));
  }

  if (els.medCloseBtn) {
    els.medCloseBtn.addEventListener('click', () => setMedicationDrawerOpen(false, { force: true }));
  }

  if (els.medDrawerBackdrop) {
    els.medDrawerBackdrop.addEventListener('click', () => setMedicationDrawerOpen(false));
  }

  if (els.medPinBtn) {
    els.medPinBtn.addEventListener('click', toggleMedicationDrawerPin);
  }

  if (els.medSearchInput) {
    els.medSearchInput.addEventListener('input', () => runMedicationSearch(els.medSearchInput.value));
    els.medSearchInput.addEventListener('keydown', handleMedicationResultsKeyboard);
  }

  if (els.medRequestBtn) {
    els.medRequestBtn.addEventListener('click', () => {
      const query = els.medSearchInput ? els.medSearchInput.value : '';
      addMissingMedicationRequest(query, { source: 'drawer-no-result' });
      window.alert('Medication request logged locally. Use "Export Missing Requests JSON" to share with admin review.');
    });
  }

  if (els.medExportMissingBtn) {
    els.medExportMissingBtn.addEventListener('click', exportMissingMedicationRequests);
  }

  if (els.medFavoritesRow) {
    els.medFavoritesRow.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-med-id]');
      if (!btn) return;
      const medId = btn.dataset.medId;
      setMedicationSelection(medId);
      setMedicationDrawerOpen(true, { medicationId: medId });
    });
  }

  if (els.medRecentsRow) {
    els.medRecentsRow.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-med-id]');
      if (!btn) return;
      const medId = btn.dataset.medId;
      setMedicationSelection(medId);
      setMedicationDrawerOpen(true, { medicationId: medId });
    });
  }

  if (els.medDetailContent) {
    els.medDetailContent.addEventListener('click', (event) => {
      const formulationBtn = event.target.closest('button[data-formulation-id]');
      if (formulationBtn) {
        state.selectedFormulationId = formulationBtn.dataset.formulationId;
        const med = getMedicationById(state.selectedMedicationId);
        if (med) {
          const form = (med.formulations || []).find((entry) => entry.formulation_id === state.selectedFormulationId);
          if (form && form.route) state.selectedRoute = form.route;
        }
        renderMedicationDetail();
        return;
      }

      const routeBtn = event.target.closest('button[data-route]');
      if (routeBtn) {
        state.selectedRoute = routeBtn.dataset.route;

        const med = getMedicationById(state.selectedMedicationId);
        if (med) {
          const matching = (med.formulations || []).find((form) => form.route === state.selectedRoute);
          if (matching) {
            state.selectedFormulationId = matching.formulation_id;
          }
        }

        renderMedicationDetail();
        return;
      }

      const actionBtn = event.target.closest('button[data-action]');
      if (!actionBtn) return;

      if (actionBtn.dataset.action === 'toggle-favorite') {
        toggleMedicationFavorite(state.selectedMedicationId);
      }

      if (actionBtn.dataset.action === 'copy-summary') {
        const context = getSelectedMedicationContext();
        if (context) copyMedicationSummary(context);
      }
    });
  }

  document.querySelectorAll('.med-context-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fieldId = btn.dataset.medContextField;
      if (!fieldId) return;
      handleMedicationContextOpen(fieldId);
    });
  });
}

function attachKeyboardShortcuts() {
  document.addEventListener('keydown', async (event) => {
    const hasModifier = event.metaKey || event.ctrlKey;
    if (!hasModifier || !event.shiftKey) {
      if (event.key === 'Escape' && state.medDrawerOpen) {
        event.preventDefault();
        setMedicationDrawerOpen(false);
      }
      return;
    }

    const key = event.key.toLowerCase();

    if (key === 'c') {
      event.preventDefault();
      copyExport();
    }

    if (key === 'o') {
      event.preventDefault();
      const copied = await copyExport();
      if (copied) openActiveGpt();
    }

    if (key === 'g') {
      event.preventDefault();
      openActiveGpt();
    }

    if (key === 'm') {
      event.preventDefault();
      setMedicationDrawerOpen(true);
    }
  });
}

async function copyExport() {
  updateExport();

  try {
    await navigator.clipboard.writeText(els.exportBox.value);
    const original = els.copyBtn.textContent;
    els.copyBtn.textContent = 'Copied';
    window.setTimeout(() => {
      els.copyBtn.textContent = original;
    }, 1200);
    return true;
  } catch (error) {
    console.error(error);
    window.alert('Copy failed. Please copy manually from the export preview.');
    return false;
  }
}

function openActiveGpt() {
  const url = els.activeGptUrl ? els.activeGptUrl.value : '';
  if (!url) {
    window.alert('No GPT link is available for the current workflow.');
    return;
  }

  window.location.assign(url);
}

function attachEventListeners() {
  if (els.astraBtn) els.astraBtn.addEventListener('click', () => setPractice('astra'));
  if (els.ebhBtn) els.ebhBtn.addEventListener('click', () => setPractice('ebh'));
  if (els.followBtn) els.followBtn.addEventListener('click', () => setVisitType('followup'));
  if (els.intakeBtn) els.intakeBtn.addEventListener('click', () => setVisitType('intake'));

  if (els.scriptToggle) {
    els.scriptToggle.addEventListener('change', (event) => {
      state.scriptVisible = Boolean(event.target.checked);
      updateScriptVisibility();
      updateTopbarState();
      saveDraft();
    });
  }

  document.querySelectorAll('#currentModalityToggle .seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => setCurrentModality(btn.dataset.currentModality, btn));
  });

  document.querySelectorAll('#followModalityToggle .seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => setFollowModality(btn.dataset.followModality, btn));
  });

  document.querySelectorAll('#therapyInterwovenToggle .seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => setTherapyTier(btn.dataset.therapyTier, btn));
  });

  document.querySelectorAll('.nowBtn').forEach((btn) => {
    btn.addEventListener('click', () => setTimeNow(btn.dataset.target));
  });

  document.querySelectorAll('.interval-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.followupMode === 'prn') {
        setPrnFollowup();
        return;
      }

      setFollowupWeeks(btn.dataset.weeks);
    });
  });

  if (els.backupList) {
    els.backupList.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-snapshot-index]');
      if (!button) return;

      const index = Number(button.dataset.snapshotIndex);
      if (Number.isNaN(index)) return;
      restoreSnapshot(index);
    });
  }

  if (els.copyBtn) {
    els.copyBtn.addEventListener('click', () => {
      copyExport();
    });
  }

  if (els.copyOpenBtn) {
    els.copyOpenBtn.addEventListener('click', async () => {
      const copied = await copyExport();
      if (copied) openActiveGpt();
    });
  }

  if (els.openGptBtn) {
    els.openGptBtn.addEventListener('click', () => {
      openActiveGpt();
    });
  }

  if (els.clearBtn) {
    els.clearBtn.addEventListener('click', () => {
      if (window.confirm('Clear the current note draft? Current draft will clear, but backup snapshots will be kept.')) {
        clearAll();
      }
    });
  }

  window.addEventListener('scroll', () => updateTopbarState(), { passive: true });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  });
}

function initMedicationReference() {
  renderMedicationClassFilters();
  renderMedicationRows();
  updateMissingRequestCount();
  attachMedicationListeners();
  loadMedicationCatalog();
  startMedicationAutoSync();
}

function init() {
  attachTimeControlListeners();
  attachInputListeners();
  attachLogoFallbacks();
  attachEventListeners();
  attachKeyboardShortcuts();

  const loadedFrom = loadInitialData();

  if (!state.therapyInterwovenTier) {
    state.therapyInterwovenTier = '0';
  }

  if (!getValue('therapyInterwoven')) {
    setValue('therapyInterwoven', state.therapyInterwovenTier);
  }

  syncToggleStates();
  refreshUI(false);

  if (loadedFrom === 'snapshot') {
    saveDraft();
  }

  initMedicationReference();
  registerServiceWorker();
}

init();
