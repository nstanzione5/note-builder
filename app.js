const state = {
  practice: 'astra',
  visitType: 'followup',
  currentModality: '',
  followModality: '',
  scriptVisible: false,
  followupMode: 'scheduled',
  selectedInterval: '',
  therapyInterwovenTier: '0',
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
  followTime: document.getElementById('followTime'),
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
const SMART_TIME_IDS = ['scheduledStart', 'startTime', 'followTime', 'endTime', 'docEnd'];

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
let snapshotTimer = null;

function getEl(id) {
  return document.getElementById(id);
}

function getValue(id) {
  const el = getEl(id);
  return el ? el.value.trim() : '';
}

function setValue(id, value) {
  const el = getEl(id);
  if (el) el.value = value;
}

function isFilled(id) {
  return getValue(id) !== '';
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

function isVisible(element) {
  return Boolean(element) && !element.classList.contains('hidden');
}

function format12Hour(hours24, minutes) {
  const meridiem = hours24 >= 12 ? 'PM' : 'AM';
  const normalizedHour = hours24 % 12 || 12;
  return `${normalizedHour}:${String(minutes).padStart(2, '0')} ${meridiem}`;
}

function getMeridiemHint(value) {
  const match = value.match(/\b(AM|PM)\b/i);
  return match ? match[1].toUpperCase() : 'AM';
}

function normalizeTimeInputValue(rawValue, meridiemHint = 'AM') {
  const raw = rawValue.trim();
  if (!raw) return '';

  const normalized = raw.toLowerCase().replace(/\s+/g, '');
  let hour;
  let minute = '00';
  let suffix = '';

  let compactMatch = normalized.match(/^(\d{3,4})(a|am|p|pm)?$/);
  if (compactMatch) {
    const digits = compactMatch[1];
    hour = Number(digits.slice(0, digits.length - 2));
    minute = digits.slice(-2);
    suffix = compactMatch[2] || '';
  } else {
    const generalMatch = normalized.match(/^(\d{1,2})(?::?(\d{1,2}))?(a|am|p|pm)?$/);
    if (!generalMatch) return '';

    hour = Number(generalMatch[1]);
    minute = generalMatch[2] ? generalMatch[2].padStart(2, '0') : '00';
    suffix = generalMatch[3] || '';
  }

  if (Number.isNaN(hour)) return '';

  const minuteNumber = Number(minute);
  if (Number.isNaN(minuteNumber) || minuteNumber > 59) return '';

  let meridiem = '';
  if (suffix) {
    meridiem = suffix.startsWith('p') ? 'PM' : 'AM';
    if (hour < 1 || hour > 12) return '';
    return `${hour}:${String(minuteNumber).padStart(2, '0')} ${meridiem}`;
  }

  if (hour > 23) return '';

  if (hour === 0) {
    meridiem = 'AM';
    hour = 12;
  } else if (hour === 12) {
    meridiem = 'PM';
  } else if (hour > 12) {
    meridiem = 'PM';
    hour -= 12;
  } else {
    meridiem = meridiemHint === 'PM' ? 'PM' : 'AM';
  }

  return `${hour}:${String(minuteNumber).padStart(2, '0')} ${meridiem}`;
}

function normalizeSmartTimeField(id) {
  const input = getEl(id);
  if (!input) return;

  const normalized = normalizeTimeInputValue(input.value, getMeridiemHint(input.dataset.lastValid || input.value));
  if (normalized) {
    input.value = normalized;
    input.dataset.lastValid = normalized;
  } else if (!input.value.trim()) {
    input.dataset.lastValid = '';
  }
}

function handleSmartTimeTyping(event) {
  const input = event.target;
  const trimmed = input.value.trim();

  if (/^\d{2}$/.test(trimmed)) {
    input.value = `${trimmed}:`;
    input.setSelectionRange(input.value.length, input.value.length);
    return;
  }

  if (/.*[aA]$/.test(trimmed) && !/.*[aA][mM]$/.test(trimmed)) {
    input.value = `${trimmed.slice(0, -1).trim()} AM`;
    input.setSelectionRange(input.value.length, input.value.length);
    return;
  }

  if (/.*[pP]$/.test(trimmed) && !/.*[pP][mM]$/.test(trimmed)) {
    input.value = `${trimmed.slice(0, -1).trim()} PM`;
    input.setSelectionRange(input.value.length, input.value.length);
  }
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
    els.practiceContextLabelSecondary.textContent = isAstra ? 'Workflow emphasis' : 'Workflow emphasis';
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
    els.scriptSectionCopy.textContent = isAstra
      ? 'Verbatim Astra intake interview prompts are available during intake workflows.'
      : 'Verbatim intake interview prompts are available during intake workflows.';
  }

  if (els.closingSectionCopy) {
    els.closingSectionCopy.textContent = isAstra
      ? 'Schedule follow-up first, then capture therapy interwoven tier and closing times.'
      : 'Schedule follow-up first, then capture therapy interwoven tier and closing times.';
  }

  if (els.exportSectionCopy) {
    els.exportSectionCopy.textContent = isAstra
      ? 'Preview the structured Astra raw input live, then copy or open your target GPT.'
      : isIntake
        ? 'Preview the structured EBH intake raw input live, then copy or open EBH Intake GPT.'
        : 'Preview the structured EBH follow-up raw input live, then copy or open EBH Follow-Up GPT.';
  }

  if (els.setupMiniBadge) {
    els.setupMiniBadge.textContent = isAstra ? 'Visit setup' : 'Visit setup';
  }

  if (els.previousPlanMiniBadge) {
    els.previousPlanMiniBadge.textContent = isAstra ? 'Pre-visit context' : 'Pre-visit context';
  }

  if (els.notesMiniBadge) {
    els.notesMiniBadge.textContent = isAstra ? 'Live note capture' : isIntake ? 'Intake narrative' : 'Follow-up narrative';
  }

  if (els.scriptMiniBadge) {
    els.scriptMiniBadge.textContent = isAstra ? 'Verbatim script' : 'Verbatim script';
  }

  if (els.closingMiniBadge) {
    els.closingMiniBadge.textContent = isAstra ? 'Follow-up + close' : 'Follow-up + close';
  }

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

function updateTopbarState() {
  if (!els.topbar) return;

  const shouldCondense = window.scrollY > 56;
  els.topbar.classList.toggle('topbar-condensed', shouldCondense);
  document.body.classList.toggle('page-condensed', shouldCondense);
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
  const previsitComplete = state.visitType === 'followup'
    ? isFilled('previousPlan')
    : state.practice === 'astra'
      ? SCREENER_IDS.some((id) => isFilled(id))
      : isFilled('testDump');

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
  const {
    previsitComplete,
    setupComplete,
    notesComplete,
    closingComplete,
  } = evaluateCompletion();

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

  if (els.followTime) {
    els.followTime.disabled = isPrn;
    if (isPrn) els.followTime.value = '';
  }

  if (els.prnHelperText) {
    els.prnHelperText.classList.toggle('hidden', !isPrn);
  }

  updateIntervalButtons();
}

function loadSnapshotsFromStorage() {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Unable to read local snapshots:', error);
    return [];
  }
}

function saveSnapshotsToStorage(snapshots) {
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshots.slice(0, MAX_SNAPSHOTS)));
}

function formatSnapshotLabel(entry) {
  const date = new Date(entry.savedAt);
  const dateText = Number.isNaN(date.getTime())
    ? 'Unknown time'
    : `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;

  const practice = entry.practice ? entry.practice.toUpperCase() : 'DRAFT';
  const visit = entry.visitType ? entry.visitType.toUpperCase() : 'VISIT';
  return `${dateText} - ${practice} ${visit}`;
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

  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
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

  SMART_TIME_IDS.forEach((id) => normalizeSmartTimeField(id));
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
  updateCompletionIndicators();
  updateExport();
  saveDraft();
}

function setFollowModality(value, button) {
  state.followModality = value;
  setValue('followModality', value);
  setActiveButtons('#followModalityToggle', button);
  updateCompletionIndicators();
  updateExport();
  saveDraft();
}

function setTherapyTier(value, button) {
  state.therapyInterwovenTier = value;
  setValue('therapyInterwoven', value);
  setActiveButtons('#therapyInterwovenToggle', button);
  updateCompletionIndicators();
  updateExport();
  saveDraft();
}

function setTimeNow(targetId) {
  const now = new Date();
  setValue(targetId, format12Hour(now.getHours(), now.getMinutes()));
  normalizeSmartTimeField(targetId);
  updateCompletionIndicators();
  updateExport();
  saveDraft();
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
  updateTopbarState();
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
    // Ignore environments that do not implement scroll behavior (e.g., jsdom).
  }
  window.setTimeout(() => {
    if (els.age) els.age.focus();
  }, 120);
}

function attachSmartTimeListeners() {
  SMART_TIME_IDS.forEach((id) => {
    const input = getEl(id);
    if (!input) return;

    input.addEventListener('keydown', (event) => {
      const hasModifier = event.ctrlKey || event.metaKey || event.altKey;
      if (hasModifier) return;

      if (event.key.toLowerCase() === 'a' || event.key.toLowerCase() === 'p') {
        event.preventDefault();
        const base = input.value.replace(/\s*(a|am|p|pm)$/i, '').trim();
        const suffix = event.key.toLowerCase() === 'a' ? 'AM' : 'PM';
        input.value = `${base} ${suffix}`.trim();
        input.setSelectionRange(input.value.length, input.value.length);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    input.addEventListener('input', handleSmartTimeTyping);

    input.addEventListener('blur', () => {
      normalizeSmartTimeField(id);
      updateCompletionIndicators();
      updateExport();
      saveDraft();
    });
  });
}

function attachInputListeners() {
  inputIds.forEach((id) => {
    const element = getEl(id);
    if (!element) return;

    const syncFieldState = () => {
      if ((id === 'followDate' || id === 'followTime') && state.followupMode === 'prn') {
        return;
      }

      if (SMART_TIME_IDS.includes(id)) {
        normalizeSmartTimeField(id);
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
    };

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

function attachKeyboardShortcuts() {
  document.addEventListener('keydown', async (event) => {
    const hasModifier = event.metaKey || event.ctrlKey;
    if (!hasModifier || !event.shiftKey) return;

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

  window.addEventListener('scroll', updateTopbarState, { passive: true });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  });
}

function init() {
  attachSmartTimeListeners();
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

  registerServiceWorker();
}

init();
