const state = {
  practice: 'astra',
  visitType: 'followup',
  currentModality: '',
  followModality: '',
  scriptVisible: false,
  followupMode: 'scheduled',
  selectedInterval: '',
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
  astraScreeners: document.getElementById('astraScreeners'),
  astraScreenersFields: document.getElementById('astraScreenersFields'),
  ebhTests: document.getElementById('ebhTests'),
  currentModality: document.getElementById('currentModality'),
  followModality: document.getElementById('followModality'),
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
  scriptProgressCount: document.getElementById('scriptProgressCount'),
  practiceModeBanner: document.getElementById('practiceModeBanner'),
  practiceModeKicker: document.getElementById('practiceModeKicker'),
  practiceModeText: document.getElementById('practiceModeText'),
  practiceContextPanel: document.getElementById('practiceContextPanel'),
  practiceContextLabelPrimary: document.getElementById('practiceContextLabelPrimary'),
  practiceContextTextPrimary: document.getElementById('practiceContextTextPrimary'),
  practiceContextLabelSecondary: document.getElementById('practiceContextLabelSecondary'),
  practiceContextTextSecondary: document.getElementById('practiceContextTextSecondary'),
  completionTotal: document.getElementById('completionTotal'),
  setupCompletionCard: document.getElementById('setupCompletionCard'),
  notesCompletionCard: document.getElementById('notesCompletionCard'),
  closingCompletionCard: document.getElementById('closingCompletionCard'),
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
  'endTime',
  'docEnd',
  'followModality',
  'followDate',
  'followTime',
];

const brandConfig = {
  astra: {
    kicker: 'Astra Psychiatry',
    subtitle: 'Structured raw-input capture for psychiatric documentation workflows.',
    fallback: 'A',
  },
  ebh: {
    kicker: 'Evolve Brain Health',
    subtitle: 'Structured raw-input capture for efficient EBH documentation workflows.',
    fallback: 'E',
  },
};

const STORAGE_KEY = 'noteBuilderDraft_v1';

function isFilled(id) {
  return getValue(id) !== '';
}

function setCompletionState(statusEl, cardEl, isComplete) {
  if (statusEl) {
    statusEl.textContent = isComplete ? 'Complete' : 'Incomplete';
    statusEl.classList.toggle('completion-status-complete', isComplete);
    statusEl.classList.toggle('completion-status-pending', !isComplete);
  }

  if (cardEl) {
    cardEl.classList.toggle('is-complete', isComplete);
  }
}

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

function safeShowLogo(imgEl, shouldShow) {
  if (!imgEl) return;
  imgEl.classList.toggle('hidden', !shouldShow);
}

function updateBranding() {
  const brand = brandConfig[state.practice];
  const isAstra = state.practice === 'astra';
  const isIntake = state.visitType === 'intake';

  els.body.dataset.practice = state.practice;
  els.body.dataset.visitType = state.visitType;
  els.brandKicker.textContent = brand.kicker;
  els.brandTitle.textContent = 'Clinical Note Builder';
  els.brandSubtitle.textContent = isAstra
    ? 'Structured raw-input capture for psychiatric documentation workflows.'
    : isIntake
      ? 'Structured raw-input capture for EBH intake documentation workflows.'
      : 'Structured raw-input capture for EBH follow-up documentation workflows.';
  els.brandLogoFallback.textContent = brand.fallback;

  safeShowLogo(els.astraLogo, isAstra);
  safeShowLogo(els.ebhLogo, !isAstra);

  const workflowLabel = `${isAstra ? 'Astra' : 'EBH'} ${isIntake ? 'Intake' : 'Follow-Up'}`;
  els.workflowChip.textContent = workflowLabel;

  if (els.brandModePill) {
    els.brandModePill.textContent = isAstra
      ? 'Astra Workflow'
      : isIntake
        ? 'EBH Intake'
        : 'EBH Follow-Up';
  }

  if (els.workflowRibbonCopy) {
    els.workflowRibbonCopy.textContent = isAstra
      ? 'A focused, copy-first documentation workspace designed around Astra note flow.'
      : isIntake
        ? 'An EBH intake workspace built for pasted screener imports and structured intake capture.'
        : 'An EBH follow-up workspace centered on prior-plan review and focused follow-up note capture.';
  }

  if (els.practiceModeBanner && els.practiceModeKicker && els.practiceModeText) {
    els.practiceModeBanner.classList.remove('hidden');
    els.practiceModeKicker.textContent = isAstra ? 'Astra Mode' : 'EBH Mode';
    els.practiceModeText.textContent = isAstra
      ? 'Astra workflow active: individual screeners for intake and a unified Astra GPT route.'
      : isIntake
        ? 'EBH intake workflow active: paste the full screener block and route to the EBH Intake GPT.'
        : 'EBH follow-up workflow active: prior plan plus follow-up notes route to the EBH Follow-Up GPT.';
  }

  if (els.practiceContextPanel) {
    els.practiceContextPanel.classList.remove('hidden');
  }

  if (els.practiceContextLabelPrimary && els.practiceContextTextPrimary) {
    els.practiceContextLabelPrimary.textContent = isAstra ? 'Astra note flow' : 'EBH note flow';
    els.practiceContextTextPrimary.textContent = isAstra
      ? 'Astra uses one GPT for both intake and follow-up workflows.'
      : isIntake
        ? 'EBH intake uses a dedicated intake GPT with a single paste block for imported test data.'
        : 'EBH follow-up uses a dedicated follow-up GPT built around prior-plan review and concise follow-up documentation.';
  }

  if (els.practiceContextLabelSecondary && els.practiceContextTextSecondary) {
    els.practiceContextLabelSecondary.textContent = isAstra ? 'Documentation emphasis' : 'Workflow emphasis';
    els.practiceContextTextSecondary.textContent = isAstra
      ? (isIntake
          ? 'Use structured Astra intake screeners and freeform clinical intake notes.'
          : 'Use prior-plan follow-up context and freeform appointment notes for Astra follow-ups.')
      : (isIntake
          ? 'Paste the EBH screener output exactly as generated, then capture the intake interview in freeform notes.'
          : 'Keep the prior plan visible, document the follow-up clearly, and hand off to the EBH Follow-Up GPT.');
  }

  if (els.setupSectionCopy) {
    els.setupSectionCopy.textContent = isAstra
      ? 'Capture the opening details in the same order you actually work so the Astra export stays stable, complete, and fast.'
      : 'Capture the opening details in order so the EBH export stays consistent and ready for the correct GPT.';
  }

  if (els.previousPlanSectionCopy) {
    els.previousPlanSectionCopy.textContent = isAstra
      ? 'Shown only for follow-ups so the prior Astra roadmap stays exactly where the GPT expects it.'
      : 'Shown only for follow-ups so prior EBH treatment context stays visible before you document today’s visit.';
  }

  if (els.notesSectionCopy) {
    els.notesSectionCopy.textContent = isAstra
      ? 'Write stream-of-consciousness notes in any order. New lines or blank lines are enough for the Astra GPT to separate ideas.'
      : 'Write stream-of-consciousness notes in any order. New lines or blank lines are enough for the EBH GPT to separate ideas.';
  }

  if (els.scriptSectionCopy) {
    els.scriptSectionCopy.textContent = isAstra
      ? 'Visible during intake workflows so you can reference the Astra intake interview prompts while typing freely.'
      : 'Visible during intake workflows so you can reference the intake interview prompts while typing freely.';
  }

  if (els.closingSectionCopy) {
    els.closingSectionCopy.textContent = isAstra
      ? 'Finish the visit, choose the next interval if needed, and keep follow-up scheduling in the Astra export.'
      : 'Finish the visit, choose the next interval if needed, and keep follow-up scheduling in the EBH export.';
  }

  if (els.exportSectionCopy) {
    els.exportSectionCopy.textContent = isAstra
      ? 'Preview the structured Astra raw input live, then copy it into the Astra GPT.'
      : isIntake
        ? 'Preview the structured EBH intake raw input live, then copy it into the EBH Intake GPT.'
        : 'Preview the structured EBH follow-up raw input live, then copy it into the EBH Follow-Up GPT.';
  }

  if (els.setupMiniBadge) {
    els.setupMiniBadge.textContent = isAstra ? 'Core intake details' : 'Visit essentials';
  }

  if (els.previousPlanMiniBadge) {
    els.previousPlanMiniBadge.textContent = isAstra ? 'Follow-up context' : 'Prior treatment plan';
  }

  if (els.notesMiniBadge) {
    els.notesMiniBadge.textContent = isAstra ? 'Live note capture' : isIntake ? 'Intake narrative' : 'Follow-up narrative';
  }

  if (els.scriptMiniBadge) {
    els.scriptMiniBadge.textContent = isAstra ? 'Interview prompts' : 'Guided intake flow';
  }

  if (els.closingMiniBadge) {
    els.closingMiniBadge.textContent = isAstra ? 'Scheduling + close' : 'Disposition + follow-up';
  }

  if (els.exportMiniBadge) {
    els.exportMiniBadge.textContent = isAstra ? 'Final handoff' : isIntake ? 'EBH intake handoff' : 'EBH follow-up handoff';
  }
}

function updateScriptVisibility() {
  const isIntake = state.visitType === 'intake';
  els.scriptToggleCard.classList.toggle('hidden', !isIntake);

  if (!isIntake) {
    state.scriptVisible = false;
    if (els.scriptToggle) els.scriptToggle.checked = false;
  }

  els.scriptPanel.classList.toggle('hidden', !(isIntake && state.scriptVisible));

  if (els.workspaceGrid) {
    els.workspaceGrid.classList.toggle('workspace-grid-single', els.scriptPanel.classList.contains('hidden'));
  }
}

function updatePracticeSections() {
  const isAstra = state.practice === 'astra';
  const isIntake = state.visitType === 'intake';

  els.previousPlanCard.classList.toggle('hidden', isIntake);
  els.astraScreeners.classList.toggle('hidden', !(isAstra && isIntake));
  els.ebhTests.classList.toggle('hidden', !(state.practice === 'ebh' && isIntake));

  updateCompletionDashboard();
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

  els.activeGptUrl.value = url;

  const helperText = state.practice === 'astra'
    ? 'Astra mode routes to your Astra GPT for both intake and follow-up.'
    : state.visitType === 'intake'
      ? 'EBH intake mode routes to your EBH Intake GPT.'
      : 'EBH follow-up mode routes to your EBH Follow-Up GPT.';

  els.exportHelper.textContent = helperText;
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
  const baseLines = [
    `Face-to-Face End: ${getValue('endTime')}`,
    `Documentation End: ${getValue('docEnd')}`,
    `Follow-Up Modality: ${getValue('followModality')}`,
  ];

  if (state.followupMode === 'prn') {
    return [
      ...baseLines,
      'Follow-Up Scheduling: PRN / no appointment scheduled during this encounter.',
      'No follow-up appointment was scheduled during this encounter.',
      'Patient is not ready to schedule a follow-up appointment yet and will reach out later to schedule.',
    ].join('\n');
  }

  return [
    ...baseLines,
    `Follow-Up Date: ${getValue('followDate')}`,
    `Follow-Up Time: ${getValue('followTime')}`,
  ].join('\n');
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
  els.exportBox.value = buildExport();
}

function updateScriptProgress() {
  if (!els.scriptProgressCount) return;
  const checks = Array.from(document.querySelectorAll('[data-script-check]'));
  const checked = checks.filter((input) => input.checked).length;
  els.scriptProgressCount.textContent = `${checked} / ${checks.length} complete`;
}

function updateCompletionDashboard() {
  const setupComplete = [
    isFilled('age'),
    isFilled('gender'),
    isFilled('scheduledStart'),
    isFilled('currentModality'),
    isFilled('startTime'),
    isFilled('cc'),
  ].every(Boolean);

  let notesComplete = false;
  if (state.practice === 'astra' && state.visitType === 'followup') {
    notesComplete = isFilled('previousPlan') && isFilled('notes');
  } else if (state.practice === 'astra' && state.visitType === 'intake') {
    notesComplete = isFilled('notes');
  } else if (state.practice === 'ebh' && state.visitType === 'followup') {
    notesComplete = isFilled('previousPlan') && isFilled('notes');
  } else {
    notesComplete = isFilled('testDump') && isFilled('notes');
  }

  const closingComplete = state.followupMode === 'prn'
    ? [
        isFilled('endTime'),
        isFilled('docEnd'),
        isFilled('followModality'),
      ].every(Boolean)
    : [
        isFilled('endTime'),
        isFilled('docEnd'),
        isFilled('followModality'),
        isFilled('followDate'),
        isFilled('followTime'),
      ].every(Boolean);

  const completedCount = [setupComplete, notesComplete, closingComplete].filter(Boolean).length;

  setCompletionState(els.setupCompletionStatus, els.setupSection || els.setupCompletionCard, setupComplete);
  setCompletionState(els.notesCompletionStatus, els.notesSection || els.notesCompletionCard, notesComplete);
  setCompletionState(els.closingCompletionStatus, els.closingSection || els.closingCompletionCard, closingComplete);

  if (els.completionTotal) {
    els.completionTotal.textContent = `${completedCount} / 3 complete`;
  }
}

function updateTopbarState() {
  if (!els.topbar) return;
  const shouldCondense = window.scrollY > 40 || (state.visitType === 'intake' && state.scriptVisible);
  els.topbar.classList.toggle('topbar-condensed', shouldCondense);
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

function refreshUI() {
  updateBranding();
  updateScriptVisibility();
  updatePracticeSections();
  updateActiveGptUrl();
  updateScriptProgress();
  updateFollowupSchedulingUI();
  updateCompletionDashboard();
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
    els.scriptToggle.checked = true;
  } else {
    state.scriptVisible = false;
    els.scriptToggle.checked = false;
  }

  refreshUI();
}

function setCurrentModality(value, button) {
  state.currentModality = value;
  setValue('currentModality', value);
  setActiveButtons('#currentModalityToggle', button);
  updateCompletionDashboard();
  updateExport();
  saveDraft();
}

function setFollowModality(value, button) {
  state.followModality = value;
  setValue('followModality', value);
  setActiveButtons('#followModalityToggle', button);
  updateCompletionDashboard();
  updateExport();
  saveDraft();
}

function setTimeNow(targetId) {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  setValue(targetId, `${hours}:${minutes}`);
  updateCompletionDashboard();
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
  els.followDate.value = `${year}-${month}-${day}`;

  updateFollowupSchedulingUI();
  updateCompletionDashboard();
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
  updateCompletionDashboard();
  updateExport();
  saveDraft();
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
    },
    inputs: {},
    scriptChecks: Array.from(document.querySelectorAll('[data-script-check]')).map((checkbox) => checkbox.checked),
  };

  inputIds.forEach((id) => {
    draft.inputs[id] = getValue(id);
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const draft = JSON.parse(raw);

    if (draft.state) {
      state.practice = draft.state.practice || state.practice;
      state.visitType = draft.state.visitType || state.visitType;
      state.currentModality = draft.state.currentModality || '';
      state.followModality = draft.state.followModality || '';
      state.scriptVisible = Boolean(draft.state.scriptVisible);
      state.followupMode = draft.state.followupMode || 'scheduled';
      state.selectedInterval = draft.state.selectedInterval || '';
    }

    if (draft.inputs) {
      inputIds.forEach((id) => {
        if (Object.prototype.hasOwnProperty.call(draft.inputs, id)) {
          setValue(id, draft.inputs[id] || '');
        }
      });
    }

    document.querySelectorAll('[data-script-check]').forEach((checkbox, index) => {
      checkbox.checked = Boolean(draft.scriptChecks && draft.scriptChecks[index]);
    });
  } catch (error) {
    console.error('Unable to load saved draft:', error);
  }
}

async function copyExport() {
  updateExport();
  try {
    await navigator.clipboard.writeText(els.exportBox.value);
    const previousText = els.copyBtn.textContent;
    els.copyBtn.textContent = 'Copied';
    setTimeout(() => {
      els.copyBtn.textContent = previousText;
    }, 1200);
    return true;
  } catch (error) {
    console.error(error);
    window.alert('Copy failed. Please copy manually from the export preview.');
    return false;
  }
}

function openActiveGpt() {
  const url = els.activeGptUrl.value;
  if (!url) {
    window.alert('No GPT link is available for the current workflow.');
    return;
  }
  window.location.assign(url);
}

function clearAll() {
  inputIds.forEach((id) => setValue(id, ''));
  state.currentModality = '';
  state.followModality = '';
  state.followupMode = 'scheduled';
  state.selectedInterval = '';

  document.querySelectorAll('#currentModalityToggle .seg-btn, #followModalityToggle .seg-btn, .interval-btn').forEach((btn) => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });

  document.querySelectorAll('[data-script-check]').forEach((checkbox) => {
    checkbox.checked = false;
  });

  if (els.scriptToggle) els.scriptToggle.checked = false;
  state.scriptVisible = false;

  localStorage.removeItem(STORAGE_KEY);
  refreshUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  window.setTimeout(() => {
    if (els.age) els.age.focus();
  }, 150);
}

function attachInputListeners() {
  inputIds.forEach((id) => {
    const element = getEl(id);
    if (!element) return;

    const syncFieldState = () => {
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

      updateCompletionDashboard();
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
      els.brandLogoFallback.textContent = fallbackText;
      els.brandLogoFallback.classList.remove('hidden');
      els.brandLogoFallback.style.display = 'flex';
      img.classList.add('hidden');
    });
    img.addEventListener('load', () => {
      els.brandLogoFallback.classList.add('hidden');
      els.brandLogoFallback.style.display = 'none';
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

function attachEventListeners() {
  if (els.astraBtn) els.astraBtn.addEventListener('click', () => setPractice('astra'));
  if (els.ebhBtn) els.ebhBtn.addEventListener('click', () => setPractice('ebh'));
  if (els.followBtn) els.followBtn.addEventListener('click', () => setVisitType('followup'));
  if (els.intakeBtn) els.intakeBtn.addEventListener('click', () => setVisitType('intake'));

  if (els.scriptToggle) {
    els.scriptToggle.addEventListener('change', (event) => {
      state.scriptVisible = event.target.checked;
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

  document.querySelectorAll('[data-script-check]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      updateScriptProgress();
      saveDraft();
    });
  });

  if (els.copyBtn) els.copyBtn.addEventListener('click', () => { copyExport(); });

  if (els.copyOpenBtn) els.copyOpenBtn.addEventListener('click', async () => {
    const copied = await copyExport();
    if (copied) openActiveGpt();
  });

  if (els.openGptBtn) els.openGptBtn.addEventListener('click', () => { openActiveGpt(); });

  if (els.clearBtn) els.clearBtn.addEventListener('click', () => {
    if (window.confirm('Clear the current note draft?')) {
      clearAll();
    }
  });

  window.addEventListener('scroll', updateTopbarState, { passive: true });
}

function init() {
  attachInputListeners();
  attachLogoFallbacks();
  attachEventListeners();
  attachKeyboardShortcuts();
  loadDraft();
  setActiveByData('#practiceToggle .seg-btn', 'practice', state.practice);
  setActiveByData('#visitTypeToggle .seg-btn', 'visitType', state.visitType);
  setActiveByData('#currentModalityToggle .seg-btn', 'currentModality', state.currentModality);
  setActiveByData('#followModalityToggle .seg-btn', 'followModality', state.followModality);
  refreshUI();
  updateTopbarState();
}

init();
