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
  topbarCondenseProgress: 0,
  medDrawerOpen: false,
  medDrawerPinned: false,
  medClassFilter: 'all',
  medCuratedOnly: false,
  selectedMedicationId: '',
  selectedFormulationId: '',
  selectedRoute: '',
  driveConnection: 'local',
  driveLastError: '',
  pendingDriveWrites: 0,
  driveCanonicalRootId: '',
  saveUnlocked: false,
  driveWritesBlocked: true,
  driveWriteBlockReason: 'Drive preflight pending.',
  driveWriteBlockCode: 'preflight_pending',
  driveResolvedUserEmail: '',
  driveBackendBuildId: '',
  drivePreflightStatus: 'pending',
  drivePreflightReason: '',
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
  therapyInterwovenHint: document.getElementById('therapyInterwovenHint'),
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
  medCuratedOnly: document.getElementById('medCuratedOnly'),
  medClassFilters: document.getElementById('medClassFilters'),
  medFavoritesRow: document.getElementById('medFavoritesRow'),
  medRecentsRow: document.getElementById('medRecentsRow'),
  medResultList: document.getElementById('medResultList'),
  medEmptyState: document.getElementById('medEmptyState'),
  medRequestBtn: document.getElementById('medRequestBtn'),
  medFetchFallbackBtn: document.getElementById('medFetchFallbackBtn'),
  medDetailEmpty: document.getElementById('medDetailEmpty'),
  medDetailContent: document.getElementById('medDetailContent'),
  medExportMissingBtn: document.getElementById('medExportMissingBtn'),
  medMissingCount: document.getElementById('medMissingCount'),
  driveSyncStatus: document.getElementById('driveSyncStatus'),
  driveDiagnosticsBtn: document.getElementById('driveDiagnosticsBtn'),
  driveCleanupBtn: document.getElementById('driveCleanupBtn'),
  driveCleanupStatus: document.getElementById('driveCleanupStatus'),
  driveDiagnosticsModal: document.getElementById('driveDiagnosticsModal'),
  driveCloseDiagnosticsBtn: document.getElementById('driveCloseDiagnosticsBtn'),
  driveRunRepairBtn: document.getElementById('driveRunRepairBtn'),
  diagClientBuild: document.getElementById('diagClientBuild'),
  diagBackendBuild: document.getElementById('diagBackendBuild'),
  diagEndpoint: document.getElementById('diagEndpoint'),
  diagResolvedUser: document.getElementById('diagResolvedUser'),
  diagSharedDrive: document.getElementById('diagSharedDrive'),
  diagCanonicalRoot: document.getElementById('diagCanonicalRoot'),
  diagPreflightStatus: document.getElementById('diagPreflightStatus'),
  diagBlockCode: document.getElementById('diagBlockCode'),
  diagBlockReason: document.getElementById('diagBlockReason'),
  diagLastError: document.getElementById('diagLastError'),
  docEndPlusMinutes: document.getElementById('docEndPlusMinutes'),
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
const CONDENSE_START_Y = 36;
const CONDENSE_END_Y = 210;
const CONDENSE_CLASS_ENTER = 0.86;
const CONDENSE_CLASS_EXIT = 0.62;

const MED_CATALOG_URL = './data/meds/compiled/medications.compiled.json';
const APP_BUILD_ID = String((els.body && els.body.dataset && els.body.dataset.appBuildId) || '20260311-drive-reset-v1').trim() || '20260311-drive-reset-v1';
const MED_FAVORITES_KEY = 'medDrawerFavorites_v1';
const MED_RECENTS_KEY = 'medDrawerRecents_v1';
const MED_MISSING_REQUESTS_KEY = 'medDrawerMissingRequests_v1';
const MED_RUNTIME_OVERRIDES_KEY = 'medDrawerRuntimeOverrides_v1';
const MED_RUNTIME_FALLBACKS_KEY = 'medDrawerRuntimeFallbacks_v1';
const MED_AUTOSYNC_META_KEY = 'medDrawerAutoSyncMeta_v1';
const MED_CATALOG_CHECKSUM_KEY = 'medCatalogChecksum_v1';
const DRIVE_USER_EMAIL_KEY = 'driveSyncUserEmail_v1';
const DRIVE_RESOLVED_USER_EMAIL_KEY = 'driveSyncResolvedUserEmail_v1';
const DRIVE_QUEUE_KEY = 'driveSyncPendingWrites_v1';
const DRIVE_META_KEY = 'driveSyncMeta_v1';
const DRIVE_REVISIONS_KEY = 'driveSyncRevisions_v1';
const DRIVE_AUTO_CLEANUP_META_KEY = 'driveSyncAutoCleanupMeta_v1';
const DRIVE_DRAFT_PATH = 'data/draft/current.json';
const DRIVE_RECENT_PATIENTS_PATH = 'data/draft/recent-patients.json';
const DRIVE_MED_COMPILED_PATH = 'data/meds/compiled/medications.compiled.json';
const DRIVE_MED_REFRESH_QUEUE_PATH = 'logs/sync/med-refresh-requests.json';
const DRIVE_MED_RUNTIME_FALLBACKS_PATH = 'data/meds/review/runtime-fallbacks.json';
const DRIVE_SYNC_ENTERPRISE_NAME = 'Note App';
const DRIVE_MANIFEST_FILE = 'config/drive-manifest.json';
const DRAFT_PERSIST_IDLE_MS = 3000;
const RECENT_PATIENTS_DRIVE_MIN_INTERVAL_MS = 90000;
const DRIVE_AUTO_CLEANUP_INTERVAL_MS = 1000 * 60 * 60 * 24;
const DRIVE_MANUAL_CLEANUP_MAX_ROUNDS = 8;
const DRIVE_CLEANUP_APPLY_BATCH_SIZE = 250;
const DRIVE_AUTO_REPAIR_COOLDOWN_MS = 1000 * 60 * 5;
const MEDICATION_FALLBACK_CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const MEDICATION_TERM_QUALIFIER_REGEX = /\b(?:xr|er|sr|dr|ir|odt|xl|hcl|hydrochloride|fumarate|succinate|maleate|tartrate|mesylate|sodium|phosphate|capsule|capsules|tablet|tablets|solution|extended release|immediate release)\b/gi;
const MEDICATION_PEDIATRIC_TEXT_REGEX = /\b(?:pediatric|paediatric|child|children|adolescent|adolescents|teen|teenager|teenagers|infant|infants|neonate|neonates|newborn|newborns|under\s*18|younger than 18|ages?\s*\d{1,2}\s*(?:-|to)\s*\d{1,2}|mg\/kg|mcg\/kg|mg\/kg\/day|mcg\/kg\/day)\b/i;
const THERAPY_TIER_MINUTES = {
  '0': 0,
  '>=16': 16,
  '>=38': 38,
  '>=53': 53,
};

let snapshotTimer = null;
let draftPersistTimer = null;
let pendingDraftPersistSkipDrive = false;
let latestDraftHash = '';
const timeControlMap = new Map();
let medicationCatalogBase = [];
let medicationCatalog = [];
let runtimeMedicationFallbacks = {};
let medicationCatalogGeneratedAt = '';
let medicationSearchResults = [];
let medicationFocusedResultIndex = -1;
let medicationFallbackFetchRunning = false;
let medAutoSyncTimer = null;
let medAutoSyncRunning = false;
let medicationCatalogLoadError = false;
let medicationCatalogLoading = false;
let medicationCatalogLoadPromise = null;
const medicationSupplementAttempted = new Set();
const medicationFallbackCache = new Map();
let scrollRafScheduled = false;
let driveQueueTimer = null;
let driveSyncTimer = null;
let driveQueueRunning = false;
let driveSyncRunning = false;
let pendingRecentPatientsForDrive = null;
let recentPatientsDriveTimer = null;
let lastRecentPatientsDriveQueuedAt = 0;
const driveQueuedChecksums = new Map();
let driveCleanupRunning = false;
let driveRepairRunning = false;

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

function isElementFocusableInput(el) {
  if (!el) return false;
  if (el.disabled || el.readOnly) return false;
  if (el.type === 'hidden') return false;
  if (!el.offsetParent) return false;
  const rootCard = el.closest('.card');
  if (rootCard && rootCard.classList.contains('hidden')) return false;
  return true;
}

function focusFirstClinicalInput() {
  const isEligible = (el) => isElementFocusableInput(el)
    && !el.classList.contains('time-part')
    && !el.closest('.med-drawer');
  const preferredSelectors = [
    '#cc',
    '#notes',
    'main.app-shell textarea',
    'main.app-shell input[type="text"]',
    'main.app-shell input:not([type])',
  ];

  let target = null;
  for (let i = 0; i < preferredSelectors.length; i += 1) {
    const selector = preferredSelectors[i];
    const candidates = [...document.querySelectorAll(selector)];
    target = candidates.find((el) => isEligible(el));
    if (target) break;
  }

  if (!target) {
    const fallbackCandidates = [
      ...document.querySelectorAll('main.app-shell textarea, main.app-shell input, main.app-shell select'),
    ];
    target = fallbackCandidates.find((el) => isEligible(el));
  }

  if (!target || typeof target.focus !== 'function') return;
  target.focus();
  if (typeof target.select === 'function' && (target.tagName === 'TEXTAREA' || target.type === 'text')) {
    target.select();
  }
}

function safeShowLogo(imgEl, shouldShow) {
  if (!imgEl) return;
  imgEl.classList.toggle('hidden', !shouldShow);
}

function clamp(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
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

function getDriveConfig() {
  const dataset = els.body ? els.body.dataset : {};
  const query = typeof window !== 'undefined' ? new URLSearchParams(window.location.search || '') : null;
  const queryUserEmail = query ? String(query.get('driveUserEmail') || '').trim().toLowerCase() : '';
  const storedUserEmail = String(getStorageJSON(DRIVE_USER_EMAIL_KEY, '') || '').trim().toLowerCase();
  const resolvedUserEmail = String(getStorageJSON(DRIVE_RESOLVED_USER_EMAIL_KEY, '') || '').trim().toLowerCase();
  // Do not trust static HTML dataset identity in production. Use resolved/session identity
  // first, with optional explicit query override for break-glass troubleshooting.
  const userEmail = resolvedUserEmail || queryUserEmail || storedUserEmail || '';
  if (userEmail && userEmail !== storedUserEmail) {
    setStorageJSON(DRIVE_USER_EMAIL_KEY, userEmail);
  }
  const intervalRaw = Number.parseInt(dataset.driveSyncMinutes || '', 10);
  const syncIntervalMinutes = Number.isFinite(intervalRaw) && intervalRaw > 0 ? intervalRaw : 30;

  return {
    enabled: dataset.driveSyncEnabled === 'true',
    endpointUrl: String(dataset.driveEndpointUrl || '').trim(),
    sharedDriveId: String(dataset.driveSharedDriveId || '').trim(),
    rootFolderName: DRIVE_SYNC_ENTERPRISE_NAME,
    userEmail,
    ownerEmail: String(dataset.driveOwnerEmail || '').trim(),
    serviceToken: String(dataset.driveServiceToken || '').trim() || String(dataset.driveOwnerToken || '').trim(),
    ownerToken: String(dataset.driveOwnerToken || '').trim(),
    syncIntervalMs: syncIntervalMinutes * 60 * 1000,
  };
}

function driveUserKeyFromEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '')
    .replace(/@/g, '-at-')
    .replace(/\./g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getScopedDriveDraftPath() {
  const config = getDriveConfig();
  const userKey = driveUserKeyFromEmail(config.userEmail);
  if (!userKey) return '';
  return `data/draft/users/${userKey}/current.json`;
}

function getScopedDriveRecentPatientsPath() {
  const config = getDriveConfig();
  const userKey = driveUserKeyFromEmail(config.userEmail);
  if (!userKey) return '';
  return `data/draft/users/${userKey}/recent-patients.json`;
}

function isDraftPath(path) {
  const value = String(path || '').trim();
  return value === DRIVE_DRAFT_PATH
    || value === getScopedDriveDraftPath()
    || /\/current\.json$/.test(value);
}

function isRecentPatientsPath(path) {
  const value = String(path || '').trim();
  return value === DRIVE_RECENT_PATIENTS_PATH
    || value === getScopedDriveRecentPatientsPath()
    || /\/recent-patients\.json$/.test(value);
}

function isRuntimeFallbacksPath(path) {
  return String(path || '').trim() === DRIVE_MED_RUNTIME_FALLBACKS_PATH;
}

function isDriveSyncEnabled() {
  const config = getDriveConfig();
  return config.enabled && Boolean(config.endpointUrl);
}

function getDriveMeta() {
  const fallback = {
    connection: 'local',
    lastPull: 0,
    lastPush: 0,
    lastError: '',
    manifestRevision: '',
    manifestChecksum: '',
    bootstrapCompleted: false,
    lastRepairAttemptAt: 0,
  };
  const parsed = getStorageJSON(DRIVE_META_KEY, fallback);
  if (!parsed || typeof parsed !== 'object') return { ...fallback };
  return { ...fallback, ...parsed };
}

function setDriveMeta(meta) {
  setStorageJSON(DRIVE_META_KEY, meta);
  state.driveConnection = meta.connection || 'local';
  state.driveLastError = meta.lastError || '';
}

function setResolvedDriveUserEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return false;
  const previous = String(getStorageJSON(DRIVE_RESOLVED_USER_EMAIL_KEY, '') || '').trim().toLowerCase();
  if (normalized === previous) {
    state.driveResolvedUserEmail = normalized;
    return false;
  }

  setStorageJSON(DRIVE_RESOLVED_USER_EMAIL_KEY, normalized);
  setStorageJSON(DRIVE_USER_EMAIL_KEY, normalized);
  state.driveResolvedUserEmail = normalized;
  return true;
}

function clearResolvedDriveUserEmail() {
  const previous = String(getStorageJSON(DRIVE_RESOLVED_USER_EMAIL_KEY, '') || '').trim().toLowerCase();
  const previousStored = String(getStorageJSON(DRIVE_USER_EMAIL_KEY, '') || '').trim().toLowerCase();
  localStorage.removeItem(DRIVE_RESOLVED_USER_EMAIL_KEY);
  if (previousStored && previousStored === previous) {
    localStorage.removeItem(DRIVE_USER_EMAIL_KEY);
  }
  state.driveResolvedUserEmail = '';
  return Boolean(previous);
}

function applyDriveHealthState(healthPayload) {
  const payload = healthPayload && typeof healthPayload === 'object' ? healthPayload : {};
  const resolvedUser = String(payload.resolvedUserEmail || '').trim().toLowerCase();
  const backendBuild = String(payload.appBuildId || '').trim();
  const preflightStatus = String(payload.preflightStatus || '').trim() || 'unknown';
  const preflightReason = String(payload.preflightReason || '').trim();
  const canonicalRootId = payload.canonicalRoot && payload.canonicalRoot.id
    ? String(payload.canonicalRoot.id).trim()
    : '';
  const userChanged = resolvedUser
    ? setResolvedDriveUserEmail(resolvedUser)
    : clearResolvedDriveUserEmail();
  state.driveBackendBuildId = backendBuild;
  state.drivePreflightStatus = preflightStatus;
  state.drivePreflightReason = preflightReason;
  if (canonicalRootId) {
    state.driveCanonicalRootId = canonicalRootId;
  }

  return {
    resolvedUser,
    backendBuild,
    preflightStatus,
    preflightReason,
    canonicalRootId,
    userChanged,
  };
}

function getDriveAutoCleanupMeta() {
  const fallback = { lastAttemptAt: 0, lastMovedCount: 0, lastError: '' };
  const parsed = getStorageJSON(DRIVE_AUTO_CLEANUP_META_KEY, fallback);
  if (!parsed || typeof parsed !== 'object') return { ...fallback };
  return {
    ...fallback,
    ...parsed,
    lastAttemptAt: Number(parsed.lastAttemptAt) || 0,
    lastMovedCount: Number(parsed.lastMovedCount) || 0,
    lastError: String(parsed.lastError || ''),
  };
}

function setDriveAutoCleanupMeta(meta) {
  setStorageJSON(DRIVE_AUTO_CLEANUP_META_KEY, {
    lastAttemptAt: Number(meta && meta.lastAttemptAt) || 0,
    lastMovedCount: Number(meta && meta.lastMovedCount) || 0,
    lastError: String((meta && meta.lastError) || ''),
  });
}

function getDriveRevisions() {
  const parsed = getStorageJSON(DRIVE_REVISIONS_KEY, {});
  if (!parsed || typeof parsed !== 'object') return {};
  return parsed;
}

function setDriveRevisions(revisions) {
  setStorageJSON(DRIVE_REVISIONS_KEY, revisions);
}

function getDriveQueue() {
  const parsed = getStorageJSON(DRIVE_QUEUE_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function setDriveQueue(queue) {
  const safeQueue = Array.isArray(queue) ? queue : [];
  setStorageJSON(DRIVE_QUEUE_KEY, safeQueue);
  state.pendingDriveWrites = safeQueue.length;
}

function setDriveStatusBadge(message, status, title = '') {
  if (!els.driveSyncStatus) return;

  const normalized = status || 'local';
  els.driveSyncStatus.classList.remove(
    'drive-sync-status-local',
    'drive-sync-status-online',
    'drive-sync-status-syncing',
    'drive-sync-status-offline',
    'drive-sync-status-error',
  );

  els.driveSyncStatus.classList.add(`drive-sync-status-${normalized}`);
  els.driveSyncStatus.textContent = message;
  els.driveSyncStatus.title = title || message;
}

function formatTimestampLabel(value) {
  const numeric = Number(value);
  if (!numeric || Number.isNaN(numeric)) return 'never';
  try {
    return new Date(numeric).toLocaleString();
  } catch (error) {
    return 'unknown';
  }
}

function updateDriveStatusBadge(meta = getDriveMeta()) {
  if (!isDriveSyncEnabled()) {
    setDriveStatusBadge('Drive: Local only', 'local', 'Drive sync disabled in page data attributes.');
    renderDriveDiagnostics();
    return;
  }

  if (state.driveWritesBlocked) {
    const reason = state.driveWriteBlockReason || 'Drive write preflight failed.';
    const code = String(state.driveWriteBlockCode || 'blocked');
    setDriveStatusBadge('Drive: Writes blocked', 'error', `[${code}] ${reason}`);
    renderDriveDiagnostics();
    return;
  }

  const queued = getDriveQueue().length;

  if (meta.connection === 'syncing') {
    setDriveStatusBadge(`Drive: Syncing (${queued} queued)`, 'syncing');
    renderDriveDiagnostics();
    return;
  }

  if (meta.connection === 'offline') {
    setDriveStatusBadge(`Drive: Offline (${queued} queued)`, 'offline', meta.lastError || 'Network unavailable.');
    renderDriveDiagnostics();
    return;
  }

  if (meta.connection === 'error') {
    setDriveStatusBadge(`Drive: Sync error (${queued} queued)`, 'error', meta.lastError || 'Drive endpoint unavailable.');
    renderDriveDiagnostics();
    return;
  }

  const latest = meta.lastPush || meta.lastPull;
  setDriveStatusBadge(
    latest ? `Drive: Synced ${new Date(latest).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Drive: Online',
    'online',
    `Last pull: ${formatTimestampLabel(meta.lastPull)} | Last push: ${formatTimestampLabel(meta.lastPush)}`,
  );
  renderDriveDiagnostics();
}

function setDriveWriteBlock(blocked, reason = '', code = '') {
  const nextBlocked = Boolean(blocked);
  const wasBlocked = Boolean(state.driveWritesBlocked);
  state.driveWritesBlocked = nextBlocked;
  state.driveWriteBlockReason = nextBlocked ? String(reason || 'Drive writes are blocked by preflight validation.') : '';
  state.driveWriteBlockCode = nextBlocked ? String(code || 'preflight_blocked') : '';

  if (!nextBlocked) {
    const meta = getDriveMeta();
    if (meta.lastError) {
      meta.lastError = '';
      setDriveMeta(meta);
    }
    if (wasBlocked) {
      handleDriveRecovered();
    }
    renderDriveDiagnostics();
    return;
  }

  const meta = getDriveMeta();
  meta.connection = 'error';
  meta.lastError = state.driveWriteBlockReason;
  setDriveMeta(meta);
  renderDriveDiagnostics();
}

function handleDriveRecovered() {
  // Avoid replaying stale blocked-period queue entries; publish a single fresh canonical state.
  setDriveQueue([]);
  setDriveRevisions({});
  driveQueuedChecksums.clear();

  const canPublish = state.saveUnlocked || hasValidStartTimeForSaveUnlock();
  if (!canPublish) return;

  const localDraft = getStorageJSON(STORAGE_KEY, null);
  if (localDraft && typeof localDraft === 'object') {
    queueDriveDraftWrite(localDraft);
  }
  const snapshots = loadSnapshotsFromStorage();
  if (Array.isArray(snapshots) && snapshots.length) {
    queueDriveRecentPatientsWrite(snapshots, { force: true });
  }
  scheduleDriveQueueFlush(450);
}

function renderDriveDiagnostics() {
  if (!els.diagClientBuild) return;
  const config = getDriveConfig();
  const meta = getDriveMeta();

  if (els.diagClientBuild) els.diagClientBuild.textContent = APP_BUILD_ID || 'n/a';
  if (els.diagBackendBuild) els.diagBackendBuild.textContent = state.driveBackendBuildId || 'unknown';
  if (els.diagEndpoint) els.diagEndpoint.textContent = config.endpointUrl || 'not configured';
  if (els.diagResolvedUser) els.diagResolvedUser.textContent = state.driveResolvedUserEmail || config.userEmail || 'unknown';
  if (els.diagSharedDrive) els.diagSharedDrive.textContent = config.sharedDriveId || 'not configured';
  if (els.diagCanonicalRoot) els.diagCanonicalRoot.textContent = state.driveCanonicalRootId || 'unknown';
  if (els.diagPreflightStatus) {
    const status = state.drivePreflightStatus || 'unknown';
    const reason = state.drivePreflightReason || '';
    els.diagPreflightStatus.textContent = reason ? `${status} (${reason})` : status;
  }
  if (els.diagBlockCode) els.diagBlockCode.textContent = state.driveWriteBlockCode || 'none';
  if (els.diagBlockReason) els.diagBlockReason.textContent = state.driveWriteBlockReason || 'none';
  if (els.diagLastError) els.diagLastError.textContent = meta.lastError || 'none';
}

function openDriveDiagnostics() {
  if (!els.driveDiagnosticsModal) return;
  renderDriveDiagnostics();
  els.driveDiagnosticsModal.classList.remove('hidden');
  els.driveDiagnosticsModal.setAttribute('aria-hidden', 'false');
}

function closeDriveDiagnostics() {
  if (!els.driveDiagnosticsModal) return;
  els.driveDiagnosticsModal.classList.add('hidden');
  els.driveDiagnosticsModal.setAttribute('aria-hidden', 'true');
}

async function runDriveRepair(trigger = 'manual', options = {}) {
  const { skipResync = false } = options;
  if (driveRepairRunning) return;
  if (!isDriveSyncEnabled()) {
    setDriveCleanupStatus('Drive repair unavailable: sync disabled.', true);
    return;
  }

  driveRepairRunning = true;
  if (els.driveRunRepairBtn) {
    els.driveRunRepairBtn.disabled = true;
    els.driveRunRepairBtn.textContent = 'Repairing...';
  }
  setDriveCleanupStatus('Running Drive repair and pointer reset...');
  const repairMeta = getDriveMeta();
  repairMeta.lastRepairAttemptAt = Date.now();
  setDriveMeta(repairMeta);

  try {
    const config = getDriveConfig();
    await callDriveEndpoint('drive.repair', {
      sharedDriveId: config.sharedDriveId,
      rootFolderName: config.rootFolderName || DRIVE_SYNC_ENTERPRISE_NAME,
      trigger,
    });

    const health = await callDriveEndpoint('health', {});
    const next = applyDriveHealthState(health);
    if (next.backendBuild && APP_BUILD_ID !== next.backendBuild) {
      setDriveWriteBlock(true, 'Client update required: cached app build differs from backend deployment.', 'version_mismatch');
    } else if (next.preflightStatus && next.preflightStatus !== 'ok') {
      const reason = next.preflightReason || `Drive preflight status: ${next.preflightStatus}`;
      setDriveWriteBlock(true, reason, next.preflightStatus);
    } else {
      setDriveWriteBlock(false, '');
    }

    if (!skipResync) {
      setDriveCleanupStatus('Drive repair complete. Running sync check...');
      await runDriveSyncCycle(true);
    } else {
      setDriveCleanupStatus('Drive repair complete.');
    }
  } catch (error) {
    const message = String(error && error.message ? error.message : error);
    setDriveWriteBlock(true, `Drive repair failed: ${message}`, 'repair_failed');
    setDriveCleanupStatus(`Drive repair failed: ${message}`, true);
  } finally {
    driveRepairRunning = false;
    if (els.driveRunRepairBtn) {
      els.driveRunRepairBtn.disabled = false;
      els.driveRunRepairBtn.textContent = 'Run Drive Repair';
    }
    renderDriveDiagnostics();
  }
}

function canQueueDriveWrites() {
  return isDriveSyncEnabled() && !state.driveWritesBlocked;
}

function hashStringChecksum(content) {
  const text = String(content || '');
  let hash = 5381;

  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) + hash) + text.charCodeAt(i);
    hash >>>= 0;
  }

  return hash.toString(16);
}

function enqueueDriveOperation(operation) {
  if (!canQueueDriveWrites()) {
    updateDriveStatusBadge();
    return;
  }

  const queue = getDriveQueue();
  if (operation.dedupeKey) {
    for (let i = queue.length - 1; i >= 0; i -= 1) {
      if (queue[i].dedupeKey === operation.dedupeKey) {
        queue.splice(i, 1);
      }
    }
  }

  queue.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 9)}`,
    queuedAt: new Date().toISOString(),
    attempts: 0,
    ...operation,
  });

  setDriveQueue(queue);
  updateDriveStatusBadge();
  scheduleDriveQueueFlush(800);
}

function ensureScopedDrivePath(path, label) {
  const safePath = String(path || '').trim();
  if (safePath) return safePath;
  const reason = `Drive writes paused: ${label} requires a valid drive user email for per-user isolation.`;
  setDriveWriteBlock(true, reason, 'identity_missing');
  updateDriveStatusBadge();
  return '';
}

function queueDriveDraftWrite(draft) {
  if (!canQueueDriveWrites() || !draft) return;

  const path = ensureScopedDrivePath(getScopedDriveDraftPath(), 'current draft path');
  if (!path) return;
  const revisions = getDriveRevisions();
  const payload = {
    savedAt: draft.savedAt || new Date().toISOString(),
    draft,
    practice: draft.state && draft.state.practice ? draft.state.practice : state.practice,
    visitType: draft.state && draft.state.visitType ? draft.state.visitType : state.visitType,
    source: 'note-builder-client',
  };

  const content = JSON.stringify(payload, null, 2);
  const checksum = hashStringChecksum(content);
  if (driveQueuedChecksums.get(path) === checksum) {
    return;
  }

  enqueueDriveOperation({
    type: 'file.put',
    path,
    content,
    contentType: 'application/json',
    checksum,
    expectedRevision: revisions[path] || '',
    dedupeKey: `file:${path}`,
  });
  driveQueuedChecksums.set(path, checksum);
}

function queueDriveRecentPatientsWrite(snapshots, options = {}) {
  if (!canQueueDriveWrites()) return;
  const { force = false } = options;

  const path = ensureScopedDrivePath(getScopedDriveRecentPatientsPath(), 'recent patients path');
  if (!path) return;
  const normalizedSnapshots = mergeSnapshotCollections(snapshots || [], []);
  const revisions = getDriveRevisions();
  const payload = {
    savedAt: new Date().toISOString(),
    source: 'note-builder-client',
    snapshots: normalizedSnapshots,
  };
  const content = JSON.stringify(payload, null, 2);
  const checksum = hashStringChecksum(content);
  if (driveQueuedChecksums.get(path) === checksum) {
    return;
  }

  const now = Date.now();
  if (!force) {
    const elapsed = now - lastRecentPatientsDriveQueuedAt;
    if (elapsed < RECENT_PATIENTS_DRIVE_MIN_INTERVAL_MS) {
      pendingRecentPatientsForDrive = normalizedSnapshots;
      if (!recentPatientsDriveTimer) {
        const delay = Math.max(300, RECENT_PATIENTS_DRIVE_MIN_INTERVAL_MS - elapsed);
        recentPatientsDriveTimer = window.setTimeout(() => {
          recentPatientsDriveTimer = null;
          const pending = pendingRecentPatientsForDrive;
          pendingRecentPatientsForDrive = null;
          if (pending) {
            queueDriveRecentPatientsWrite(pending, { force: true });
          }
        }, delay);
      }
      return;
    }
  }

  enqueueDriveOperation({
    type: 'file.put',
    path,
    content,
    contentType: 'application/json',
    checksum,
    expectedRevision: revisions[path] || '',
    dedupeKey: `file:${path}`,
  });
  lastRecentPatientsDriveQueuedAt = now;
  driveQueuedChecksums.set(path, checksum);
}

function queueDriveRuntimeFallbacksWrite(fallbackMap) {
  if (!canQueueDriveWrites()) return;

  const path = DRIVE_MED_RUNTIME_FALLBACKS_PATH;
  const revisions = getDriveRevisions();
  const payload = {
    savedAt: new Date().toISOString(),
    source: 'note-builder-client',
    entries: Object.values(fallbackMap || {}),
  };
  const content = JSON.stringify(payload, null, 2);
  const checksum = hashStringChecksum(content);
  if (driveQueuedChecksums.get(path) === checksum) {
    return;
  }

  enqueueDriveOperation({
    type: 'file.put',
    path,
    content,
    contentType: 'application/json',
    checksum,
    expectedRevision: revisions[path] || '',
    dedupeKey: `file:${path}`,
  });
  driveQueuedChecksums.set(path, checksum);
}

function queueDriveBackupAppend(snapshotEntry) {
  if (!canQueueDriveWrites() || !snapshotEntry) return;

  enqueueDriveOperation({
    type: 'backup.append',
    entry: {
      id: snapshotEntry.id,
      savedAt: snapshotEntry.savedAt,
      label: formatSnapshotLabel(snapshotEntry),
      practice: snapshotEntry.practice,
      visitType: snapshotEntry.visitType,
      draft: snapshotEntry.draft,
    },
    dedupeKey: `backup:${snapshotEntry.id}`,
  });
}

function scheduleDriveQueueFlush(delayMs = 1100) {
  if (!canQueueDriveWrites()) return;

  if (driveQueueTimer) {
    window.clearTimeout(driveQueueTimer);
  }

  driveQueueTimer = window.setTimeout(() => {
    driveQueueTimer = null;
    runWhenIdle(() => flushDriveQueue());
  }, delayMs);
}

function parseJsonOrNull(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function mergeDraftConflictPayload(localContent, remoteContent) {
  const localPayload = parseJsonOrNull(localContent);
  const remotePayload = parseJsonOrNull(remoteContent);
  if (!localPayload || !remotePayload) return null;

  const localDraft = localPayload.draft || localPayload;
  const remoteDraft = remotePayload.draft || remotePayload;

  if (!localDraft || !remoteDraft || !localDraft.inputs || !remoteDraft.inputs) {
    return null;
  }

  const merged = {
    savedAt: new Date().toISOString(),
    draft: {
      state: {
        ...(remoteDraft.state || {}),
        ...(localDraft.state || {}),
      },
      inputs: {
        ...(remoteDraft.inputs || {}),
      },
    },
    mergedAt: new Date().toISOString(),
    mergedBy: 'note-builder-conflict-merge',
  };

  inputIds.forEach((id) => {
    const localValue = Object.prototype.hasOwnProperty.call(localDraft.inputs, id) ? localDraft.inputs[id] : '';
    const remoteValue = Object.prototype.hasOwnProperty.call(remoteDraft.inputs, id) ? remoteDraft.inputs[id] : '';
    merged.draft.inputs[id] = localValue !== '' && localValue != null ? localValue : (remoteValue || '');
  });

  const mergedContent = JSON.stringify(merged, null, 2);
  return {
    content: mergedContent,
    checksum: hashStringChecksum(mergedContent),
  };
}

function mergeRecentPatientsConflictPayload(localContent, remoteContent) {
  const localPayload = parseJsonOrNull(localContent);
  const remotePayload = parseJsonOrNull(remoteContent);
  if (!localPayload && !remotePayload) return null;

  const localSnapshots = localPayload && Array.isArray(localPayload.snapshots) ? localPayload.snapshots : [];
  const remoteSnapshots = remotePayload && Array.isArray(remotePayload.snapshots) ? remotePayload.snapshots : [];
  const mergedSnapshots = mergeSnapshotCollections(localSnapshots, remoteSnapshots);

  const mergedPayload = {
    savedAt: new Date().toISOString(),
    source: 'note-builder-conflict-merge',
    snapshots: mergedSnapshots,
  };

  const mergedContent = JSON.stringify(mergedPayload, null, 2);
  return {
    content: mergedContent,
    checksum: hashStringChecksum(mergedContent),
  };
}

function mergeRuntimeFallbacksConflictPayload(localContent, remoteContent) {
  const localPayload = parseJsonOrNull(localContent);
  const remotePayload = parseJsonOrNull(remoteContent);
  const localEntries = localPayload && Array.isArray(localPayload.entries) ? localPayload.entries : [];
  const remoteEntries = remotePayload && Array.isArray(remotePayload.entries) ? remotePayload.entries : [];

  const merged = {};
  [...remoteEntries, ...localEntries].forEach((entry) => {
    if (!entry || !entry.id) return;
    const existing = merged[entry.id];
    const incomingTs = Date.parse(String(entry.source_last_checked || entry.savedAt || '')) || 0;
    const existingTs = existing ? (Date.parse(String(existing.source_last_checked || existing.savedAt || '')) || 0) : 0;
    if (!existing || incomingTs >= existingTs) {
      merged[entry.id] = entry;
    }
  });

  const payload = {
    savedAt: new Date().toISOString(),
    source: 'note-builder-conflict-merge',
    entries: Object.values(merged),
  };
  const content = JSON.stringify(payload, null, 2);
  return {
    content,
    checksum: hashStringChecksum(content),
  };
}

async function callDriveEndpoint(action, payload = {}) {
  const config = getDriveConfig();
  if (!config.enabled || !config.endpointUrl) {
    throw new Error('Drive sync is disabled.');
  }

  const requestBody = {
    ...payload,
    action,
    sharedDriveId: payload.sharedDriveId || config.sharedDriveId,
    rootFolderName: payload.rootFolderName || config.rootFolderName,
    userEmail: payload.userEmail || config.userEmail,
    serviceToken: payload.serviceToken || config.serviceToken || config.ownerToken,
    ownerEmail: config.ownerEmail,
    ownerToken: config.ownerToken,
    manifestPath: DRIVE_MANIFEST_FILE,
    clientBuildId: APP_BUILD_ID,
    client: {
      app: 'note-builder',
      appBuildId: APP_BUILD_ID,
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      origin: (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '',
    },
  };

  const response = await fetch(config.endpointUrl, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    mode: 'cors',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Drive action ${action} failed (${response.status}).`);
  }

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`Drive action ${action} returned invalid JSON.`);
  }

  if (data && data.ok === false) {
    throw new Error(data.error || `Drive action ${action} failed.`);
  }

  return data || {};
}

async function pullDriveDraft(force = false) {
  if (!isDriveSyncEnabled()) return false;

  const path = ensureScopedDrivePath(getScopedDriveDraftPath(), 'current draft path');
  if (!path) return false;
  const response = await callDriveEndpoint('file.get', { path });
  const file = response.file || response;
  const content = typeof file.content === 'string' ? file.content : '';
  if (!content) return false;

  const payload = parseJsonOrNull(content);
  if (!payload) return false;

  const remoteDraft = payload.draft || payload;
  if (!remoteDraft || typeof remoteDraft !== 'object' || !remoteDraft.inputs) return false;

  const localDraft = getStorageJSON(STORAGE_KEY, null);
  const localSavedAt = localDraft && localDraft.savedAt ? Date.parse(localDraft.savedAt) : 0;
  const remoteSavedAt = payload.savedAt ? Date.parse(payload.savedAt) : 0;

  if (!force && localSavedAt && remoteSavedAt && remoteSavedAt <= localSavedAt) {
    if (file.revision) {
      const revisions = getDriveRevisions();
      revisions[path] = String(file.revision);
      setDriveRevisions(revisions);
    }
    return false;
  }

  applyDraft(remoteDraft);
  syncToggleStates();
  refreshUI(false);
  state.saveUnlocked = hasValidStartTimeForSaveUnlock();
  saveDraft({ skipDrive: true, flush: true, force: true });

  if (file.revision) {
    const revisions = getDriveRevisions();
    revisions[path] = String(file.revision);
    setDriveRevisions(revisions);
  }

  return true;
}

async function pullDriveMedicationCatalog(force = false) {
  if (!isDriveSyncEnabled()) return false;

  const response = await callDriveEndpoint('file.get', { path: DRIVE_MED_COMPILED_PATH });
  const file = response.file || response;
  const content = typeof file.content === 'string' ? file.content : '';
  if (!content) return false;

  const payload = parseJsonOrNull(content);
  if (!payload) return false;

  const applied = applyMedicationCatalogPayload(payload, { force });

  if (file.revision) {
    const revisions = getDriveRevisions();
    revisions[DRIVE_MED_COMPILED_PATH] = String(file.revision);
    setDriveRevisions(revisions);
  }

  return applied;
}

function getEntryTimestamp(entry) {
  if (!entry || typeof entry !== 'object') return 0;
  return Date.parse(String(entry.source_last_checked || entry.savedAt || '')) || 0;
}

function mergeRuntimeFallbackEntries(entries = []) {
  if (!Array.isArray(entries) || !entries.length) return false;

  let changed = false;
  const next = { ...runtimeMedicationFallbacks };

  entries.forEach((entry) => {
    const normalized = normalizeRuntimeFallbackEntry(entry);
    if (!normalized) return;

    const existing = next[normalized.id];
    if (!existing) {
      next[normalized.id] = normalized;
      changed = true;
      return;
    }

    if (getEntryTimestamp(normalized) >= getEntryTimestamp(existing)) {
      const before = JSON.stringify(existing);
      const after = JSON.stringify(normalized);
      if (before !== after) {
        next[normalized.id] = normalized;
        changed = true;
      }
    }
  });

  if (changed) {
    saveRuntimeMedicationFallbackMap(next);
    rebuildMedicationCatalog();
  }

  return changed;
}

async function pullDriveRuntimeFallbacks(force = false) {
  if (!isDriveSyncEnabled()) return false;

  const response = await callDriveEndpoint('file.get', { path: DRIVE_MED_RUNTIME_FALLBACKS_PATH });
  const file = response.file || response;
  const content = typeof file.content === 'string' ? file.content : '';
  if (!content) return false;

  const payload = parseJsonOrNull(content);
  if (!payload || !Array.isArray(payload.entries)) return false;
  const incomingEntries = payload.entries;

  if (!force && !incomingEntries.length) {
    return false;
  }

  const changed = mergeRuntimeFallbackEntries(incomingEntries);
  if (changed) {
    renderMedicationClassFilters();
    renderMedicationRows();
    runMedicationSearch(els.medSearchInput ? els.medSearchInput.value : '');
    renderMedicationDetail();
  }

  if (file.revision) {
    const revisions = getDriveRevisions();
    revisions[DRIVE_MED_RUNTIME_FALLBACKS_PATH] = String(file.revision);
    setDriveRevisions(revisions);
  }

  return changed;
}

async function pullDriveRecentPatients(force = false) {
  if (!isDriveSyncEnabled()) return false;

  const path = ensureScopedDrivePath(getScopedDriveRecentPatientsPath(), 'recent patients path');
  if (!path) return false;
  const response = await callDriveEndpoint('file.get', { path });
  const file = response.file || response;
  const content = typeof file.content === 'string' ? file.content : '';
  if (!content) return false;

  const payload = parseJsonOrNull(content);
  if (!payload || !Array.isArray(payload.snapshots)) return false;

  const remoteSnapshots = mergeSnapshotCollections(payload.snapshots, []);
  const localSnapshots = loadSnapshotsFromStorage();
  const remoteLatest = getLatestSnapshotTimestamp(remoteSnapshots);
  const localLatest = getLatestSnapshotTimestamp(localSnapshots);

  if (!force && remoteLatest && localLatest && remoteLatest <= localLatest) {
    if (file.revision) {
      const revisions = getDriveRevisions();
      revisions[path] = String(file.revision);
      setDriveRevisions(revisions);
    }
    return false;
  }

  const mergedSnapshots = mergeSnapshotCollections(remoteSnapshots, localSnapshots);
  saveSnapshotsToStorage(mergedSnapshots);
  renderBackupHistory();

  if (file.revision) {
    const revisions = getDriveRevisions();
    revisions[path] = String(file.revision);
    setDriveRevisions(revisions);
  }

  return true;
}

async function pullDriveManifestAndDraft(force = false) {
  if (!isDriveSyncEnabled()) return;

  let response = await callDriveEndpoint('manifest.get', { path: DRIVE_MANIFEST_FILE });
  let manifest = response.manifest || null;
  if (!manifest) {
    const config = getDriveConfig();
    try {
      await callDriveEndpoint('bootstrap', {
        sharedDriveId: config.sharedDriveId,
        rootFolderName: config.rootFolderName || DRIVE_SYNC_ENTERPRISE_NAME,
        rootFolderId: state.driveCanonicalRootId || '',
      });
      response = await callDriveEndpoint('manifest.get', { path: DRIVE_MANIFEST_FILE });
      manifest = response.manifest || null;
    } catch (error) {
      // proceed to warning fallback below
    }
  }

  if (!manifest) {
    const reason = 'Drive manifest unavailable. Running in local-only mode until manifest is repaired.';
    setDriveWriteBlock(true, reason, 'manifest_missing');
    const meta = getDriveMeta();
    meta.connection = navigator.onLine ? 'error' : 'offline';
    meta.lastError = reason;
    setDriveMeta(meta);
    updateDriveStatusBadge(meta);
    return;
  }
  const remoteRevision = String(response.revision || (manifest && manifest.revision) || '');
  const remoteChecksum = String(response.checksum || (manifest && manifest.checksum) || '');

  const meta = getDriveMeta();
  const changed = force
    || !meta.manifestRevision
    || (remoteRevision && remoteRevision !== meta.manifestRevision)
    || (remoteChecksum && remoteChecksum !== meta.manifestChecksum);

  if (changed) {
    await Promise.allSettled([
      pullDriveDraft(force),
      pullDriveMedicationCatalog(force),
      pullDriveRecentPatients(force),
      pullDriveRuntimeFallbacks(force),
    ]);
  } else {
    await pullDriveMedicationCatalog(false);
    await pullDriveRecentPatients(false);
    await pullDriveRuntimeFallbacks(false);
  }

  meta.manifestRevision = remoteRevision || meta.manifestRevision;
  meta.manifestChecksum = remoteChecksum || meta.manifestChecksum;
  meta.lastPull = Date.now();
  meta.lastError = '';
  if (meta.connection !== 'syncing') {
    meta.connection = 'online';
  }
  setDriveMeta(meta);
}

async function flushDriveQueue() {
  if (!canQueueDriveWrites()) return;
  if (driveQueueRunning) return;

  driveQueueRunning = true;
  const meta = getDriveMeta();
  meta.connection = 'syncing';
  setDriveMeta(meta);
  updateDriveStatusBadge(meta);

  let queue = getDriveQueue();
  const revisions = getDriveRevisions();

  try {
    while (queue.length) {
      const item = queue[0];

      try {
        if (item.type === 'file.put') {
          const payload = {
            path: item.path,
            content: item.content,
            contentType: item.contentType || 'application/json',
            checksum: item.checksum || hashStringChecksum(item.content || ''),
            expectedRevision: item.expectedRevision || revisions[item.path] || '',
          };

          const response = await callDriveEndpoint('file.put', payload);

          if (response.conflict) {
            let merged = null;
            if (isDraftPath(item.path)) {
              merged = mergeDraftConflictPayload(item.content, response.currentContent || '');
            } else if (isRecentPatientsPath(item.path)) {
              merged = mergeRecentPatientsConflictPayload(item.content, response.currentContent || '');
            } else if (isRuntimeFallbacksPath(item.path)) {
              merged = mergeRuntimeFallbacksConflictPayload(item.content, response.currentContent || '');
            }

            if (!merged) {
              merged = {
                content: item.content,
                checksum: item.checksum || hashStringChecksum(item.content || ''),
              };
            }

            if (!merged) {
              throw new Error('Revision conflict detected and automatic merge failed.');
            }

            queue[0] = {
              ...item,
              content: merged.content,
              checksum: merged.checksum,
              expectedRevision: response.currentRevision || '',
              attempts: (item.attempts || 0) + 1,
            };
            setDriveQueue(queue);
            continue;
          }

          if (response.revision) {
            revisions[item.path] = String(response.revision);
            setDriveRevisions(revisions);
          }

          if (item.path && item.checksum) {
            driveQueuedChecksums.set(item.path, item.checksum);
          }
        } else if (item.type === 'backup.append') {
          await callDriveEndpoint('backup.append', { entry: item.entry });
        }

        queue.shift();
        setDriveQueue(queue);

        const updatedMeta = getDriveMeta();
        updatedMeta.connection = 'online';
        updatedMeta.lastPush = Date.now();
        updatedMeta.lastError = '';
        setDriveMeta(updatedMeta);
        updateDriveStatusBadge(updatedMeta);
      } catch (error) {
        queue[0] = {
          ...item,
          attempts: (item.attempts || 0) + 1,
          lastError: String(error.message || error),
          lastTriedAt: new Date().toISOString(),
        };
        setDriveQueue(queue);

        const updatedMeta = getDriveMeta();
        updatedMeta.connection = navigator.onLine ? 'error' : 'offline';
        updatedMeta.lastError = queue[0].lastError;
        setDriveMeta(updatedMeta);
        updateDriveStatusBadge(updatedMeta);

        const attemptCount = queue[0].attempts || 1;
        const retryMs = Math.min(30000, 1200 * (2 ** Math.min(attemptCount, 5)));
        scheduleDriveQueueFlush(retryMs);
        break;
      }
    }
  } finally {
    driveQueueRunning = false;
  }
}

async function verifyDriveRootPreflight() {
  if (!isDriveSyncEnabled()) return false;

  const config = getDriveConfig();
  const userKey = driveUserKeyFromEmail(config.userEmail);
  if (!userKey) {
    state.driveCanonicalRootId = '';
    setDriveWriteBlock(true, 'Drive preflight failed: drive user email is required for per-user draft isolation.', 'identity_missing');
    updateDriveStatusBadge();
    return false;
  }

  const requiredDriveId = String(config.sharedDriveId || '').trim();
  if (!requiredDriveId) {
    state.driveCanonicalRootId = '';
    setDriveWriteBlock(true, 'Drive preflight failed: sharedDriveId is required for write safety.', 'root_missing');
    updateDriveStatusBadge();
    return false;
  }

  const audit = await callDriveEndpoint('root.audit', {
    sharedDriveId: requiredDriveId,
    rootFolderName: config.rootFolderName || DRIVE_SYNC_ENTERPRISE_NAME,
  });

  const canonical = audit && audit.canonicalRoot ? audit.canonicalRoot : null;
  const canonicalDriveId = canonical ? String(canonical.driveId || '').trim() : '';
  const canonicalName = canonical ? String(canonical.name || '').trim() : '';
  const expectedName = String(config.rootFolderName || DRIVE_SYNC_ENTERPRISE_NAME).trim();

  const rootIsValid = Boolean(
    canonical
    && canonicalDriveId
    && canonicalDriveId === requiredDriveId
    && canonicalName === expectedName,
  );

  if (!rootIsValid) {
    state.driveCanonicalRootId = '';
    const reason = `Drive preflight failed: shared root "${expectedName}" is missing or not bound to shared drive ${requiredDriveId}.`;
    setDriveWriteBlock(true, reason, 'root_missing');
    updateDriveStatusBadge();
    return false;
  }

  state.driveCanonicalRootId = String(canonical.id || '').trim();
  state.drivePreflightStatus = 'ok';
  state.drivePreflightReason = '';
  setDriveWriteBlock(false, '');
  updateDriveStatusBadge();
  return true;
}

async function attemptDriveAutoCleanup() {
  if (!isDriveSyncEnabled()) return;
  if (!canQueueDriveWrites()) return;

  const meta = getDriveAutoCleanupMeta();
  const now = Date.now();
  if (meta.lastAttemptAt && (now - meta.lastAttemptAt) < DRIVE_AUTO_CLEANUP_INTERVAL_MS) {
    return;
  }

  try {
    const result = await callDriveEndpoint('cleanup.apply', {
      batchSize: 80,
      maxItems: 5000,
    });
    const movedCount = Number(result && result.trashedCount) || 0;
    setDriveAutoCleanupMeta({
      lastAttemptAt: now,
      lastMovedCount: movedCount,
      lastError: '',
    });
  } catch (error) {
    setDriveAutoCleanupMeta({
      lastAttemptAt: now,
      lastMovedCount: 0,
      lastError: String(error && error.message ? error.message : error),
    });
  }
}

function setDriveCleanupStatus(message, isError = false) {
  if (!els.driveCleanupStatus) return;
  els.driveCleanupStatus.textContent = String(message || '');
  els.driveCleanupStatus.classList.toggle('drive-cleanup-error', Boolean(isError));
}

function setDriveCleanupButtonState(running, label = '') {
  if (!els.driveCleanupBtn) return;
  els.driveCleanupBtn.disabled = Boolean(running);
  els.driveCleanupBtn.textContent = label || (running ? 'Cleaning My Drive...' : 'Trash My Drive Artifacts');
}

async function runManualDriveCleanup() {
  if (driveCleanupRunning) return;
  if (!isDriveSyncEnabled()) {
    setDriveCleanupStatus('Drive sync is disabled, so cleanup is unavailable.', true);
    return;
  }

  driveCleanupRunning = true;
  setDriveCleanupButtonState(true, 'Scanning My Drive...');
  setDriveCleanupStatus('Scanning for app-generated artifacts to trash...');

  try {
    const preview = await callDriveEndpoint('cleanup.preview', {
      maxItems: 15000,
      sampleSize: 20,
    });
    const previewTotal = Number(preview && preview.candidateCount) || 0;
    if (previewTotal <= 0) {
      setDriveCleanupStatus('No cleanup candidates found in My Drive.');
      return;
    }

    const summaryGroups = preview && preview.summary && Array.isArray(preview.summary.topGroups)
      ? preview.summary.topGroups.slice(0, 5)
      : [];
    const previewSummary = summaryGroups.length
      ? summaryGroups.map((entry) => `${entry.key}=${entry.count}`).join(', ')
      : 'no group summary';
    const proceed = window.confirm(
      `Found ${previewTotal} My Drive cleanup candidates.\n\nTop groups: ${previewSummary}\n\n`
      + 'Cleanup will TRASH these artifacts in batches. Continue?',
    );
    if (!proceed) {
      setDriveCleanupStatus('Cleanup canceled.');
      return;
    }

    let trashedTotal = 0;
    let processedTotal = 0;
    let batchCount = 0;
    let remainingCount = previewTotal;
    let totalErrors = 0;

    for (let batch = 1; batch <= DRIVE_MANUAL_CLEANUP_MAX_ROUNDS * 20; batch += 1) {
      setDriveCleanupButtonState(true, `Trashing artifacts... (${batch})`);
      const applyResult = await callDriveEndpoint('cleanup.apply', {
        maxItems: 15000,
        batchSize: DRIVE_CLEANUP_APPLY_BATCH_SIZE,
      });
      const trashedThisBatch = Number(applyResult && applyResult.trashedCount) || 0;
      const processedThisBatch = Number(applyResult && applyResult.processedCount) || 0;
      remainingCount = Number(applyResult && applyResult.remainingCount) || 0;
      const errorsThisBatch = Array.isArray(applyResult && applyResult.errors) ? applyResult.errors.length : 0;
      batchCount = batch;
      trashedTotal += trashedThisBatch;
      processedTotal += processedThisBatch;
      totalErrors += errorsThisBatch;

      setDriveCleanupStatus(
        `Cleanup batch ${batch}: trashed ${trashedThisBatch}, processed ${processedThisBatch}, remaining ${remainingCount}${errorsThisBatch ? `, errors ${errorsThisBatch}` : ''}.`,
        errorsThisBatch > 0,
      );

      if (remainingCount <= 0 || processedThisBatch <= 0) {
        break;
      }
    }

    setDriveCleanupButtonState(true, 'Verifying cleanup...');
    const finalPreview = await callDriveEndpoint('cleanup.preview', {
      maxItems: 15000,
      sampleSize: 10,
    });
    const finalRemaining = Number(finalPreview && finalPreview.candidateCount) || 0;

    setDriveCleanupStatus(
      `Cleanup complete: trashed ${trashedTotal} item(s) in ${batchCount} batch(es), processed ${processedTotal}. Remaining candidates: ${finalRemaining}.${totalErrors ? ` Errors: ${totalErrors}.` : ''}`,
      totalErrors > 0,
    );

    runWhenIdle(() => runDriveSyncCycle(false));
  } catch (error) {
    const message = String(error && error.message ? error.message : error);
    setDriveCleanupStatus(`Cleanup failed: ${message}`, true);
  } finally {
    driveCleanupRunning = false;
    setDriveCleanupButtonState(false);
  }
}

async function runDriveSyncCycle(force = false) {
  if (!isDriveSyncEnabled()) {
    updateDriveStatusBadge();
    return;
  }

  if (driveSyncRunning) return;
  driveSyncRunning = true;

  const meta = getDriveMeta();
  meta.connection = 'syncing';
  setDriveMeta(meta);
  updateDriveStatusBadge(meta);

  try {
    const health = await callDriveEndpoint('health', {});
    const healthState = applyDriveHealthState(health);
    const backendBuild = String(healthState.backendBuild || '').trim();
    if (backendBuild && backendBuild !== APP_BUILD_ID) {
      const reason = `Client update required (client ${APP_BUILD_ID} vs backend ${backendBuild}).`;
      setDriveWriteBlock(true, reason, 'version_mismatch');
      const mismatchMeta = getDriveMeta();
      mismatchMeta.connection = 'error';
      mismatchMeta.lastError = reason;
      setDriveMeta(mismatchMeta);
      updateDriveStatusBadge(mismatchMeta);
      return;
    }

    if (healthState.userChanged) {
      // Prevent cross-user leakage from stale queued payloads after identity resolves/changes.
      setDriveQueue([]);
      setDriveRevisions({});
      driveQueuedChecksums.clear();
    }

    const preflightStatus = String(healthState.preflightStatus || '').trim();
    if (preflightStatus && preflightStatus !== 'ok') {
      const reason = healthState.preflightReason || `Drive preflight returned ${preflightStatus}.`;
      setDriveWriteBlock(true, reason, preflightStatus);

      const now = Date.now();
      const nextMeta = getDriveMeta();
      const canAutoRepair = (preflightStatus === 'root_missing' || preflightStatus === 'manifest_missing')
        && (!nextMeta.lastRepairAttemptAt || (now - nextMeta.lastRepairAttemptAt) >= DRIVE_AUTO_REPAIR_COOLDOWN_MS);
      if (canAutoRepair) {
        nextMeta.lastRepairAttemptAt = now;
        setDriveMeta(nextMeta);
        await runDriveRepair('auto', { skipResync: true });
      } else {
        nextMeta.connection = navigator.onLine ? 'error' : 'offline';
        nextMeta.lastError = reason;
        setDriveMeta(nextMeta);
      }
      updateDriveStatusBadge();
      return;
    }

    const preflightOk = await verifyDriveRootPreflight();
    if (!preflightOk) {
      throw new Error(state.driveWriteBlockReason || 'Drive root preflight failed.');
    }

    if (!meta.bootstrapCompleted) {
      const config = getDriveConfig();
      await callDriveEndpoint('bootstrap', {
        sharedDriveId: config.sharedDriveId,
        rootFolderName: config.rootFolderName || DRIVE_SYNC_ENTERPRISE_NAME,
        rootFolderId: state.driveCanonicalRootId || '',
      });

      const nextMeta = getDriveMeta();
      nextMeta.bootstrapCompleted = true;
      nextMeta.lastPull = Date.now();
      setDriveMeta(nextMeta);
    }

    const hasPendingWrites = getDriveQueue().length > 0;
    if (force || !hasPendingWrites) {
      await pullDriveManifestAndDraft(force);
    }

    await attemptDriveAutoCleanup();

    await flushDriveQueue();

    if (state.driveWritesBlocked) {
      const blockedMeta = getDriveMeta();
      blockedMeta.connection = navigator.onLine ? 'error' : 'offline';
      blockedMeta.lastError = state.driveWriteBlockReason || blockedMeta.lastError;
      setDriveMeta(blockedMeta);
      updateDriveStatusBadge(blockedMeta);
      return;
    }

    const nextMeta = getDriveMeta();
    nextMeta.connection = 'online';
    nextMeta.lastError = '';
    setDriveMeta(nextMeta);
    updateDriveStatusBadge(nextMeta);
  } catch (error) {
    const nextMeta = getDriveMeta();
    nextMeta.connection = navigator.onLine ? 'error' : 'offline';
    nextMeta.lastError = String(error.message || error);
    setDriveMeta(nextMeta);
    updateDriveStatusBadge(nextMeta);
  } finally {
    driveSyncRunning = false;
  }
}

function startDriveSync() {
  if (!isDriveSyncEnabled()) {
    updateDriveStatusBadge();
    return;
  }

  const config = getDriveConfig();

  if (driveSyncTimer) {
    window.clearInterval(driveSyncTimer);
  }

  runWhenIdle(() => runDriveSyncCycle(true));

  driveSyncTimer = window.setInterval(() => {
    runWhenIdle(() => runDriveSyncCycle(false));
  }, config.syncIntervalMs);

  window.addEventListener('online', () => {
    runWhenIdle(() => runDriveSyncCycle(false));
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      runWhenIdle(() => runDriveSyncCycle(false));
    }
  });
}

function initDriveSync() {
  state.pendingDriveWrites = getDriveQueue().length;
  state.driveResolvedUserEmail = String(getStorageJSON(DRIVE_RESOLVED_USER_EMAIL_KEY, '') || '').trim().toLowerCase();
  updateDriveStatusBadge();
  renderDriveDiagnostics();
  const cleanupMeta = getDriveAutoCleanupMeta();
  if (cleanupMeta.lastError) {
    setDriveCleanupStatus(`Last cleanup error: ${cleanupMeta.lastError}`, true);
  } else if (cleanupMeta.lastAttemptAt) {
    const movedCount = Number(cleanupMeta.lastMovedCount) || 0;
    setDriveCleanupStatus(`Last auto-cleanup trashed ${movedCount} item(s) on ${new Date(cleanupMeta.lastAttemptAt).toLocaleString()}.`);
  } else {
    setDriveCleanupStatus('Manual cleanup is available if My Drive becomes cluttered.');
  }

  if (!isDriveSyncEnabled()) {
    return;
  }

  setDriveWriteBlock(true, 'Drive preflight pending.', 'preflight_pending');
  updateDriveStatusBadge();
  startDriveSync();
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

function updateTopbarState(forceRecalc = false, scrollY = window.scrollY) {
  if (!els.topbar) return;

  const y = Number.isFinite(scrollY) ? scrollY : window.scrollY;
  const range = Math.max(1, CONDENSE_END_Y - CONDENSE_START_Y);
  const progress = clamp((y - CONDENSE_START_Y) / range, 0, 1);
  state.topbarCondenseProgress = progress;
  els.topbar.style.setProperty('--condense-progress', progress.toFixed(3));

  if (forceRecalc) {
    state.topbarCondensed = progress >= CONDENSE_CLASS_ENTER;
  } else if (!state.topbarCondensed && progress >= CONDENSE_CLASS_ENTER) {
    state.topbarCondensed = true;
  } else if (state.topbarCondensed && progress <= CONDENSE_CLASS_EXIT) {
    state.topbarCondensed = false;
  }

  els.topbar.classList.toggle('topbar-condensed', state.topbarCondensed);
}

function scheduleTopbarStateUpdate(forceRecalc = false) {
  if (forceRecalc) {
    updateTopbarState(true, window.scrollY);
    return;
  }

  if (scrollRafScheduled) return;
  scrollRafScheduled = true;

  window.requestAnimationFrame(() => {
    scrollRafScheduled = false;
    updateTopbarState(false, window.scrollY);
  });
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

function toMinutesFromMidnight(canonicalTime) {
  const parsed = parseTimeInputValue(canonicalTime || '', 'AM');
  if (!parsed) return null;

  const hour12 = Number(parsed.hour);
  const minute = Number(parsed.minute);
  if (!Number.isFinite(hour12) || !Number.isFinite(minute)) return null;

  const hour24 = (hour12 % 12) + (parsed.meridiem === 'PM' ? 12 : 0);
  return (hour24 * 60) + minute;
}

function getFaceToFaceElapsedMinutes() {
  const start = toMinutesFromMidnight(getValue('startTime'));
  const end = toMinutesFromMidnight(getValue('endTime'));
  if (start == null || end == null) return null;

  let elapsed = end - start;
  if (elapsed < 0) {
    elapsed += 24 * 60;
  }

  if (elapsed < 0 || elapsed > 12 * 60) {
    return null;
  }

  return elapsed;
}

function getTherapyTierRequirement(tier) {
  return Object.prototype.hasOwnProperty.call(THERAPY_TIER_MINUTES, tier)
    ? THERAPY_TIER_MINUTES[tier]
    : 0;
}

function getTimeControl(id) {
  return timeControlMap.get(id) || null;
}

function normalizeMeridiemToken(value, fallback = 'AM') {
  const token = String(value || '').trim().toLowerCase();
  if (!token) return fallback === 'PM' ? 'PM' : 'AM';
  if (token.startsWith('p')) return 'PM';
  if (token.startsWith('a')) return 'AM';
  return fallback === 'PM' ? 'PM' : 'AM';
}

function setMeridiemControl(control, meridiem) {
  if (!control) return;

  const normalized = normalizeMeridiemToken(meridiem, control.activeMeridiem || 'AM');
  control.activeMeridiem = normalized;

  if (control.meridiemInput) {
    control.meridiemInput.value = normalized.charAt(0);
  }

  if (!control.meridiemButtons || !control.meridiemButtons.length) return;
  control.meridiemButtons.forEach((btn) => {
    const isActive = btn.dataset.meridiem === normalized;
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
    setMeridiemControl(control, 'AM');
    control.hidden.value = '';
    markTimeControlValidity(control, true);
    return;
  }

  control.hourInput.value = parsed.hour.padStart(2, '0');
  control.minuteInput.value = parsed.minute;
  setMeridiemControl(control, parsed.meridiem);
  control.hidden.value = parsed.canonical;
  markTimeControlValidity(control, true);
}

function collectTimeControlParts(control) {
  const hour = control.hourInput.value.replace(/\D/g, '').slice(0, 2);
  const minute = control.minuteInput.value.replace(/\D/g, '').slice(0, 2);
  const meridiemRaw = control.meridiemInput
    ? control.meridiemInput.value
    : control.activeMeridiem;

  return {
    hour,
    minute,
    meridiem: normalizeMeridiemToken(meridiemRaw, control.activeMeridiem || 'AM'),
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

  setMeridiemControl(control, meridiem);
  const canonical = `${hourNumber}:${String(minuteNumber).padStart(2, '0')} ${meridiem}`;
  control.hidden.value = canonical;
  markTimeControlValidity(control, true);

  if (notify) handleFieldMutation(id);
}

function applyParsedTimeToControl(id, parsed, notify = true) {
  const control = getTimeControl(id);
  if (!control || !parsed) return;

  control.hourInput.value = parsed.hour.padStart(2, '0');
  control.minuteInput.value = parsed.minute;
  setMeridiemControl(control, parsed.meridiem);
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
  if (control.meridiemInput) {
    control.meridiemInput.focus();
    control.meridiemInput.select();
  } else {
    control.minuteInput.focus();
    control.minuteInput.select();
  }
  return true;
}

function focusAndSelectInput(input) {
  if (!input || typeof input.focus !== 'function') return;
  input.focus();
  if (typeof input.select === 'function') {
    input.select();
  }
}

function attachTimeControlListeners() {
  TIME_FIELD_IDS.forEach((id) => {
    const root = document.querySelector(`.time-control[data-time-field="${id}"]`);
    const hidden = getEl(id);
    if (!root || !hidden) return;

    const hourInput = root.querySelector('[data-time-part="hour"]');
    const minuteInput = root.querySelector('[data-time-part="minute"]');
    const meridiemInput = root.querySelector('[data-time-part="meridiem"]');
    const meridiemButtons = Array.from(root.querySelectorAll('.time-meridiem-btn'));

    if (!hourInput || !minuteInput) return;

    const control = {
      id,
      root,
      hidden,
      hourInput,
      minuteInput,
      meridiemInput,
      meridiemButtons,
      activeMeridiem: 'AM',
    };

    timeControlMap.set(id, control);
    setMeridiemControl(control, 'AM');

    const handleMeridiemShortcut = (event, options = {}) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return false;
      const key = String(event.key || '').toLowerCase();
      if (key !== 'a' && key !== 'p') return false;

      const { focusMeridiem = true } = options;
      event.preventDefault();
      setMeridiemControl(control, key === 'a' ? 'AM' : 'PM');
      commitTimeControlValue(id, { notify: true });

      if (focusMeridiem && control.meridiemInput) {
        control.meridiemInput.focus();
        control.meridiemInput.select();
      }

      return true;
    };

    const handlePartInput = (part, event) => {
      if (handleMeridiemShortcut(event)) return;

      const digits = event.target.value.replace(/\D/g, '');
      if (part === 'hour') {
        event.target.value = digits.slice(0, 2);
        if (event.target.value.length === 2) {
          focusAndSelectInput(minuteInput);
        }
      } else if (part === 'minute') {
        event.target.value = digits.slice(0, 2);
        if (event.target.value.length === 2) {
          if (control.meridiemInput) {
            focusAndSelectInput(control.meridiemInput);
          } else if (control.meridiemButtons.length) {
            control.meridiemButtons[0].focus();
          }
        }
      } else if (part === 'meridiem' && control.meridiemInput) {
        const picked = normalizeMeridiemToken(event.target.value, control.activeMeridiem || 'AM');
        setMeridiemControl(control, picked);
      }

      commitTimeControlValue(id, { notify: true });
    };

    const handlePartBlur = (part, event) => {
      if (part === 'hour') {
        const digits = event.target.value.replace(/\D/g, '');
        if (!digits) {
          event.target.value = '';
        } else if (digits.length === 1) {
          event.target.value = digits.padStart(2, '0');
        } else {
          event.target.value = digits.slice(0, 2);
        }
      }

      if (part === 'minute') {
        const digits = event.target.value.replace(/\D/g, '');
        if (digits.length === 1) {
          event.target.value = digits.padStart(2, '0');
        } else if (!digits.length) {
          event.target.value = '';
        } else {
          event.target.value = digits.slice(0, 2);
        }
      }

      if (part === 'meridiem' && control.meridiemInput) {
        const picked = normalizeMeridiemToken(control.meridiemInput.value, control.activeMeridiem || 'AM');
        setMeridiemControl(control, picked);
      }

      commitTimeControlValue(id, { validateStrict: true, notify: true });
      saveDraft({ flush: true });
    };

    hourInput.addEventListener('input', (event) => handlePartInput('hour', event));
    minuteInput.addEventListener('input', (event) => handlePartInput('minute', event));
    if (meridiemInput) meridiemInput.addEventListener('input', (event) => handlePartInput('meridiem', event));

    hourInput.addEventListener('focus', () => {
      if (hourInput.value) hourInput.select();
    });
    minuteInput.addEventListener('focus', () => {
      if (minuteInput.value) minuteInput.select();
    });
    if (meridiemInput) {
      meridiemInput.addEventListener('focus', () => {
        if (meridiemInput.value) meridiemInput.select();
      });
    }

    hourInput.addEventListener('blur', (event) => handlePartBlur('hour', event));
    minuteInput.addEventListener('blur', (event) => handlePartBlur('minute', event));
    if (meridiemInput) meridiemInput.addEventListener('blur', (event) => handlePartBlur('meridiem', event));

    hourInput.addEventListener('keydown', (event) => {
      if (handleMeridiemShortcut(event)) return;

      if (event.key === 'ArrowRight' && hourInput.selectionStart === hourInput.value.length) {
        event.preventDefault();
        focusAndSelectInput(minuteInput);
        return;
      }

      if (event.key === ':' || event.key === '.') {
        event.preventDefault();
        focusAndSelectInput(minuteInput);
      }
    });

    minuteInput.addEventListener('keydown', (event) => {
      if (handleMeridiemShortcut(event)) return;

      if (event.key === 'ArrowLeft' && minuteInput.selectionStart === 0) {
        event.preventDefault();
        focusAndSelectInput(hourInput);
        return;
      }

      if (event.key === 'ArrowRight' && minuteInput.selectionStart === minuteInput.value.length && control.meridiemInput) {
        event.preventDefault();
        focusAndSelectInput(control.meridiemInput);
        return;
      }

      if (event.key === 'Backspace' && !minuteInput.value) {
        event.preventDefault();
        hourInput.focus();
        hourInput.setSelectionRange(hourInput.value.length, hourInput.value.length);
      }
    });

    if (meridiemInput) {
      meridiemInput.addEventListener('keydown', (event) => {
        if (handleMeridiemShortcut(event, { focusMeridiem: false })) return;

        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          focusAndSelectInput(minuteInput);
          return;
        }

        if (event.key === 'Backspace' && !meridiemInput.value) {
          event.preventDefault();
          minuteInput.focus();
          minuteInput.setSelectionRange(minuteInput.value.length, minuteInput.value.length);
        }
      });
    }

    [hourInput, minuteInput, meridiemInput].filter(Boolean).forEach((input) => {
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
        setMeridiemControl(control, btn.dataset.meridiem === 'PM' ? 'PM' : 'AM');
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
  const elapsed = getFaceToFaceElapsedMinutes();
  let hasSelectedTier = false;

  document.querySelectorAll('#therapyInterwovenToggle .seg-btn').forEach((btn) => {
    const tier = btn.dataset.therapyTier || '0';
    const requiredMinutes = getTherapyTierRequirement(tier);
    const enabled = requiredMinutes === 0 || (elapsed != null && elapsed >= requiredMinutes);

    btn.disabled = !enabled;
    if (!enabled) {
      btn.title = elapsed == null
        ? `Requires at least ${requiredMinutes} minutes of face-to-face time. Enter start/end times first.`
        : `Requires at least ${requiredMinutes} minutes (current elapsed: ${elapsed} min).`;
    } else {
      btn.title = requiredMinutes > 0
        ? `Eligible with ${requiredMinutes}+ minutes face-to-face time.`
        : 'No interwoven therapy time.';
    }

    if (tier === state.therapyInterwovenTier && enabled) {
      hasSelectedTier = true;
    }
  });

  if (!hasSelectedTier) {
    state.therapyInterwovenTier = '0';
    setValue('therapyInterwoven', '0');
  }

  document.querySelectorAll('#therapyInterwovenToggle .seg-btn').forEach((btn) => {
    const isActive = btn.dataset.therapyTier === state.therapyInterwovenTier;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  if (els.therapyInterwoven) {
    els.therapyInterwoven.value = state.therapyInterwovenTier;
  }

  if (els.therapyInterwovenHint) {
    if (elapsed == null) {
      els.therapyInterwovenHint.textContent = 'Enter face-to-face start and end times to unlock higher therapy tiers.';
    } else {
      els.therapyInterwovenHint.textContent = `Face-to-face elapsed: ${elapsed} minutes.`;
    }
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
    if (followTimeControl.meridiemInput) {
      followTimeControl.meridiemInput.disabled = isPrn;
    }
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
  if (!Array.isArray(parsed)) return [];
  return mergeSnapshotCollections(parsed, []);
}

function saveSnapshotsToStorage(snapshots) {
  const normalized = mergeSnapshotCollections(snapshots, []);
  setStorageJSON(SNAPSHOT_KEY, normalized);
}

function formatSnapshotLabel(entry) {
  if (entry && entry.patientLabel) {
    return entry.patientLabel;
  }

  const age = entry && entry.draft && entry.draft.inputs ? String(entry.draft.inputs.age || '').trim() : '';
  const gender = entry && entry.draft && entry.draft.inputs ? String(entry.draft.inputs.gender || '').trim() : '';
  const ageText = age || '?';
  const genderText = gender ? gender.charAt(0).toUpperCase() : '?';
  return `${ageText} ${genderText}`;
}

function getDraftPatientIdentity(draft) {
  const inputs = draft && draft.inputs ? draft.inputs : {};
  const age = String(inputs.age || '').trim();
  const genderRaw = String(inputs.gender || '').trim();
  const genderInitial = genderRaw ? genderRaw.charAt(0).toUpperCase() : '';

  if (!age && !genderInitial) {
    return {
      key: 'patient-unknown',
      label: 'Unknown patient',
    };
  }

  const safeAge = age || '?';
  const safeGender = genderInitial || '?';
  const ageToken = age ? age.toLowerCase() : 'unknown-age';
  const genderToken = genderInitial ? genderInitial.toLowerCase() : 'unknown-gender';
  const key = `patient-${ageToken}-${genderToken}`
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    key,
    label: `${safeAge} ${safeGender}`,
  };
}

function normalizeSnapshotEntry(entry) {
  if (!entry || !entry.draft) return null;

  const identity = getDraftPatientIdentity(entry.draft);
  const savedAt = entry.savedAt || new Date().toISOString();

  return {
    id: identity.key,
    patientKey: identity.key,
    patientLabel: identity.label,
    savedAt,
    practice: entry.practice || (entry.draft.state ? entry.draft.state.practice : state.practice),
    visitType: entry.visitType || (entry.draft.state ? entry.draft.state.visitType : state.visitType),
    signature: entry.signature || JSON.stringify({ state: entry.draft.state || {}, inputs: entry.draft.inputs || {} }),
    draft: entry.draft,
  };
}

function mergeSnapshotCollections(primaryList, secondaryList) {
  const mergedMap = new Map();

  [...(primaryList || []), ...(secondaryList || [])].forEach((entry) => {
    const normalized = normalizeSnapshotEntry(entry);
    if (!normalized) return;

    const existing = mergedMap.get(normalized.patientKey);
    const normalizedSavedAt = Date.parse(normalized.savedAt) || 0;
    const existingSavedAt = existing ? (Date.parse(existing.savedAt) || 0) : 0;

    if (!existing || normalizedSavedAt >= existingSavedAt) {
      mergedMap.set(normalized.patientKey, normalized);
    }
  });

  return Array.from(mergedMap.values())
    .sort((a, b) => (Date.parse(b.savedAt) || 0) - (Date.parse(a.savedAt) || 0))
    .slice(0, MAX_SNAPSHOTS);
}

function getLatestSnapshotTimestamp(snapshots) {
  return (snapshots || []).reduce((latest, entry) => {
    const timestamp = Date.parse(entry && entry.savedAt ? entry.savedAt : '') || 0;
    return Math.max(latest, timestamp);
  }, 0);
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

function queueSnapshot(draft, options = {}) {
  const { skipDrive = false } = options;

  if (snapshotTimer) {
    window.clearTimeout(snapshotTimer);
  }

  snapshotTimer = window.setTimeout(() => {
    const snapshots = loadSnapshotsFromStorage();
    const signature = JSON.stringify({ state: draft.state, inputs: draft.inputs });
    const identity = getDraftPatientIdentity(draft);
    const existingIndex = snapshots.findIndex((entry) => entry && entry.patientKey === identity.key);
    const existingEntry = existingIndex >= 0 ? snapshots[existingIndex] : null;

    if (existingEntry && existingEntry.signature === signature && existingIndex === 0) {
      return;
    }

    const snapshotEntry = normalizeSnapshotEntry({
      id: identity.key,
      patientKey: identity.key,
      patientLabel: identity.label,
      savedAt: new Date().toISOString(),
      practice: draft.state.practice,
      visitType: draft.state.visitType,
      signature,
      draft,
    });

    const nextSnapshots = snapshots.slice();
    if (existingIndex >= 0) {
      nextSnapshots.splice(existingIndex, 1);
    }
    nextSnapshots.unshift(snapshotEntry);

    const normalizedSnapshots = mergeSnapshotCollections(nextSnapshots, []);
    saveSnapshotsToStorage(normalizedSnapshots);
    renderBackupHistory();

    if (!skipDrive) {
      queueDriveRecentPatientsWrite(normalizedSnapshots);
    }
  }, 1200);
}

function buildDraftPayload() {
  const draft = {
    savedAt: new Date().toISOString(),
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

  return draft;
}

function getDraftContentHash(draft) {
  if (!draft || typeof draft !== 'object') return '';
  const signature = JSON.stringify({ state: draft.state || {}, inputs: draft.inputs || {} });
  return hashStringChecksum(signature);
}

function hasValidStartTimeForSaveUnlock() {
  const startValue = getValue('startTime');
  return Boolean(parseTimeInputValue(startValue, 'AM'));
}

function unlockSaveGateIfReady() {
  if (state.saveUnlocked) return true;
  if (!hasValidStartTimeForSaveUnlock()) return false;
  state.saveUnlocked = true;
  return true;
}

function persistDraftNow(options = {}) {
  const { skipDrive = false, force = false } = options;
  if (!force && !unlockSaveGateIfReady()) {
    return false;
  }

  const draft = buildDraftPayload();
  const contentHash = getDraftContentHash(draft);
  if (!force && contentHash && latestDraftHash && contentHash === latestDraftHash) {
    return false;
  }

  setStorageJSON(STORAGE_KEY, draft);
  queueSnapshot(draft, { skipDrive });

  if (!skipDrive) {
    queueDriveDraftWrite(draft);
  }

  latestDraftHash = contentHash || latestDraftHash;
  return true;
}

function flushDraftPersist(options = {}) {
  const { skipDrive = false, force = false } = options;

  if (draftPersistTimer) {
    window.clearTimeout(draftPersistTimer);
    draftPersistTimer = null;
  }

  pendingDraftPersistSkipDrive = false;
  return persistDraftNow({ skipDrive, force });
}

function scheduleDraftPersist(options = {}) {
  const { skipDrive = false, force = false } = options;
  if (!force && !unlockSaveGateIfReady()) {
    return false;
  }

  pendingDraftPersistSkipDrive = Boolean(skipDrive);

  if (draftPersistTimer) {
    window.clearTimeout(draftPersistTimer);
  }

  draftPersistTimer = window.setTimeout(() => {
    const skipDriveAtFlush = pendingDraftPersistSkipDrive;
    draftPersistTimer = null;
    pendingDraftPersistSkipDrive = false;
    persistDraftNow({ skipDrive: skipDriveAtFlush, force });
  }, DRAFT_PERSIST_IDLE_MS);

  return true;
}

function saveDraft(options = {}) {
  const {
    skipDrive = false,
    flush = false,
    force = false,
  } = options;

  if (flush) {
    return flushDraftPersist({ skipDrive, force });
  }

  return scheduleDraftPersist({ skipDrive, force });
}

function clearDraftPersistRuntime() {
  if (draftPersistTimer) {
    window.clearTimeout(draftPersistTimer);
    draftPersistTimer = null;
  }
  pendingDraftPersistSkipDrive = false;
  latestDraftHash = '';
  state.saveUnlocked = false;
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
  if (button && button.disabled) {
    return;
  }
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

function minutesToCanonicalTime(totalMinutes) {
  const normalized = ((Number(totalMinutes) % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return format12Hour(hours24, minutes);
}

function addMinutesToTimeField(targetId, deltaMinutes) {
  const increment = Number(deltaMinutes);
  if (!Number.isFinite(increment) || increment <= 0) {
    return false;
  }

  const existingMinutes = toMinutesFromMidnight(getValue(targetId));
  const now = new Date();
  const baseMinutes = existingMinutes == null
    ? (now.getHours() * 60) + now.getMinutes()
    : existingMinutes;

  const nextValue = minutesToCanonicalTime(baseMinutes + Math.floor(increment));
  setValue(targetId, nextValue);
  handleFieldMutation(targetId);
  return true;
}

function applyDocEndCustomIncrement() {
  if (!els.docEndPlusMinutes) return;

  const raw = String(els.docEndPlusMinutes.value || '').trim();
  const parsed = Number.parseInt(raw, 10);
  const isValid = Number.isInteger(parsed) && parsed > 0 && parsed <= 180;

  els.docEndPlusMinutes.classList.toggle('now-plus-input-invalid', !isValid && raw !== '');
  if (!isValid) {
    return;
  }

  addMinutesToTimeField('docEnd', parsed);
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
  const hadPersistedDraft = Boolean(localStorage.getItem(STORAGE_KEY));

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
  clearDraftPersistRuntime();
  pendingRecentPatientsForDrive = null;
  if (recentPatientsDriveTimer) {
    window.clearTimeout(recentPatientsDriveTimer);
    recentPatientsDriveTimer = null;
  }

  if (isDriveSyncEnabled() && hadPersistedDraft) {
    const clearedDraft = {
      savedAt: new Date().toISOString(),
      state: {
        practice: state.practice,
        visitType: state.visitType,
        currentModality: '',
        followModality: '',
        scriptVisible: false,
        followupMode: 'scheduled',
        selectedInterval: '',
        therapyInterwovenTier: '0',
      },
      inputs: {},
    };

    inputIds.forEach((id) => {
      clearedDraft.inputs[id] = '';
    });

    queueDriveDraftWrite(clearedDraft);
  }

  refreshUI(false);

  try {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    // ignore
  }

  window.setTimeout(() => {
    focusFirstClinicalInput();
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

  if (id === 'startTime' || id === 'endTime') {
    updateTherapyButtons();
  }

  if (id === 'startTime') {
    unlockSaveGateIfReady();
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
    element.addEventListener('blur', () => {
      saveDraft({ flush: true });
    });
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

function slugifyMedicationToken(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeRuntimeFallbackEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const id = String(entry.id || '').trim();
  const genericName = String(entry.generic_name || '').trim();
  if (!id || !genericName) return null;

  const formulations = Array.isArray(entry.formulations) ? entry.formulations : [];
  const normalizedForms = formulations.length ? formulations : [{
    formulation_id: `${id}-fallback-oral`,
    label: 'Fallback oral',
    route: 'oral',
    dosage_form: 'unknown',
    strength_examples: [],
    common_adult_psych_dosing: {
      start: 'Verify official source.',
      target: 'Verify official source.',
      max: 'Verify official source.',
    },
    titration_notes: ['No source-verified psych dosing summary yet.'],
    formulation_specific_pearls: [],
    formulation_specific_interactions: [],
    formulation_specific_side_effect_notes: [],
    administration_notes: [],
    source_links: [],
    active: true,
  }];

  return {
    id,
    generic_name: genericName,
    brand_names: Array.isArray(entry.brand_names) ? entry.brand_names.filter(Boolean).slice(0, 16) : [],
    aliases: Array.isArray(entry.aliases) ? entry.aliases.filter(Boolean).slice(0, 24) : [],
    psych_class: String(entry.psych_class || 'Unclassified').trim() || 'Unclassified',
    active: entry.active !== false,
    newer_brand: Boolean(entry.newer_brand),
    fda_psych_uses: Array.isArray(entry.fda_psych_uses) ? entry.fda_psych_uses.filter(Boolean).slice(0, 12) : [],
    off_label_psych_uses: Array.isArray(entry.off_label_psych_uses) ? entry.off_label_psych_uses.filter(Boolean).slice(0, 12) : [],
    moa_summary: String(entry.moa_summary || 'No summary available yet.'),
    common_side_effects: Array.isArray(entry.common_side_effects) ? entry.common_side_effects.filter(Boolean).slice(0, 20) : [],
    important_risks: Array.isArray(entry.important_risks) ? entry.important_risks.filter(Boolean).slice(0, 16) : [],
    psych_interactions: Array.isArray(entry.psych_interactions) ? entry.psych_interactions.filter(Boolean).slice(0, 16) : [],
    clinical_pearls: Array.isArray(entry.clinical_pearls) ? entry.clinical_pearls.filter(Boolean).slice(0, 16) : [],
    source_links: Array.isArray(entry.source_links) ? entry.source_links.filter(Boolean).slice(0, 20) : [],
    source_last_checked: String(entry.source_last_checked || new Date().toISOString()),
    editorial_last_reviewed: entry.editorial_last_reviewed || null,
    content_review_status: String(entry.content_review_status || 'source scored'),
    missing_data_flags: Array.isArray(entry.missing_data_flags) ? entry.missing_data_flags.filter(Boolean).slice(0, 20) : [],
    reliability_score: Number.isFinite(Number(entry.reliability_score)) ? Number(entry.reliability_score) : 28,
    reliability_tier: String(entry.reliability_tier || 'low').toLowerCase(),
    reliability_sources: Array.isArray(entry.reliability_sources) ? entry.reliability_sources.filter(Boolean).slice(0, 10) : ['openFDA', 'RxNorm'],
    formulations: normalizedForms,
  };
}

function getRuntimeMedicationFallbackMapFromStorage() {
  const raw = getStorageJSON(MED_RUNTIME_FALLBACKS_KEY, {});
  if (!raw || typeof raw !== 'object') return {};

  const normalized = {};
  Object.values(raw).forEach((entry) => {
    const item = normalizeRuntimeFallbackEntry(entry);
    if (item) normalized[item.id] = item;
  });
  return normalized;
}

function saveRuntimeMedicationFallbackMap(map) {
  const payload = {};
  Object.values(map || {}).forEach((entry) => {
    const normalized = normalizeRuntimeFallbackEntry(entry);
    if (normalized) payload[normalized.id] = normalized;
  });
  runtimeMedicationFallbacks = payload;
  setStorageJSON(MED_RUNTIME_FALLBACKS_KEY, runtimeMedicationFallbacks);
}

function rebuildMedicationCatalog() {
  const merged = medicationCatalogBase.slice();
  const seen = new Set(merged.map((entry) => entry.id));

  Object.values(runtimeMedicationFallbacks).forEach((entry) => {
    if (!entry || !entry.id) return;
    if (seen.has(entry.id)) return;
    merged.push(entry);
    seen.add(entry.id);
  });

  medicationCatalog = merged;
}

function mergeMedicationWithPersistedSupplement(medication, supplemental) {
  if (!medication || !supplemental) return medication;

  const mergedScore = Math.max(
    Number(medication.reliability_score || 0),
    Number(supplemental.reliability_score || 0),
  );

  return {
    ...medication,
    fda_psych_uses: mergeMedicationStringLists(medication.fda_psych_uses, supplemental.fda_psych_uses, 16),
    off_label_psych_uses: mergeMedicationStringLists(medication.off_label_psych_uses, supplemental.off_label_psych_uses, 16),
    moa_summary: mergeMedicationScalarText(medication.moa_summary, supplemental.moa_summary),
    common_side_effects: mergeMedicationStringLists(medication.common_side_effects, supplemental.common_side_effects, 24),
    important_risks: mergeMedicationStringLists(medication.important_risks, supplemental.important_risks, 20),
    psych_interactions: mergeMedicationStringLists(medication.psych_interactions, supplemental.psych_interactions, 20),
    clinical_pearls: mergeMedicationStringLists(medication.clinical_pearls, supplemental.clinical_pearls, 20),
    formulations: mergeSupplementalFormulations(
      listOrEmpty(medication.formulations),
      listOrEmpty(supplemental.formulations),
    ),
    source_links: uniqueTrimmedStrings([...(medication.source_links || []), ...(supplemental.source_links || [])], 24),
    missing_data_flags: uniqueTrimmedStrings([...(medication.missing_data_flags || []), ...(supplemental.missing_data_flags || [])], 20),
    source_last_checked: supplemental.source_last_checked || medication.source_last_checked,
    reliability_score: Math.min(100, Number.isFinite(mergedScore) ? mergedScore : 0),
    reliability_tier: normalizeReliabilityTier(supplemental.reliability_tier) || normalizeReliabilityTier(medication.reliability_tier),
    reliability_sources: uniqueTrimmedStrings([...(medication.reliability_sources || []), ...(supplemental.reliability_sources || [])], 12),
  };
}

function mergeMedicationWithRuntimeOverrides(medication) {
  let merged = medication;
  const persistedSupplement = runtimeMedicationFallbacks[medication.id];
  if (persistedSupplement) {
    merged = mergeMedicationWithPersistedSupplement(merged, persistedSupplement);
  }

  const overrides = getRuntimeOverrides();
  const override = overrides[medication.id];
  if (!override) return merged;

  return {
    ...merged,
    ...override,
    source_links: uniqueTrimmedStrings([...(merged.source_links || []), ...(override.source_links || [])], 24),
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

function uniqueTrimmedStrings(items = [], maxItems = 20) {
  const out = [];
  const seen = new Set();
  listOrEmpty(items).forEach((item) => {
    const value = String(item || '').replace(/\s+/g, ' ').trim();
    if (!value) return;
    const key = value.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(value);
  });
  return out.slice(0, maxItems);
}

function isPediatricMedicationText(value) {
  const token = String(value || '').replace(/\s+/g, ' ').trim();
  if (!token) return false;
  return MEDICATION_PEDIATRIC_TEXT_REGEX.test(token);
}

function filterAdultMedicationLines(items = [], maxItems = 12) {
  const normalized = uniqueTrimmedStrings(items, maxItems * 4);
  const filtered = normalized.filter((item) => !isPediatricMedicationText(item));
  return filtered.slice(0, maxItems);
}

function normalizeAdultDoseValue(value) {
  const token = String(value || '').replace(/\s+/g, ' ').trim();
  if (!token) return '';
  if (isPediatricMedicationText(token)) return 'Adult dosing not available in sources.';
  return token;
}

function normalizeAdultDosing(dosing = {}) {
  return {
    start: normalizeAdultDoseValue(dosing.start) || 'Verify official source.',
    target: normalizeAdultDoseValue(dosing.target) || 'Verify official source.',
    max: normalizeAdultDoseValue(dosing.max) || 'Verify official source.',
  };
}

function hasMeaningfulMedicationList(items = []) {
  return listOrEmpty(items).some((item) => {
    const token = String(item || '').trim();
    return Boolean(token) && !isPlaceholderMedicationText(token);
  });
}

function mergeMedicationStringLists(primary = [], secondary = [], maxItems = 16) {
  const preferred = hasMeaningfulMedicationList(primary)
    ? listOrEmpty(primary)
    : listOrEmpty(secondary);
  const combined = [
    ...preferred,
    ...listOrEmpty(primary),
    ...listOrEmpty(secondary),
  ];
  const unique = filterAdultMedicationLines(combined, maxItems * 2);
  const meaningful = unique.filter((item) => !isPlaceholderMedicationText(item));
  if (meaningful.length) {
    return meaningful.slice(0, maxItems);
  }
  return unique.slice(0, maxItems);
}

function mergeMedicationScalarText(primary, secondary, fallback = 'No summary available yet.') {
  return chooseFirstMeaningful([primary, secondary]) || fallback;
}

function canonicalizeMedicationStem(value) {
  const normalized = normalizeMedicationQueryToken(value);
  if (!normalized) return '';
  const stripped = normalized
    .replace(MEDICATION_TERM_QUALIFIER_REGEX, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped || normalized;
}

function buildMedicationLookupTerms(rawTerm) {
  const normalized = normalizeMedicationQueryToken(rawTerm);
  if (!normalized) return [];

  const stem = canonicalizeMedicationStem(normalized);
  const firstToken = stem.split(' ')[0] || '';
  return uniqueTrimmedStrings([
    normalized,
    stem,
    firstToken,
  ], 4).filter((token) => token.length >= 2);
}

function trimMedicationSnippets(items = [], maxItems = 8) {
  return filterAdultMedicationLines(items, maxItems * 3)
    .map((item) => item.replace(/^\d+(?:\.\d+)*\s+/, '').trim())
    .map((item) => item.length > 320 ? `${item.slice(0, 317)}...` : item)
    .filter(Boolean)
    .slice(0, maxItems);
}

function normalizeReliabilityTier(value) {
  const tier = String(value || '').trim().toLowerCase().replace(/_/g, '-');
  if (tier === 'very-high' || tier === 'high' || tier === 'moderate' || tier === 'low') {
    return tier;
  }
  return '';
}

function getMedicationReliabilityMeta(medication) {
  const status = String((medication && medication.content_review_status) || '').trim().toLowerCase();
  const rawTier = normalizeReliabilityTier(medication && medication.reliability_tier);
  const rawScore = Number(medication && medication.reliability_score);

  let score = Number.isFinite(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : 0;
  let tier = rawTier;

  if (!tier) {
    if (status === 'curated') {
      tier = 'very-high';
      score = Math.max(score, 95);
    } else if (score >= 90) {
      tier = 'very-high';
    } else if (score >= 75) {
      tier = 'high';
    } else if (score >= 60) {
      tier = 'moderate';
    } else {
      tier = 'low';
    }
  }

  const labelMap = {
    'very-high': 'Very High',
    high: 'High',
    moderate: 'Moderate',
    low: 'Low',
  };

  const label = labelMap[tier] || 'Low';
  const isHighReliability = tier === 'very-high' || tier === 'high';

  return {
    label: `${label} reliability`,
    compactLabel: `${label} • ${score}/100`,
    priority: score,
    tone: tier,
    score,
    tier,
    isHighReliability,
  };
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

    if (q.length <= 4 && isSubsequence(q, candidate)) {
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
    const fallbackForm = selectedForm || activeFormulations[0] || null;
    state.selectedFormulationId = fallbackForm ? fallbackForm.formulation_id : '';
    state.selectedRoute = fallbackForm ? (fallbackForm.route || '') : '';
  }

  renderMedicationResults();
  renderMedicationDetail();

  const mergedMedication = mergeMedicationWithRuntimeOverrides(med);
  if (isSparseMedicationEntry(mergedMedication) && !medicationSupplementAttempted.has(med.id)) {
    medicationSupplementAttempted.add(med.id);
    window.setTimeout(() => {
      if (state.selectedMedicationId !== med.id) return;
      if (medicationFallbackFetchRunning) return;
      fetchAndApplySupplementalForSelectedMedication().catch(() => {
        // keep drawer interactive even if supplemental fetch fails
      });
    }, 80);
  }
}

function runMedicationSearch(rawQuery) {
  const query = normalizeMedicationQueryToken(rawQuery);
  const favorites = new Set(getMedicationFavorites());

  if (!medicationCatalog.length) {
    if (!medicationCatalogLoading && !medicationCatalogLoadError) {
      ensureMedicationCatalogReady({ force: false, preferDrive: true }).catch(() => {});
    }
    medicationSearchResults = [];
    medicationFocusedResultIndex = -1;
    renderMedicationResults();
    renderMedicationDetail();
    return;
  }

  const filteredByClass = medicationCatalog.filter((med) => {
    if (med.active === false) return false;
    if (state.medClassFilter !== 'all' && med.psych_class !== state.medClassFilter) return false;
    if (state.medCuratedOnly && !getMedicationReliabilityMeta(med).isHighReliability) return false;
    return true;
  });

  if (!query) {
    const sorted = [...filteredByClass].sort((a, b) => {
      const aFav = favorites.has(a.id) ? 1 : 0;
      const bFav = favorites.has(b.id) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      const aReliability = getMedicationReliabilityMeta(a).priority;
      const bReliability = getMedicationReliabilityMeta(b).priority;
      if (aReliability !== bReliability) return bReliability - aReliability;
      return a.generic_name.localeCompare(b.generic_name);
    });

    medicationSearchResults = sorted.slice(0, 120);
  } else {
    medicationSearchResults = filteredByClass
      .map((med) => ({ med, score: scoreMedication(query, med) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const aReliability = getMedicationReliabilityMeta(a.med).priority;
        const bReliability = getMedicationReliabilityMeta(b.med).priority;
        if (aReliability !== bReliability) return bReliability - aReliability;
        const aFav = favorites.has(a.med.id) ? 1 : 0;
        const bFav = favorites.has(b.med.id) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
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
    const messageEl = els.medEmptyState.querySelector('p');
    if (messageEl) {
      messageEl.textContent = medicationCatalogLoading
        ? 'Loading medication catalog...'
        : medicationCatalogLoadError
        ? 'Medication catalog could not be loaded right now. You can still request a medication below.'
        : state.medCuratedOnly
          ? 'No high-reliability profile found for this search yet. Turn off "High reliability only" to see all source-scored records.'
          : 'No medication found for this search.';
    }
    if (els.medRequestBtn) {
      const label = activeQuery ? `Request "${activeQuery}"` : 'Request this medication';
      els.medRequestBtn.textContent = label;
    }

    if (els.medFetchFallbackBtn) {
      const canFetch = Boolean(activeQuery) && !medicationCatalogLoading;
      els.medFetchFallbackBtn.disabled = !canFetch || medicationFallbackFetchRunning;
      els.medFetchFallbackBtn.textContent = medicationFallbackFetchRunning
        ? 'Fetching fallback...'
        : activeQuery
          ? `Fetch fallback "${activeQuery}"`
          : 'Fetch low-confidence fallback';
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
    const reliabilityMeta = getMedicationReliabilityMeta(med);

    button.innerHTML = `
      <div class="med-result-top">
        <div>
          <div class="med-result-name">${escapeHtml(med.generic_name)}</div>
          <div class="med-result-sub">${escapeHtml(brandPreview || 'No brand aliases listed')}</div>
        </div>
        <span aria-hidden="true">${favoriteFlag}</span>
      </div>
      <div class="med-result-meta">
        <div class="med-result-sub">${escapeHtml(med.psych_class || 'Unclassified')}</div>
        <span class="med-status-chip med-status-chip-${escapeHtml(reliabilityMeta.tone)}">${escapeHtml(reliabilityMeta.compactLabel)}</span>
      </div>
    `;

    button.addEventListener('click', () => {
      setMedicationSelection(med.id);
    });

    els.medResultList.appendChild(button);
  });
}

function listHtml(items, fallback) {
  const safeItems = filterAdultMedicationLines(Array.isArray(items) ? items.filter(Boolean) : [], 20);
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
  const reliabilityMeta = getMedicationReliabilityMeta(medication);
  const dosing = selectedFormulation && selectedFormulation.common_adult_psych_dosing
    ? normalizeAdultDosing(selectedFormulation.common_adult_psych_dosing)
    : null;
  const adultFdaUses = filterAdultMedicationLines(medication.fda_psych_uses, 12);
  const adultOffLabel = filterAdultMedicationLines(medication.off_label_psych_uses, 12);
  const adultSideEffects = filterAdultMedicationLines(medication.common_side_effects, 16);
  const adultInteractions = filterAdultMedicationLines(medication.psych_interactions, 16);

  const lines = [
    `Medication: ${medication.generic_name}${(medication.brand_names || []).length ? ` (${medication.brand_names.join(', ')})` : ''}`,
    'Population: Adult 18+',
    `Class: ${medication.psych_class || 'Unclassified'}`,
    `Reliability: ${reliabilityMeta.compactLabel}`,
    `FDA psych uses: ${adultFdaUses.join('; ') || 'No adult summary available yet'}`,
    `Common off-label psych uses: ${adultOffLabel.join('; ') || 'No adult summary available yet'}`,
  ];

  if (dosing) {
    lines.push(`Dosing start/target/max: ${dosing.start || 'n/a'} / ${dosing.target || 'n/a'} / ${dosing.max || 'n/a'}`);
  } else {
    lines.push('Dosing: Select formulation to view formulation-specific psych dosing.');
  }

  lines.push(`Common side effects: ${adultSideEffects.join('; ') || 'No adult summary available yet'}`);
  lines.push(`Psych interaction guide: ${adultInteractions.join('; ') || 'No adult summary available yet'}`);

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
    if (medicationCatalogLoadError) {
      els.medDetailEmpty.textContent = 'Medication catalog unavailable. Search will resume automatically when sync succeeds.';
    } else {
      els.medDetailEmpty.textContent = 'Select a medication to view details.';
    }
    els.medDetailEmpty.classList.remove('hidden');
    els.medDetailContent.classList.add('hidden');
    els.medDetailContent.innerHTML = '';
    return;
  }

  const { medication, formulations, selectedFormulation, availableRoutes } = context;
  const favorites = new Set(getMedicationFavorites());
  const isFavorite = favorites.has(medication.id);
  const reliabilityMeta = getMedicationReliabilityMeta(medication);
  const sparseProfile = isSparseMedicationEntry(medication);

  const hasMultipleFormulations = formulations.length > 1;
  const shouldPromptForFormulation = hasMultipleFormulations && !selectedFormulation;
  const dosing = selectedFormulation ? normalizeAdultDosing(selectedFormulation.common_adult_psych_dosing || {}) : null;
  const fdaUses = filterAdultMedicationLines(medication.fda_psych_uses, 14);
  const offLabelUses = filterAdultMedicationLines(medication.off_label_psych_uses, 14);

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

  const sideEffects = filterAdultMedicationLines([
    ...(medication.common_side_effects || []),
    ...((selectedFormulation && selectedFormulation.formulation_specific_side_effect_notes) || []),
  ], 18);

  const interactions = filterAdultMedicationLines([
    ...(medication.psych_interactions || []),
    ...((selectedFormulation && selectedFormulation.formulation_specific_interactions) || []),
  ], 18);

  const pearls = filterAdultMedicationLines([
    ...(medication.clinical_pearls || []),
    ...((selectedFormulation && selectedFormulation.formulation_specific_pearls) || []),
  ], 18);

  els.medDetailContent.innerHTML = `
    <article class="med-card-header">
      <div class="med-header-title-row">
        <div>
          <h3 class="med-header-title">${escapeHtml(medication.generic_name)}</h3>
          <p class="med-header-sub">${escapeHtml((medication.brand_names || []).join(', ') || 'No brand aliases listed')}</p>
        </div>
        <div class="med-control-row">
          ${sparseProfile ? `<button type="button" class="med-control-btn" data-action="fetch-supplemental">${medicationFallbackFetchRunning ? 'Refreshing…' : 'Fetch supplemental data'}</button>` : ''}
          <button type="button" class="med-control-btn" data-action="copy-summary">Copy summary</button>
          <button type="button" class="med-control-btn${isFavorite ? ' active' : ''}" data-action="toggle-favorite">${isFavorite ? 'Favorited' : 'Favorite'}</button>
        </div>
      </div>
      <div class="med-badge-row">
        <span class="med-badge med-status-badge med-status-badge-${escapeHtml(reliabilityMeta.tone)}">${escapeHtml(reliabilityMeta.compactLabel)}</span>
        <span class="med-badge">Adult 18+</span>
        <span class="med-badge">${escapeHtml(medication.psych_class || 'Unclassified')}</span>
        ${(medication.formulations || []).slice(0, 8).map((form) => `<span class="med-badge">${escapeHtml(form.label || form.dosage_form || 'Formulation')}</span>`).join('')}
        ${medication.newer_brand ? '<span class="med-badge med-badge-new">Newer brand</span>' : ''}
      </div>
      ${reliabilityMeta.isHighReliability ? '' : '<p class="med-curation-note">This entry has lower confidence source coverage. Validate against official labeling before final decisions.</p>'}
      ${sparseProfile ? '<p class="med-curation-note">Essential fields are sparse for this medication. Use "Fetch supplemental data" to pull free-source dosing and indication snippets.</p>' : ''}
    </article>

    <section class="med-section">
      <h3>FDA-Approved Psychiatric Uses</h3>
      ${listHtml(fdaUses, 'No adult (18+) summary available yet.')}
    </section>

    <section class="med-section">
      <h3>Common Psychiatric Off-Label Uses</h3>
      ${listHtml(offLabelUses, 'No adult (18+) summary available yet.')}
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
      ${listHtml(interactions, 'No adult (18+) interaction summary available yet.')}
    </section>

    <section class="med-section">
      <h3>Most Common Side Effects</h3>
      ${listHtml(sideEffects, 'No adult (18+) side effect summary available yet.')}
      ${listHtml(filterAdultMedicationLines(medication.important_risks, 16), 'No adult (18+) serious risk summary available yet.')}
    </section>

    <section class="med-section">
      <h3>Basic Neurotransmitter / Mechanism Of Action</h3>
      <p>${escapeHtml(medication.moa_summary || 'No summary available yet.')}</p>
    </section>

    <section class="med-section">
      <h3>Clinical Pearls</h3>
      ${listHtml(pearls, 'No adult (18+) pearl summary available yet.')}
    </section>

    <section class="med-section">
      <h3>Source + Freshness</h3>
      <p>Reliability score: ${escapeHtml(String(reliabilityMeta.score))}/100 (${escapeHtml(reliabilityMeta.label)})</p>
      <p>Reliability sources: ${escapeHtml(((medication.reliability_sources || []).join(', ')) || 'None captured yet')}</p>
      <p>Last source sync: ${escapeHtml(medication.source_last_checked || 'Unknown')}</p>
      <p>Editorial review: ${escapeHtml(medication.editorial_last_reviewed || 'Pending review')}</p>
      <p>Review state: ${escapeHtml(medication.content_review_status || 'source scored')}</p>
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

function listOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

function splitSentences(text, maxItems = 6) {
  const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  return cleaned
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

function stripHtmlToText(value) {
  const text = String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
  return text;
}

function chooseFirstMeaningful(items = []) {
  for (let i = 0; i < items.length; i += 1) {
    const token = String(items[i] || '').trim();
    if (!token) continue;
    if (/no summary available yet|pending review|verify official source/i.test(token)) continue;
    return token;
  }
  return '';
}

function parseDoseSummaryFromSnippets(snippets = []) {
  const rawSentences = splitSentences(listOrEmpty(snippets).map((value) => stripHtmlToText(value)).join(' '), 60);
  const adultSentences = filterAdultMedicationLines(rawSentences, 60);
  if (!adultSentences.length) {
    return {
      start: 'Verify official source.',
      target: 'Verify official source.',
      max: 'Verify official source.',
      note: 'No adult (18+) dosing snippet available in public sources.',
    };
  }
  const combined = adultSentences.join(' ');
  if (!combined) {
    return {
      start: 'Verify official source.',
      target: 'Verify official source.',
      max: 'Verify official source.',
      note: '',
    };
  }

  const doseMatches = [...combined.matchAll(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml)\b(?!\s*\/\s*kg)/gi)];
  if (!doseMatches.length) {
    return {
      start: 'Verify official source.',
      target: 'Verify official source.',
      max: 'Verify official source.',
      note: splitSentences(combined, 1)[0] || '',
    };
  }

  const normalized = doseMatches
    .map((match) => ({
      value: Number.parseFloat(match[1]),
      unit: String(match[2] || '').toLowerCase(),
    }))
    .filter((entry) => Number.isFinite(entry.value) && entry.value > 0);

  if (!normalized.length) {
    return {
      start: 'Verify official source.',
      target: 'Verify official source.',
      max: 'Verify official source.',
      note: splitSentences(combined, 1)[0] || '',
    };
  }

  const unitPreference = ['mg', 'mcg', 'g', 'ml'];
  let unit = '';
  for (let i = 0; i < unitPreference.length; i += 1) {
    const candidate = unitPreference[i];
    if (normalized.some((entry) => entry.unit === candidate)) {
      unit = candidate;
      break;
    }
  }
  unit = unit || normalized[0].unit;

  const values = normalized
    .filter((entry) => entry.unit === unit)
    .map((entry) => entry.value)
    .sort((a, b) => a - b);

  const min = values[0];
  const max = values[values.length - 1];
  const maxIsLikelyDaily = /per day|daily|once daily|twice daily|qday|qhs|bid|tid/i.test(combined);
  const start = `${min} ${unit}`;
  const target = min !== max ? `${min}-${max} ${unit}${maxIsLikelyDaily ? '/day' : ''}` : `${min} ${unit}`;
  const maxLabel = `${max} ${unit}${maxIsLikelyDaily ? '/day' : ''}`;

  return {
    start,
    target,
    max: maxLabel,
    note: splitSentences(combined, 1)[0] || '',
  };
}

async function fetchJsonWithTimeout(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    return response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

async function fetchTextWithTimeout(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    return response.text();
  } finally {
    window.clearTimeout(timer);
  }
}

async function fetchBestOpenFdaRecord(terms = []) {
  const lookupTerms = uniqueTrimmedStrings(terms, 4);
  let lastError = '';
  let lastUrl = '';

  for (let i = 0; i < lookupTerms.length; i += 1) {
    const term = lookupTerms[i];
    const searchTerm = encodeURIComponent(
      `openfda.generic_name:"${term}" OR openfda.brand_name:"${term}" OR openfda.substance_name:"${term}"`,
    );
    const sourceUrl = `https://api.fda.gov/drug/label.json?search=${searchTerm}&limit=6`;
    lastUrl = sourceUrl;

    try {
      const payload = await fetchJsonWithTimeout(sourceUrl, 12000);
      const results = listOrEmpty(payload && payload.results);
      if (!results.length) {
        continue;
      }
      const bestRecord = results
        .slice()
        .sort((a, b) => scoreOpenFdaRecord(b) - scoreOpenFdaRecord(a))[0];
      return {
        found: Boolean(bestRecord),
        bestRecord: bestRecord || null,
        sourceUrl,
        usedTerm: term,
        error: '',
      };
    } catch (error) {
      lastError = String(error && error.message ? error.message : error);
    }
  }

  return {
    found: false,
    bestRecord: null,
    sourceUrl: lastUrl,
    usedTerm: lookupTerms[0] || '',
    error: lastError,
  };
}

async function fetchRxNormApproximateMatch(term) {
  const query = String(term || '').trim();
  if (!query) return { found: false, rxcui: '', name: '', sourceUrl: '' };

  const sourceUrl = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=5`;
  const payload = await fetchJsonWithTimeout(sourceUrl, 10000);
  const candidates = listOrEmpty(payload && payload.approximateGroup && payload.approximateGroup.candidate);
  if (!candidates.length) {
    return { found: false, rxcui: '', name: '', sourceUrl };
  }

  const best = candidates
    .slice()
    .sort((a, b) => {
      const rankA = Number(a && a.rank) || 999;
      const rankB = Number(b && b.rank) || 999;
      if (rankA !== rankB) return rankA - rankB;
      const scoreA = Number(a && a.score) || 0;
      const scoreB = Number(b && b.score) || 0;
      return scoreB - scoreA;
    })[0] || null;

  return {
    found: Boolean(best && best.rxcui),
    rxcui: String(best && best.rxcui || '').trim(),
    name: String(best && best.name || '').trim(),
    sourceUrl,
  };
}

async function fetchDailyMedSplCandidates(term, rxcui) {
  const urls = [];
  const safeTerm = String(term || '').trim();
  const safeRxcui = String(rxcui || '').trim();
  if (safeRxcui) {
    urls.push(`https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?rxcui=${encodeURIComponent(safeRxcui)}&pagesize=5&page=1`);
  }
  if (safeTerm) {
    urls.push(`https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=${encodeURIComponent(safeTerm)}&pagesize=5&page=1`);
  }

  for (let i = 0; i < urls.length; i += 1) {
    const sourceUrl = urls[i];
    try {
      const payload = await fetchJsonWithTimeout(sourceUrl, 12000);
      const rows = listOrEmpty(payload && payload.data);
      const setIds = uniqueTrimmedStrings(rows.map((row) => row && row.setid), 5);
      if (setIds.length) {
        return {
          found: true,
          setIds,
          titles: uniqueTrimmedStrings(rows.map((row) => row && row.title), 8),
          sourceUrl,
        };
      }
    } catch (error) {
      // continue fallback lookup strategy
    }
  }

  return {
    found: false,
    setIds: [],
    titles: [],
    sourceUrl: urls[0] || '',
  };
}

function parseDailyMedEvidenceFromXml(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(String(xmlText || ''), 'application/xml');
  const parseError = xmlDoc.getElementsByTagName('parsererror');
  if (parseError && parseError.length) {
    return {
      indications: [],
      dosage: [],
      dosageForms: [],
    };
  }

  const sections = Array.from(xmlDoc.getElementsByTagNameNS('*', 'section'));
  const indications = [];
  const dosage = [];

  sections.forEach((section) => {
    const titleNode = section.getElementsByTagNameNS('*', 'title')[0];
    const heading = stripHtmlToText(titleNode ? titleNode.textContent : '');
    const body = stripHtmlToText(section.textContent || '');
    if (!body) return;

    if (/indications?\s+and\s+usage|indications?/i.test(heading)) {
      indications.push(...splitSentences(body, 6));
    }
    if (/dosage\s+and\s+administration|dosage/i.test(heading)) {
      dosage.push(...splitSentences(body, 6));
    }
  });

  const documentTitle = stripHtmlToText((xmlDoc.getElementsByTagNameNS('*', 'title')[0] || {}).textContent || '');
  const dosageForms = [];
  if (/tablet/i.test(documentTitle)) dosageForms.push('tablet');
  if (/capsule/i.test(documentTitle)) dosageForms.push('capsule');
  if (/solution|suspension|syrup/i.test(documentTitle)) dosageForms.push('oral solution');
  if (/inject|intravenous|intramuscular/i.test(documentTitle)) dosageForms.push('injectable');
  if (/patch|transdermal/i.test(documentTitle)) dosageForms.push('transdermal patch');
  if (/nasal/i.test(documentTitle)) dosageForms.push('nasal spray');

  return {
    indications: trimMedicationSnippets(indications, 8),
    dosage: trimMedicationSnippets(dosage, 8),
    dosageForms: uniqueTrimmedStrings(dosageForms, 6),
  };
}

async function fetchDailyMedEvidence(term, rxcui) {
  const index = await fetchDailyMedSplCandidates(term, rxcui);
  if (!index.found || !index.setIds.length) {
    return {
      found: false,
      indications: [],
      dosage: [],
      dosageForms: [],
      sourceLinks: index.sourceUrl ? [index.sourceUrl] : [],
    };
  }

  const xmlUrls = [];
  const indications = [];
  const dosage = [];
  const dosageForms = [];

  for (let i = 0; i < Math.min(2, index.setIds.length); i += 1) {
    const setId = index.setIds[i];
    const xmlUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${encodeURIComponent(setId)}.xml`;
    xmlUrls.push(xmlUrl);
    try {
      const xmlText = await fetchTextWithTimeout(xmlUrl, 12000);
      const parsed = parseDailyMedEvidenceFromXml(xmlText);
      indications.push(...parsed.indications);
      dosage.push(...parsed.dosage);
      dosageForms.push(...parsed.dosageForms);
    } catch (error) {
      // continue with next SPL record
    }
  }

  return {
    found: Boolean(indications.length || dosage.length || dosageForms.length),
    indications: trimMedicationSnippets(indications, 8),
    dosage: trimMedicationSnippets(dosage, 8),
    dosageForms: uniqueTrimmedStrings(dosageForms, 8),
    sourceLinks: uniqueTrimmedStrings([index.sourceUrl, ...xmlUrls], 8),
  };
}

function scoreOpenFdaRecord(record) {
  if (!record || typeof record !== 'object') return -1;
  return (listOrEmpty(record.dosage_and_administration).length * 4)
    + (listOrEmpty(record.indications_and_usage).length * 3)
    + (listOrEmpty(record.adverse_reactions).length * 2)
    + listOrEmpty(record.drug_interactions).length;
}

async function fetchClinicalTablesRxTerms(term) {
  const query = String(term || '').trim();
  if (!query) return { found: false, doseForms: [], strengthsByDoseForm: new Map(), displayNames: [], sourceUrl: '' };

  const sourceUrl = `https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${encodeURIComponent(query)}&maxList=8&df=DISPLAY_NAME&ef=STRENGTHS_AND_FORMS`;
  const payload = await fetchJsonWithTimeout(sourceUrl, 12000);
  if (!Array.isArray(payload) || payload.length < 2) {
    return { found: false, doseForms: [], strengthsByDoseForm: new Map(), displayNames: [], sourceUrl };
  }

  const displayNames = Array.isArray(payload[1]) ? payload[1].map((item) => String(item || '').trim()).filter(Boolean) : [];
  const extras = payload[2] && typeof payload[2] === 'object' ? payload[2] : {};
  const strengthsRaw = Array.isArray(extras.STRENGTHS_AND_FORMS) ? extras.STRENGTHS_AND_FORMS : [];

  const strengthsByDoseForm = new Map();
  const doseForms = [];

  displayNames.forEach((name, index) => {
    const formToken = name.match(/\(([^)]+)\)/);
    const doseForm = formToken ? String(formToken[1] || '').trim() : '';
    if (doseForm) {
      doseForms.push(doseForm);
    }

    const strengths = Array.isArray(strengthsRaw[index])
      ? strengthsRaw[index].map((item) => String(item || '').trim()).filter(Boolean)
      : [];

    if (doseForm && strengths.length) {
      const key = doseForm.toLowerCase();
      const existing = strengthsByDoseForm.get(key) || [];
      strengthsByDoseForm.set(key, Array.from(new Set([...existing, ...strengths])).slice(0, 10));
    }
  });

  return {
    found: displayNames.length > 0,
    doseForms: Array.from(new Set(doseForms)).slice(0, 8),
    strengthsByDoseForm,
    displayNames,
    sourceUrl,
  };
}

async function fetchMedlinePlusSummaryByRxcui(rxcui) {
  const token = String(rxcui || '').trim();
  if (!token) {
    return { found: false, summary: '', link: '', title: '', sourceUrl: '' };
  }

  const params = new URLSearchParams({
    'mainSearchCriteria.v.cs': '2.16.840.1.113883.6.88',
    'mainSearchCriteria.v.c': token,
    knowledgeResponseType: 'application/json',
    'informationRecipient.languageCode.c': 'en',
  });
  const sourceUrl = `https://connect.medlineplus.gov/service?${params.toString()}`;
  const payload = await fetchJsonWithTimeout(sourceUrl, 12000);
  const entries = listOrEmpty(payload && payload.feed && payload.feed.entry);
  const first = entries[0] || {};
  const summaryRaw = first && first.summary && typeof first.summary === 'object'
    ? first.summary._value
    : first.summary;
  const titleRaw = first && first.title && typeof first.title === 'object'
    ? first.title._value
    : first.title;
  const linkRaw = Array.isArray(first && first.link)
    ? (first.link[0] && first.link[0].href)
    : first && first.link && first.link.href;

  return {
    found: Boolean(first && (summaryRaw || titleRaw)),
    summary: stripHtmlToText(summaryRaw || ''),
    title: String(titleRaw || '').trim(),
    link: String(linkRaw || '').trim(),
    sourceUrl,
  };
}

function buildFallbackFormulations(fallbackId, dosageForms = [], routes = [], options = {}) {
  const dosingDefaults = options && options.dosingDefaults ? options.dosingDefaults : null;
  const strengthsByLabel = options && options.strengthsByLabel instanceof Map
    ? options.strengthsByLabel
    : new Map();
  const safeDosageForms = dosageForms.length ? dosageForms : ['unknown formulation'];
  const safeRoutes = routes.length ? routes : ['oral'];
  const forms = [];

  safeDosageForms.slice(0, 3).forEach((dosageForm, doseIndex) => {
    safeRoutes.slice(0, 3).forEach((route, routeIndex) => {
      forms.push({
        formulation_id: `${fallbackId}-${slugifyMedicationToken(dosageForm)}-${slugifyMedicationToken(route)}-${doseIndex}-${routeIndex}`,
        label: `${String(dosageForm || 'Formulation').trim()} (${String(route || 'oral').trim()})`,
        route: String(route || 'oral').trim() || 'oral',
        dosage_form: String(dosageForm || 'unknown').trim() || 'unknown',
        strength_examples: listOrEmpty(strengthsByLabel.get(String(dosageForm || '').toLowerCase())).slice(0, 8),
        common_adult_psych_dosing: {
          start: chooseFirstMeaningful([dosingDefaults && dosingDefaults.start]) || 'Verify official source.',
          target: chooseFirstMeaningful([dosingDefaults && dosingDefaults.target]) || 'Verify official source.',
          max: chooseFirstMeaningful([dosingDefaults && dosingDefaults.max]) || 'Verify official source.',
        },
        titration_notes: listOrEmpty(dosingDefaults && dosingDefaults.note ? [dosingDefaults.note] : []),
        formulation_specific_pearls: [],
        formulation_specific_interactions: [],
        formulation_specific_side_effect_notes: [],
        administration_notes: listOrEmpty(dosingDefaults && dosingDefaults.note ? [dosingDefaults.note] : []),
        source_links: [],
        active: true,
      });
    });
  });

  return forms.length ? forms : [{
    formulation_id: `${fallbackId}-fallback-oral`,
    label: 'Fallback oral',
    route: 'oral',
    dosage_form: 'unknown',
    strength_examples: [],
    common_adult_psych_dosing: {
      start: chooseFirstMeaningful([dosingDefaults && dosingDefaults.start]) || 'Verify official source.',
      target: chooseFirstMeaningful([dosingDefaults && dosingDefaults.target]) || 'Verify official source.',
      max: chooseFirstMeaningful([dosingDefaults && dosingDefaults.max]) || 'Verify official source.',
    },
    titration_notes: listOrEmpty(dosingDefaults && dosingDefaults.note ? [dosingDefaults.note] : []),
    formulation_specific_pearls: [],
    formulation_specific_interactions: [],
    formulation_specific_side_effect_notes: [],
    administration_notes: listOrEmpty(dosingDefaults && dosingDefaults.note ? [dosingDefaults.note] : []),
    source_links: [],
    active: true,
  }];
}

async function fetchMedicationFallbackRecord(rawTerm) {
  const query = normalizeMedicationQueryToken(rawTerm);
  if (!query) {
    throw new Error('Medication query is required.');
  }

  const cacheKey = canonicalizeMedicationStem(query) || query;
  const cached = medicationFallbackCache.get(cacheKey);
  if (cached && (Date.now() - cached.ts) < MEDICATION_FALLBACK_CACHE_TTL_MS) {
    return cached.record;
  }

  const lookupTerms = buildMedicationLookupTerms(query);
  const openFdaLookup = await fetchBestOpenFdaRecord(lookupTerms);
  const bestOpenFda = openFdaLookup.bestRecord;
  const openfda = bestOpenFda && bestOpenFda.openfda ? bestOpenFda.openfda : {};
  const openFdaError = openFdaLookup.error || '';

  const rxnormSeed = String(
    (Array.isArray(openfda.generic_name) && openfda.generic_name[0])
    || (Array.isArray(openfda.substance_name) && openfda.substance_name[0])
    || lookupTerms[0]
    || query,
  ).trim();

  const rxNormLookupUrl = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(rxnormSeed)}&search=2`;
  const rxNormLookup = await fetchJsonWithTimeout(rxNormLookupUrl, 10000).catch(() => ({}));
  const primaryRxcui = listOrEmpty(rxNormLookup && rxNormLookup.idGroup && rxNormLookup.idGroup.rxnormId)[0] || '';
  const rxNormApprox = await fetchRxNormApproximateMatch(query).catch(() => ({
    found: false,
    rxcui: '',
    name: '',
    sourceUrl: '',
  }));
  const rxcui = String(primaryRxcui || (rxNormApprox && rxNormApprox.rxcui) || '').trim();

  let rxNormPropertiesUrl = '';
  let rxNormProperties = null;
  let medlinePlusData = { found: false, summary: '', link: '', title: '', sourceUrl: '' };

  const [clinicalTablesData, dailyMedData] = await Promise.all([
    fetchClinicalTablesRxTerms(rxnormSeed).catch(() => ({
      found: false,
      doseForms: [],
      strengthsByDoseForm: new Map(),
      displayNames: [],
      sourceUrl: '',
    })),
    fetchDailyMedEvidence(query, rxcui).catch(() => ({
      found: false,
      indications: [],
      dosage: [],
      dosageForms: [],
      sourceLinks: [],
    })),
    (async () => {
      if (!rxcui) return;
      rxNormPropertiesUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${encodeURIComponent(rxcui)}/properties.json`;
      const payload = await fetchJsonWithTimeout(rxNormPropertiesUrl, 10000).catch(() => null);
      rxNormProperties = payload && payload.properties ? payload.properties : null;
      medlinePlusData = await fetchMedlinePlusSummaryByRxcui(rxcui).catch(() => ({
        found: false,
        summary: '',
        link: '',
        title: '',
        sourceUrl: '',
      }));
    })(),
  ]);

  const genericName = String(
    (Array.isArray(openfda.generic_name) && openfda.generic_name[0])
    || (rxNormProperties && rxNormProperties.name)
    || (rxNormApprox && rxNormApprox.name)
    || canonicalizeMedicationStem(query)
    || query,
  ).trim();

  const fallbackId = `fallback-${slugifyMedicationToken(canonicalizeMedicationStem(genericName || query) || genericName || query)}`;
  const brandNames = uniqueTrimmedStrings([
    ...listOrEmpty(openfda.brand_name),
    ...listOrEmpty(openfda.product_ndc),
  ], 16);
  const aliases = uniqueTrimmedStrings([
    ...brandNames,
    ...listOrEmpty(openfda.substance_name).map((value) => String(value || '').trim()),
    ...(clinicalTablesData && clinicalTablesData.displayNames ? clinicalTablesData.displayNames : []),
    String(query),
  ], 24);

  const dosageForms = uniqueTrimmedStrings([
    ...listOrEmpty(openfda.dosage_form).map((value) => String(value || '').trim()),
    ...(clinicalTablesData && clinicalTablesData.doseForms ? clinicalTablesData.doseForms.map((value) => String(value || '').trim()) : []),
    ...(dailyMedData && dailyMedData.dosageForms ? dailyMedData.dosageForms : []),
  ], 8);

  const displayRouteHints = listOrEmpty(clinicalTablesData && clinicalTablesData.displayNames)
    .join(' ')
    .toLowerCase();
  const dailyRouteHints = listOrEmpty(dailyMedData && dailyMedData.dosageForms)
    .join(' ')
    .toLowerCase();

  const routes = listOrEmpty(openfda.route).map((value) => String(value || '').trim()).filter(Boolean);
  if (!routes.length) {
    const routeHints = `${displayRouteHints} ${dailyRouteHints}`;
    if (/oral/.test(routeHints)) routes.push('oral');
    if (/inject|intravenous|intramuscular/.test(routeHints)) routes.push('injectable');
    if (/transdermal|patch/.test(routeHints)) routes.push('transdermal');
    if (/nasal/.test(routeHints)) routes.push('nasal');
  }

  const indications = trimMedicationSnippets(
    splitSentences(listOrEmpty(bestOpenFda && bestOpenFda.indications_and_usage).join(' '), 10),
    8,
  );
  const medlineIndications = trimMedicationSnippets(splitSentences(medlinePlusData.summary, 8), 6);
  const dailyMedIndications = trimMedicationSnippets(dailyMedData && dailyMedData.indications ? dailyMedData.indications : [], 8);
  const effectiveIndications = indications.length
    ? indications
    : (medlineIndications.length ? medlineIndications : dailyMedIndications);

  const reactions = trimMedicationSnippets(splitSentences(listOrEmpty(bestOpenFda && bestOpenFda.adverse_reactions).join(' '), 8), 8);
  const interactions = trimMedicationSnippets(splitSentences(listOrEmpty(bestOpenFda && bestOpenFda.drug_interactions).join(' '), 8), 8);
  const warnings = trimMedicationSnippets(splitSentences([
    ...listOrEmpty(bestOpenFda && bestOpenFda.boxed_warning),
    ...listOrEmpty(bestOpenFda && bestOpenFda.warnings),
  ].join(' '), 8), 8);
  const mechanism = mergeMedicationScalarText(
    splitSentences(listOrEmpty(bestOpenFda && bestOpenFda.mechanism_of_action).join(' '), 2).join(' '),
    medlinePlusData && medlinePlusData.summary ? splitSentences(medlinePlusData.summary, 1)[0] : '',
  );

  const parsedDosing = parseDoseSummaryFromSnippets([
    ...listOrEmpty(bestOpenFda && bestOpenFda.dosage_and_administration),
    ...(dailyMedData && dailyMedData.dosage ? dailyMedData.dosage : []),
  ]);

  const sourceSignals = [];
  if (bestOpenFda) sourceSignals.push('openFDA');
  if (rxNormProperties || rxcui || (rxNormApprox && rxNormApprox.found)) sourceSignals.push('RxNorm');
  if (clinicalTablesData && clinicalTablesData.found) sourceSignals.push('RxTerms');
  if (medlinePlusData && medlinePlusData.found) sourceSignals.push('MedlinePlus');
  if (dailyMedData && dailyMedData.found) sourceSignals.push('DailyMed');

  const reliabilityScore = Math.min(76,
    18
    + (bestOpenFda ? 24 : 0)
    + (clinicalTablesData && clinicalTablesData.found ? 10 : 0)
    + (medlinePlusData && medlinePlusData.found ? 8 : 0)
    + (dailyMedData && dailyMedData.found ? 10 : 0)
    + ((parsedDosing.start || '').toLowerCase().includes('verify') ? 0 : 6));
  const reliabilityTier = reliabilityScore >= 55 ? 'moderate' : 'low';
  const sourceLinks = uniqueTrimmedStrings([
    openFdaLookup.sourceUrl,
    rxNormLookupUrl,
    rxNormApprox && rxNormApprox.sourceUrl,
    rxNormPropertiesUrl,
    clinicalTablesData && clinicalTablesData.sourceUrl,
    medlinePlusData && medlinePlusData.sourceUrl,
    medlinePlusData && medlinePlusData.link,
    ...(dailyMedData && dailyMedData.sourceLinks ? dailyMedData.sourceLinks : []),
  ], 16);

  if (!sourceSignals.length) {
    throw new Error('No source match found for fallback fetch.');
  }

  const normalized = normalizeRuntimeFallbackEntry({
    id: fallbackId,
    generic_name: genericName || query,
    brand_names: brandNames,
    aliases,
    psych_class: 'Unclassified',
    active: true,
    newer_brand: false,
    fda_psych_uses: effectiveIndications,
    off_label_psych_uses: [],
    moa_summary: mechanism,
    common_side_effects: reactions,
    important_risks: warnings,
    psych_interactions: interactions,
    clinical_pearls: trimMedicationSnippets([
      'Runtime supplemental profile from free public sources. Confirm clinically before prescribing.',
      medlinePlusData && medlinePlusData.summary ? medlinePlusData.summary : '',
      ...(dailyMedData && dailyMedData.dosage ? dailyMedData.dosage.slice(0, 1) : []),
    ], 4),
    source_links: sourceLinks,
    source_last_checked: new Date().toISOString(),
    editorial_last_reviewed: null,
    content_review_status: 'source scored',
    missing_data_flags: uniqueTrimmedStrings([
      'curated psych review pending',
      chooseFirstMeaningful([parsedDosing.start]).toLowerCase().includes('verify') ? 'psych dosing verification required' : '',
      effectiveIndications.length ? '' : 'indication summary pending',
      openFdaError ? 'openFDA unavailable during runtime fetch' : '',
    ], 12),
    reliability_score: reliabilityScore,
    reliability_tier: reliabilityTier,
    reliability_sources: sourceSignals,
    formulations: buildFallbackFormulations(fallbackId, dosageForms, routes, {
      dosingDefaults: parsedDosing,
      strengthsByLabel: clinicalTablesData && clinicalTablesData.strengthsByDoseForm
        ? clinicalTablesData.strengthsByDoseForm
        : new Map(),
    }),
  });

  if (!normalized) {
    throw new Error('Unable to normalize fallback profile.');
  }

  medicationFallbackCache.set(cacheKey, { ts: Date.now(), record: normalized });
  return normalized;
}

function isPlaceholderMedicationText(value) {
  return /no summary available yet|pending review|verify official source|see source dosing text|refer to prescribing information|consult prescribing information|information not available|adult dosing not available in sources/i.test(String(value || '').trim());
}

function isSparseMedicationEntry(medication) {
  if (!medication || typeof medication !== 'object') return true;
  const adultIndications = filterAdultMedicationLines(listOrEmpty(medication.fda_psych_uses), 16);
  const hasIndications = adultIndications.some((item) => String(item || '').trim() && !isPlaceholderMedicationText(item));

  const forms = listOrEmpty(medication.formulations);
  const hasMeaningfulForm = forms.some((form) => {
    const dose = normalizeAdultDosing(form && form.common_adult_psych_dosing ? form.common_adult_psych_dosing : {});
    const hasDosing = [dose.start, dose.target, dose.max].some((value) => {
      const token = String(value || '').trim();
      return token && !isPlaceholderMedicationText(token);
    });
    const hasStrength = listOrEmpty(form && form.strength_examples).some((value) => String(value || '').trim());
    return hasDosing || hasStrength;
  });

  return !(hasIndications && hasMeaningfulForm);
}

function mergeSupplementalFormulations(baseForms = [], supplementalForms = []) {
  if (!supplementalForms.length) return baseForms;
  if (!baseForms.length) return supplementalForms;

  return baseForms.map((base) => {
    const match = supplementalForms.find((form) => {
      const baseDoseForm = String(base && base.dosage_form || '').trim().toLowerCase();
      const formDoseForm = String(form && form.dosage_form || '').trim().toLowerCase();
      const baseLabel = String(base && base.label || '').trim().toLowerCase();
      const formLabel = String(form && form.label || '').trim().toLowerCase();
      return (baseDoseForm && formDoseForm && baseDoseForm === formDoseForm)
        || (baseLabel && formLabel && baseLabel === formLabel)
        || (baseDoseForm && formLabel.includes(baseDoseForm))
        || (formDoseForm && baseLabel.includes(formDoseForm));
    }) || supplementalForms[0];

    const baseDose = base && base.common_adult_psych_dosing ? base.common_adult_psych_dosing : {};
    const supDose = match && match.common_adult_psych_dosing ? match.common_adult_psych_dosing : {};

    return {
      ...base,
      strength_examples: listOrEmpty(base && base.strength_examples).length
        ? listOrEmpty(base && base.strength_examples)
        : listOrEmpty(match && match.strength_examples).slice(0, 10),
      common_adult_psych_dosing: {
        start: chooseFirstMeaningful([baseDose.start, supDose.start, 'Verify official source.']) || 'Verify official source.',
        target: chooseFirstMeaningful([baseDose.target, supDose.target, 'Verify official source.']) || 'Verify official source.',
        max: chooseFirstMeaningful([baseDose.max, supDose.max, 'Verify official source.']) || 'Verify official source.',
      },
      titration_notes: listOrEmpty(base && base.titration_notes).length
        ? listOrEmpty(base && base.titration_notes)
        : listOrEmpty(match && match.titration_notes).slice(0, 6),
      administration_notes: listOrEmpty(base && base.administration_notes).length
        ? listOrEmpty(base && base.administration_notes)
        : listOrEmpty(match && match.administration_notes).slice(0, 6),
      source_links: Array.from(new Set([...(base && base.source_links || []), ...(match && match.source_links || [])])).slice(0, 10),
    };
  });
}

function buildPersistedSupplementEntryForMedication(medication, supplemental) {
  if (!medication || !supplemental) return null;

  const mergedScore = Math.max(
    Number(medication.reliability_score || 0),
    Number(supplemental.reliability_score || 0),
    42,
  );
  const mergedTier = mergedScore >= 90
    ? 'very-high'
    : mergedScore >= 75
      ? 'high'
      : mergedScore >= 55
        ? 'moderate'
        : 'low';

  return normalizeRuntimeFallbackEntry({
    id: medication.id,
    generic_name: medication.generic_name,
    brand_names: uniqueTrimmedStrings([...(medication.brand_names || []), ...(supplemental.brand_names || [])], 16),
    aliases: uniqueTrimmedStrings([...(medication.aliases || []), ...(supplemental.aliases || [])], 24),
    psych_class: medication.psych_class || supplemental.psych_class || 'Unclassified',
    active: medication.active !== false,
    newer_brand: Boolean(medication.newer_brand),
    fda_psych_uses: mergeMedicationStringLists(medication.fda_psych_uses, supplemental.fda_psych_uses, 16),
    off_label_psych_uses: mergeMedicationStringLists(medication.off_label_psych_uses, supplemental.off_label_psych_uses, 16),
    moa_summary: mergeMedicationScalarText(medication.moa_summary, supplemental.moa_summary),
    common_side_effects: mergeMedicationStringLists(medication.common_side_effects, supplemental.common_side_effects, 24),
    important_risks: mergeMedicationStringLists(medication.important_risks, supplemental.important_risks, 20),
    psych_interactions: mergeMedicationStringLists(medication.psych_interactions, supplemental.psych_interactions, 20),
    clinical_pearls: mergeMedicationStringLists(medication.clinical_pearls, supplemental.clinical_pearls, 20),
    source_links: uniqueTrimmedStrings([...(medication.source_links || []), ...(supplemental.source_links || [])], 24),
    source_last_checked: new Date().toISOString(),
    editorial_last_reviewed: medication.editorial_last_reviewed || null,
    content_review_status: medication.content_review_status || supplemental.content_review_status || 'source scored',
    missing_data_flags: uniqueTrimmedStrings([...(medication.missing_data_flags || []), ...(supplemental.missing_data_flags || []), 'runtime supplemental source'], 20),
    reliability_score: Math.min(100, mergedScore),
    reliability_tier: mergedTier,
    reliability_sources: uniqueTrimmedStrings([...(medication.reliability_sources || []), ...(supplemental.reliability_sources || [])], 12),
    formulations: mergeSupplementalFormulations(
      listOrEmpty(medication.formulations),
      listOrEmpty(supplemental.formulations),
    ),
  });
}

function applySupplementalProfileToMedication(medication, supplemental) {
  if (!medication || !supplemental) return false;
  const persisted = buildPersistedSupplementEntryForMedication(medication, supplemental);
  if (!persisted) return false;

  // Migrate away from local-only overrides for known meds in favor of shared runtime supplement records.
  const overrides = getRuntimeOverrides();
  if (overrides[medication.id]) {
    delete overrides[medication.id];
    saveRuntimeOverrides(overrides);
  }

  return upsertRuntimeFallbackEntry(persisted, { syncDrive: true });
}

async function fetchAndApplySupplementalForSelectedMedication() {
  const med = getMedicationById(state.selectedMedicationId);
  if (!med || medicationFallbackFetchRunning) return;
  const mergedCurrent = mergeMedicationWithRuntimeOverrides(med);
  if (!isSparseMedicationEntry(mergedCurrent)) return;

  medicationFallbackFetchRunning = true;
  renderMedicationResults();
  renderMedicationDetail();

  try {
    const supplementalQuery = chooseFirstMeaningful([
      canonicalizeMedicationStem(med.generic_name || ''),
      ...listOrEmpty(med.brand_names),
      ...listOrEmpty(med.aliases),
      med.id,
    ]) || med.generic_name || med.id || '';
    const supplemental = await fetchMedicationFallbackRecord(supplementalQuery);
    const applied = applySupplementalProfileToMedication(med, supplemental);
    if (!applied) {
      throw new Error('Unable to apply supplemental medication data.');
    }
    renderMedicationRows();
    runMedicationSearch(els.medSearchInput ? els.medSearchInput.value : '');
    renderMedicationDetail();
  } finally {
    medicationFallbackFetchRunning = false;
    renderMedicationResults();
    renderMedicationDetail();
  }
}

function upsertRuntimeFallbackEntry(entry, options = {}) {
  const { syncDrive = true } = options;
  const normalized = normalizeRuntimeFallbackEntry(entry);
  if (!normalized) return false;

  const next = { ...runtimeMedicationFallbacks, [normalized.id]: normalized };
  saveRuntimeMedicationFallbackMap(next);
  rebuildMedicationCatalog();

  renderMedicationClassFilters();
  renderMedicationRows();
  runMedicationSearch(els.medSearchInput ? els.medSearchInput.value : '');
  setMedicationSelection(normalized.id);

  if (syncDrive) {
    queueDriveRuntimeFallbacksWrite(runtimeMedicationFallbacks);
    scheduleDriveQueueFlush(250);
  }

  return true;
}

async function fetchAndPersistMedicationFallback(rawTerm) {
  if (medicationFallbackFetchRunning) return;
  medicationFallbackFetchRunning = true;
  renderMedicationResults();

  try {
    const fallback = await fetchMedicationFallbackRecord(rawTerm);
    const stored = upsertRuntimeFallbackEntry(fallback, { syncDrive: true });
    if (!stored) {
      throw new Error('Fallback normalization failed.');
    }
  } finally {
    medicationFallbackFetchRunning = false;
    renderMedicationResults();
  }
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

  if (!medicationCatalog.length && !medicationCatalogLoading) {
    ensureMedicationCatalogReady({ force: false, preferDrive: true }).catch(() => {});
  }

  if (medicationCatalogLoadError && !medicationCatalog.length) {
    renderMedicationResults();
    renderMedicationDetail();
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

async function ensureMedicationCatalogReady(options = {}) {
  const { force = false, preferDrive = false } = options;

  if (!force && medicationCatalog.length) {
    return true;
  }

  if (!force && medicationCatalogLoadPromise) {
    return medicationCatalogLoadPromise;
  }

  medicationCatalogLoadPromise = (async () => {
    medicationCatalogLoading = true;
    try {
      let loaded = false;

      if (preferDrive && isDriveSyncEnabled()) {
        try {
          loaded = await pullDriveMedicationCatalog(true);
          await pullDriveRuntimeFallbacks(true);
        } catch (error) {
          loaded = false;
        }
      }

      if (!loaded) {
        loaded = await loadMedicationCatalog();
      }

      return loaded;
    } finally {
      medicationCatalogLoading = false;
      medicationCatalogLoadPromise = null;
      renderMedicationResults();
    }
  })();

  return medicationCatalogLoadPromise;
}

function applyMedicationCatalogPayload(payload, options = {}) {
  const { force = false } = options;
  const medications = Array.isArray(payload) ? payload : payload.medications;

  if (!Array.isArray(medications)) {
    return false;
  }

  const generatedAt = Array.isArray(payload) ? '' : String(payload.generated_at || '');
  if (!force && generatedAt && medicationCatalogGeneratedAt && generatedAt === medicationCatalogGeneratedAt) {
    return false;
  }

  medicationCatalogBase = medications;
  rebuildMedicationCatalog();
  if (generatedAt) {
    medicationCatalogGeneratedAt = generatedAt;
  }
  medicationCatalogLoadError = false;

  renderMedicationClassFilters();
  renderMedicationRows();
  runMedicationSearch(els.medSearchInput ? els.medSearchInput.value : '');
  renderMedicationDetail();
  return true;
}

function handleMedicationLaunch(event) {
  if (event) event.preventDefault();
  setMedicationDrawerOpen(true);
}

async function loadMedicationCatalog() {
  if (typeof fetch !== 'function') {
    medicationCatalogLoadError = true;
    medicationCatalogLoading = false;
    medicationCatalogBase = [];
    rebuildMedicationCatalog();
    renderMedicationClassFilters();
    renderMedicationRows();
    runMedicationSearch('');
    renderMedicationDetail();
    updateMissingRequestCount();
    return false;
  }

  try {
    medicationCatalogLoading = true;
    const response = await fetch(`${MED_CATALOG_URL}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Medication catalog request failed: ${response.status}`);
    }

    const payload = await response.json();
    const applied = applyMedicationCatalogPayload(payload, { force: true });
    if (!applied) {
      throw new Error('Medication catalog format invalid.');
    }
    medicationCatalogLoadError = false;
    medicationCatalogLoading = false;
    updateMissingRequestCount();
    return true;
  } catch (error) {
    if (isDriveSyncEnabled()) {
      try {
        const pulled = await pullDriveMedicationCatalog(true);
        await pullDriveRuntimeFallbacks(true);
        if (pulled || medicationCatalog.length) {
          medicationCatalogLoadError = false;
          medicationCatalogLoading = false;
          updateMissingRequestCount();
          return true;
        }
      } catch (driveError) {
        console.error('Unable to load medication catalog from Drive fallback:', driveError);
      }
    }

    console.error('Unable to load medication catalog:', error);
    medicationCatalogLoadError = true;
    medicationCatalogLoading = false;
    medicationCatalogBase = [];
    rebuildMedicationCatalog();
    renderMedicationClassFilters();
    renderMedicationRows();
    runMedicationSearch('');
    renderMedicationDetail();
    updateMissingRequestCount();
    return false;
  }
}

async function refreshCatalogIfChanged() {
  if (!isDriveSyncEnabled()) return false;

  try {
    const response = await callDriveEndpoint('manifest.get', { path: DRIVE_MANIFEST_FILE });
    const manifest = response.manifest || {};
    const pathMap = manifest.pathMap || {};
    const remote = pathMap[DRIVE_MED_COMPILED_PATH] || {};
    const remoteRevision = String(remote.revision || '');
    const remoteChecksum = String(remote.checksum || '');
    const revisions = getDriveRevisions();
    const localRevision = String(revisions[DRIVE_MED_COMPILED_PATH] || '');
    const localChecksum = String(getStorageJSON(MED_CATALOG_CHECKSUM_KEY, '') || '');
    const changed = (remoteRevision && remoteRevision !== localRevision)
      || (remoteChecksum && remoteChecksum !== localChecksum)
      || !medicationCatalog.length;

    if (!changed) {
      return false;
    }

    const pulled = await pullDriveMedicationCatalog(true);
    if (remoteRevision) {
      revisions[DRIVE_MED_COMPILED_PATH] = remoteRevision;
      setDriveRevisions(revisions);
    }
    if (remoteChecksum) {
      setStorageJSON(MED_CATALOG_CHECKSUM_KEY, remoteChecksum);
    }
    return Boolean(pulled || changed);
  } catch (error) {
    console.error('Medication drift check failed:', error);
    return false;
  }
}

async function queueMedicationRefreshRequest(reason) {
  if (!isDriveSyncEnabled()) return false;

  try {
    await callDriveEndpoint('med.refresh.request', {
      reason: reason || 'catalog-stale',
      details: {
        catalogGeneratedAt: medicationCatalogGeneratedAt || '',
        knownCatalogRevision: String(getDriveRevisions()[DRIVE_MED_COMPILED_PATH] || ''),
        queuePath: DRIVE_MED_REFRESH_QUEUE_PATH,
      },
    });
    return true;
  } catch (error) {
    console.error('Unable to queue medication refresh request:', error);
    return false;
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
      lastWeeklyCheck: 0,
      lastRefreshRequestAt: 0,
    });

    const now = Date.now();
    const weeklyMs = 7 * 24 * 60 * 60 * 1000;
    const monthlyMs = 30 * 24 * 60 * 60 * 1000;
    const shouldWeekly = force || now - (meta.lastWeeklyCheck || 0) >= weeklyMs;

    if (shouldWeekly) {
      await refreshCatalogIfChanged();
      meta.lastWeeklyCheck = now;

      const generatedAtMs = Date.parse(medicationCatalogGeneratedAt || '') || 0;
      const staleByAge = !generatedAtMs || (now - generatedAtMs >= monthlyMs);
      const shouldQueueRequest = staleByAge && (force || now - (meta.lastRefreshRequestAt || 0) >= monthlyMs);

      if (shouldQueueRequest) {
        const queued = await queueMedicationRefreshRequest('catalog-stale-monthly-threshold');
        if (queued) {
          meta.lastRefreshRequestAt = now;
        }
      }
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
  }, 6 * 60 * 60 * 1000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      runWhenIdle(() => runMedicationAutoSyncCycle(false));
    }
  });
}

function attachMedicationListeners() {
  if (els.medDrawerBtn) {
    els.medDrawerBtn.addEventListener('click', handleMedicationLaunch);
  }

  document.querySelectorAll('.med-context-btn[data-med-context-field]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const fieldId = button.dataset.medContextField;
      if (!fieldId) {
        setMedicationDrawerOpen(true);
        return;
      }
      handleMedicationContextOpen(fieldId);
    });
  });

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
    const handleSearchInput = () => runMedicationSearch(els.medSearchInput.value);
    els.medSearchInput.addEventListener('input', handleSearchInput);
    els.medSearchInput.addEventListener('change', handleSearchInput);
    els.medSearchInput.addEventListener('search', handleSearchInput);
    els.medSearchInput.addEventListener('keydown', handleMedicationResultsKeyboard);
  }

  if (els.medCuratedOnly) {
    els.medCuratedOnly.checked = state.medCuratedOnly;
    els.medCuratedOnly.addEventListener('change', () => {
      state.medCuratedOnly = Boolean(els.medCuratedOnly.checked);
      runMedicationSearch(els.medSearchInput ? els.medSearchInput.value : '');
    });
  }

  if (els.medRequestBtn) {
    els.medRequestBtn.addEventListener('click', () => {
      const query = els.medSearchInput ? els.medSearchInput.value : '';
      addMissingMedicationRequest(query, { source: 'drawer-no-result' });
      window.alert('Medication request logged locally. Use "Export Missing Requests JSON" to share with admin review.');
    });
  }

  if (els.medFetchFallbackBtn) {
    els.medFetchFallbackBtn.addEventListener('click', async () => {
      const query = els.medSearchInput ? els.medSearchInput.value : '';
      try {
        await fetchAndPersistMedicationFallback(query);
      } catch (error) {
        console.error('Unable to fetch medication fallback:', error);
        window.alert('Fallback lookup failed for this medication query.');
      }
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
        return;
      }

      if (actionBtn.dataset.action === 'fetch-supplemental') {
        fetchAndApplySupplementalForSelectedMedication().catch((error) => {
          window.alert(`Unable to fetch supplemental medication data: ${String(error && error.message ? error.message : error)}`);
        });
      }
    });
  }

  document.addEventListener('click', (event) => {
    const drawerLaunch = event.target.closest('#medDrawerBtn');
    if (drawerLaunch) {
      handleMedicationLaunch(event);
      return;
    }

    const contextBtn = event.target.closest('.med-context-btn');
    if (!contextBtn) return;

    event.preventDefault();
    const fieldId = contextBtn.dataset.medContextField;
    if (!fieldId) return;
    handleMedicationContextOpen(fieldId);
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
      scheduleTopbarStateUpdate(true);
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

  document.querySelectorAll('.nowPlusBtn[data-plus-minutes]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.closest('[data-now-plus-target]')?.dataset.nowPlusTarget || 'docEnd';
      const minutes = Number.parseInt(btn.dataset.plusMinutes || '', 10);
      addMinutesToTimeField(target, minutes);
    });
  });

  document.querySelectorAll('.nowPlusApplyBtn[data-plus-apply]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.plusApply;
      if (target === 'docEnd') {
        applyDocEndCustomIncrement();
      }
    });
  });

  if (els.docEndPlusMinutes) {
    els.docEndPlusMinutes.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      applyDocEndCustomIncrement();
    });
    els.docEndPlusMinutes.addEventListener('input', () => {
      if (!els.docEndPlusMinutes) return;
      if (!String(els.docEndPlusMinutes.value || '').trim()) {
        els.docEndPlusMinutes.classList.remove('now-plus-input-invalid');
      }
    });
  }

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

  if (els.driveCleanupBtn) {
    els.driveCleanupBtn.addEventListener('click', () => {
      runManualDriveCleanup();
    });
  }

  if (els.driveDiagnosticsBtn) {
    els.driveDiagnosticsBtn.addEventListener('click', () => {
      openDriveDiagnostics();
    });
  }

  if (els.driveSyncStatus) {
    els.driveSyncStatus.setAttribute('role', 'button');
    els.driveSyncStatus.setAttribute('tabindex', '0');
    els.driveSyncStatus.addEventListener('click', () => openDriveDiagnostics());
    els.driveSyncStatus.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openDriveDiagnostics();
    });
  }

  if (els.driveCloseDiagnosticsBtn) {
    els.driveCloseDiagnosticsBtn.addEventListener('click', () => closeDriveDiagnostics());
  }

  if (els.driveDiagnosticsModal) {
    els.driveDiagnosticsModal.addEventListener('click', (event) => {
      if (event.target === els.driveDiagnosticsModal) {
        closeDriveDiagnostics();
      }
    });
  }

  if (els.driveRunRepairBtn) {
    els.driveRunRepairBtn.addEventListener('click', () => {
      runDriveRepair('manual');
    });
  }

  window.addEventListener('scroll', () => scheduleTopbarStateUpdate(false), { passive: true });
  window.addEventListener('resize', () => scheduleTopbarStateUpdate(true));
  window.addEventListener('beforeunload', () => {
    saveDraft({ flush: true });
  });
  window.addEventListener('pagehide', () => {
    saveDraft({ flush: true });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveDraft({ flush: true });
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && els.driveDiagnosticsModal && !els.driveDiagnosticsModal.classList.contains('hidden')) {
      closeDriveDiagnostics();
    }
  });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    const swUrl = `./sw.js?build=${encodeURIComponent(APP_BUILD_ID)}`;
    navigator.serviceWorker.register(swUrl).catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  });
}

function initMedicationReference() {
  runtimeMedicationFallbacks = getRuntimeMedicationFallbackMapFromStorage();
  rebuildMedicationCatalog();
  renderMedicationClassFilters();
  renderMedicationRows();
  updateMissingRequestCount();
  attachMedicationListeners();
  ensureMedicationCatalogReady({ force: true, preferDrive: false }).catch((error) => {
    console.error('Unable to initialize medication catalog:', error);
  });
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
  state.saveUnlocked = hasValidStartTimeForSaveUnlock();

  if (loadedFrom !== 'none') {
    latestDraftHash = getDraftContentHash(buildDraftPayload());
  }

  if (loadedFrom === 'snapshot') {
    saveDraft();
  }

  initMedicationReference();
  initDriveSync();
  registerServiceWorker();
}

init();
