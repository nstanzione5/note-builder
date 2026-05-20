const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = __dirname;
const HTML_PATH = path.join(ROOT, 'index.html');
const APP_PATH = path.join(ROOT, 'app.js');
const LETTER_HTML_PATH = path.join(ROOT, 'letter.html');
const LETTER_JS_PATH = path.join(ROOT, 'letter.js');
const APPS_SCRIPT_PATH = path.join(ROOT, 'scripts/drive/apps-script/Code.gs');

const html = fs.readFileSync(HTML_PATH, 'utf8');
const js = fs.readFileSync(APP_PATH, 'utf8');
const letterHtml = fs.readFileSync(LETTER_HTML_PATH, 'utf8');
const letterJs = fs.readFileSync(LETTER_JS_PATH, 'utf8');
const appsScript = fs.readFileSync(APPS_SCRIPT_PATH, 'utf8');

function inlineApp(sourceHtml) {
  return sourceHtml.replace('<script src="app.js"></script>', `<script>\n${js}\n</script>`);
}

function inlineLetterApp(sourceHtml) {
  return sourceHtml.replace('<script src="letter.js"></script>', `<script>\n${letterJs}\n</script>`);
}

function setField(window, id, value, eventName = 'input') {
  const element = window.document.getElementById(id);
  assert.ok(element, `Missing element #${id}`);
  element.value = value;
  element.dispatchEvent(new window.Event(eventName, { bubbles: true }));
}

async function createAppDom(options = {}) {
  const {
    seedLocalStorage = {},
    htmlTransform,
    mockNow,
  } = options;

  const virtualConsole = new VirtualConsole();
  virtualConsole.on('error', (error) => {
    throw error instanceof Error ? error : new Error(String(error));
  });

  const baseHtml = html
    .replace('data-drive-sync-enabled="true"', 'data-drive-sync-enabled="false"')
    .replace('data-manual-draft-restore="true"', 'data-manual-draft-restore="false"');

  const dom = new JSDOM(inlineApp(htmlTransform ? htmlTransform(baseHtml) : baseHtml), {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'http://localhost:8000/',
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      if (mockNow) {
        const RealDate = window.Date;
        const fixedTime = new RealDate(mockNow).getTime();
        window.Date = class extends RealDate {
          constructor(...args) {
            if (args.length === 0) {
              super(fixedTime);
            } else {
              super(...args);
            }
          }

          static now() {
            return fixedTime;
          }

          static parse(value) {
            return RealDate.parse(value);
          }

          static UTC(...args) {
            return RealDate.UTC(...args);
          }
        };
      }

      window.alert = () => {};
      window.confirm = () => true;
      window.scrollTo = () => {};
      window.fetch = async (url) => {
        if (String(url).includes('config/provider-scripts.json')) {
          return {
            ok: true,
            json: async () => JSON.parse(fs.readFileSync(path.join(ROOT, 'config/provider-scripts.json'), 'utf8')),
          };
        }
        if (String(url).includes('data/meds/compiled/medications.compiled.json')) {
          return {
            ok: true,
            json: async () => JSON.parse(fs.readFileSync(path.join(ROOT, 'data/meds/compiled/medications.compiled.json'), 'utf8')),
          };
        }
        return {
          ok: false,
          status: 404,
          json: async () => ({}),
        };
      };
      window.requestAnimationFrame = (callback) => window.setTimeout(callback, 0);
      window.cancelAnimationFrame = (id) => window.clearTimeout(id);
      window.requestIdleCallback = (callback) => window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 0);
      window.cancelIdleCallback = (id) => window.clearTimeout(id);
      window.navigator.clipboard = {
        writeText: async () => {},
      };
      window.navigator.serviceWorker = {
        register: async () => {},
      };

      Object.entries(seedLocalStorage).forEach(([key, value]) => {
        window.localStorage.setItem(key, value);
      });
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 80));
  return dom;
}

async function createLetterDom(options = {}) {
  const {
    seedLocalStorage = {},
    mockNow,
    driveEnabled = false,
    localConfigFails = false,
    clinicianConfig = {
      version: 1,
      clinicians: [
        {
          id: 'nick-stanzione',
          displayName: 'Nick Stanzione',
          credentials: 'PMHNP',
          title: 'Psychiatric Mental Health Nurse Practitioner',
          states: {
            NY: { license: 'NY-123', address: 'Astra NY Address', signatureBlock: 'Nick Stanzione, PMHNP - NY', signatureAsset: 'nick-ny-signature.png' },
            CT: { license: 'CT-456', address: 'Astra CT Address', signatureBlock: 'Nick Stanzione, PMHNP - CT', signatureAsset: 'nick-ct-signature.png' },
            DE: { license: 'DE-789', address: 'Astra DE Address', signatureBlock: 'Nick Stanzione, PMHNP - DE', signatureAsset: 'nick-de-signature.png' },
          },
        },
      ],
    },
  } = options;

  const virtualConsole = new VirtualConsole();
  virtualConsole.on('error', (error) => {
    throw error instanceof Error ? error : new Error(String(error));
  });

  const baseHtml = driveEnabled
    ? letterHtml
    : letterHtml.replace('data-drive-sync-enabled="true"', 'data-drive-sync-enabled="false"');
  const dom = new JSDOM(inlineLetterApp(baseHtml), {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'http://localhost:8000/letter.html',
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      if (mockNow) {
        const RealDate = window.Date;
        const fixedTime = new RealDate(mockNow).getTime();
        window.Date = class extends RealDate {
          constructor(...args) {
            if (args.length === 0) {
              super(fixedTime);
            } else {
              super(...args);
            }
          }

          static now() {
            return fixedTime;
          }

          static parse(value) {
            return RealDate.parse(value);
          }

          static UTC(...args) {
            return RealDate.UTC(...args);
          }
        };
      }

      window.alert = () => {};
      window.confirm = () => true;
      window.fetch = async (url, fetchOptions = {}) => {
        if (fetchOptions && fetchOptions.method === 'POST') {
          return {
            ok: true,
            json: async () => ({ ok: true, file: { content: JSON.stringify(clinicianConfig) } }),
          };
        }
        if (localConfigFails) {
          return {
            ok: false,
            status: 404,
            json: async () => ({}),
          };
        }
        return {
          ok: true,
          json: async () => clinicianConfig,
        };
      };
      window.navigator.clipboard = {
        writeText: async (text) => {
          window.__copiedText = text;
        },
      };

      Object.entries(seedLocalStorage).forEach(([key, value]) => {
        window.localStorage.setItem(key, value);
      });
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 120));
  return dom;
}

async function testAstraGptRouting() {
  const dom = await createAppDom();
  const { document } = dom.window;

  assert.equal(
    document.getElementById('activeGptUrl').value,
    'https://chatgpt.com/g/g-69f246601ad08191bc5f7522948c06ef-astra-note',
    'Astra follow-up should default to the universal Astra GPT URL',
  );

  document.getElementById('intakeBtn').click();

  assert.equal(
    document.getElementById('activeGptUrl').value,
    'https://chatgpt.com/g/g-69f246601ad08191bc5f7522948c06ef-astra-note',
    'Astra intake should route to the universal Astra GPT URL',
  );
  assert.match(document.getElementById('exportHelper').textContent, /universal Astra GPT/i);

  document.getElementById('followBtn').click();

  assert.equal(
    document.getElementById('activeGptUrl').value,
    'https://chatgpt.com/g/g-69f246601ad08191bc5f7522948c06ef-astra-note',
    'Astra follow-up should route back to the universal Astra GPT URL',
  );
  assert.match(document.getElementById('exportHelper').textContent, /universal Astra GPT/i);

  assert.equal(document.getElementById('practiceToggle'), null, 'Practice toggle should be removed for the single routing path');

  dom.window.close();
}

async function testAstraIntakeExportIncludesScreeningInformation() {
  const dom = await createAppDom();
  const { window } = dom;
  const { document } = window;

  document.getElementById('intakeBtn').click();

  assert.ok(document.querySelector('[data-astra-intake-screening-mode="uploadToGpt"]').classList.contains('active'));
  assert.equal(document.getElementById('astraIntakeScreeningModeGroup').closest('#astraScreeningInfo').id, 'astraScreeningInfo');
  assert.ok(!document.getElementById('astraScreenersFields').classList.contains('hidden'));
  assert.ok(!document.getElementById('astraScreeningInfo').classList.contains('hidden'));
  assert.ok(!document.getElementById('screeningInfoField').classList.contains('hidden'));
  assert.ok(document.getElementById('astraSupportingDocsUploaded').checked);
  assert.ok(document.querySelector('[data-supporting-doc-type="intakeScreener"]').classList.contains('active'));
  assert.equal(document.getElementById('astraScreenersCompletionStatus').textContent, 'Complete');
  assert.match(document.getElementById('exportBox').value, /Uploaded Documents: intake screener packet/);

  document.querySelector('[data-astra-intake-screening-mode="enterManually"]').click();
  assert.ok(!document.getElementById('astraScreenersFields').classList.contains('hidden'));
  assert.ok(!document.getElementById('astraScreeningInfo').classList.contains('hidden'));
  assert.ok(!document.getElementById('screeningInfoField').classList.contains('hidden'));

  setField(window, 'phq9', '14, moderate');
  setField(window, 'screeningInfo', 'Pre-visit forms reported chronic sleep disruption and recent panic symptoms.');
  setField(window, 'notes', 'Discussed mood, anxiety, and treatment goals.');

  const exportText = document.getElementById('exportBox').value;
  assert.match(exportText, /ASTRA RAW GPT INPUT/);
  assert.match(exportText, /PRE-VISIT SCREENERS/);
  assert.match(exportText, /SCREENING DOCUMENTATION/);
  assert.match(exportText, /Pre-visit forms reported chronic sleep disruption and recent panic symptoms\./);
  assert.ok(
    exportText.indexOf('PRE-VISIT SCREENERS') < exportText.indexOf('SCREENING DOCUMENTATION')
      && exportText.indexOf('SCREENING DOCUMENTATION') < exportText.indexOf('CLINICAL NOTES'),
    'Screening documentation should appear between screeners and clinical notes',
  );

  dom.window.close();
}

async function testAstraSupportingDocumentsInstruction() {
  const dom = await createAppDom();
  const { window } = dom;
  const { document } = window;

  assert.equal(document.getElementById('astraSupportingDocsCard'), null);
  assert.ok(!document.getElementById('astraSupportingDocsControl').classList.contains('hidden'));
  assert.ok(!document.getElementById('astraSupportingDocsUploaded').checked);
  assert.ok(
    Boolean(document.getElementById('astraSupportingDocsControl').compareDocumentPosition(document.querySelector('[data-section="export"]')) & window.Node.DOCUMENT_POSITION_FOLLOWING),
    'Supporting docs control should appear immediately before Export',
  );

  document.getElementById('intakeBtn').click();
  document.querySelector('[data-astra-intake-screening-mode="enterManually"]').click();
  assert.ok(document.querySelector('[data-supporting-doc-type="intakeScreener"]'));

  let exportText = document.getElementById('exportBox').value;
  assert.ok(!document.getElementById('astraSupportingDocsUploaded').checked);
  assert.match(exportText, /Uploaded Documents: None selected in app/);
  assert.match(exportText, /UPLOADED SUPPORTING DOCUMENTS\nNone selected in app\./);

  document.querySelector('[data-supporting-doc-type="labs"]').click();
  document.querySelector('[data-supporting-doc-type="genesight"]').click();
  document.querySelector('[data-supporting-doc-type="other"]').click();
  exportText = document.getElementById('exportBox').value;
  assert.match(
    exportText,
    /Uploaded directly to GPT: lab results, GeneSight report, other supporting documentation\. Use uploaded documents as supporting context with the current encounter data\./,
  );
  assert.doesNotMatch(exportText, /intake\/screening documentation/);
  assert.ok(
    exportText.indexOf('SCREENING DOCUMENTATION') < exportText.indexOf('UPLOADED SUPPORTING DOCUMENTS')
      && exportText.indexOf('UPLOADED SUPPORTING DOCUMENTS') < exportText.indexOf('CLINICAL NOTES'),
    'Supporting document instruction should appear before clinical notes',
  );

  dom.window.close();
}

async function testAstraFollowupUploadedPreviousNoteMode() {
  const dom = await createAppDom();
  const { document } = dom.window;

  assert.ok(document.querySelector('[data-astra-followup-context-mode="uploadedPreviousNote"]').classList.contains('active'));
  assert.ok(document.getElementById('previousPlanField').classList.contains('hidden'));
  assert.equal(document.getElementById('previousPlanCompletionStatus').textContent, 'Complete');

  let exportText = document.getElementById('exportBox').value;
  assert.match(
    exportText,
    /PREVIOUS NOTE\nA full copy of the previous note will be uploaded directly to the GPT\. Use it as prior context in addition to the current encounter data below\./,
  );
  assert.doesNotMatch(exportText, /PREVIOUS PLAN/);

  assert.ok(!document.getElementById('astraSupportingDocsUploaded').checked);
  document.getElementById('astraSupportingDocsUploaded').click();
  document.querySelector('[data-supporting-doc-type="labs"]').click();
  document.querySelector('[data-supporting-doc-type="genesight"]').click();
  exportText = document.getElementById('exportBox').value;
  assert.match(exportText, /Uploaded directly to GPT: lab results, GeneSight report\./);
  assert.ok(
    exportText.indexOf('PREVIOUS NOTE') < exportText.indexOf('UPLOADED SUPPORTING DOCUMENTS')
      && exportText.indexOf('UPLOADED SUPPORTING DOCUMENTS') < exportText.indexOf('CLINICAL NOTES'),
    'Astra follow-up supporting document instruction should combine with previous note upload mode',
  );

  document.querySelector('[data-astra-followup-context-mode="previousPlan"]').click();
  assert.ok(!document.getElementById('previousPlanField').classList.contains('hidden'));
  assert.equal(document.getElementById('previousPlanCompletionStatus').textContent, 'Pending');

  dom.window.close();
}

async function testAstraWorkflowTogglesDraftRestore() {
  const firstDom = await createAppDom();
  const firstWindow = firstDom.window;
  const firstDocument = firstWindow.document;

  firstDocument.querySelector('[data-astra-followup-context-mode="uploadedPreviousNote"]').click();
  firstDocument.getElementById('astraSupportingDocsUploaded').click();
  firstDocument.querySelector('[data-supporting-doc-type="other"]').click();
  firstDocument.getElementById('intakeBtn').click();
  firstDocument.querySelector('[data-astra-intake-screening-mode="enterManually"]').click();
  firstWindow.eval(`
    setValue('startTime', '9:00 AM');
    handleFieldMutation('startTime');
    saveDraft({ flush: true });
  `);

  const draftKey = 'noteBuilderDraft_v1:anonymous';
  const storedDraft = firstWindow.localStorage.getItem(draftKey);
  assert.ok(storedDraft, 'Expected a persisted draft to be saved');
  firstDom.window.close();

  const secondDom = await createAppDom({
    seedLocalStorage: {
      [draftKey]: storedDraft,
    },
  });

  const secondDocument = secondDom.window.document;
  assert.ok(secondDocument.getElementById('astraSupportingDocsUploaded').checked);
  assert.ok(secondDocument.querySelector('[data-supporting-doc-type="other"]').classList.contains('active'));
  assert.ok(secondDocument.querySelector('[data-astra-intake-screening-mode="enterManually"]').classList.contains('active'));
  assert.ok(!secondDocument.getElementById('astraScreenersFields').classList.contains('hidden'));

  secondDom.window.close();
}

async function testClosingTimeRowsUseLevelGrid() {
  const dom = await createAppDom();
  const { document } = dom.window;
  const grid = document.querySelector('.closing-time-grid');
  assert.ok(grid, 'Closing time controls should share the level closing-time-grid');
  assert.ok(grid.querySelector('.time-control[data-time-field="endTime"]'));
  assert.ok(grid.querySelector('.time-control[data-time-field="docEnd"]'));
  assert.ok(grid.querySelector('.doc-end-plus-row'), 'Documentation quick-add controls should remain under the doc end row');
  dom.window.close();
}

async function testScheduledStartMeridiemDefaultsFromCurrentTime() {
  const morningDom = await createAppDom({ mockNow: '2026-04-29T09:15:00' });
  assert.ok(
    morningDom.window.document.querySelector('.time-control[data-time-field="scheduledStart"] .time-meridiem-btn[data-meridiem="AM"]').classList.contains('active'),
    'Scheduled Start should default to AM before noon',
  );
  assert.ok(
    morningDom.window.document.querySelector('.time-control[data-time-field="followTime"] .time-meridiem-btn[data-meridiem="AM"]').classList.contains('active'),
    'Other time fields should keep their existing AM default',
  );
  morningDom.window.close();

  const afternoonDom = await createAppDom({ mockNow: '2026-04-29T13:15:00' });
  assert.ok(
    afternoonDom.window.document.querySelector('.time-control[data-time-field="scheduledStart"] .time-meridiem-btn[data-meridiem="PM"]').classList.contains('active'),
    'Scheduled Start should default to PM at or after noon',
  );
  assert.ok(
    afternoonDom.window.document.querySelector('.time-control[data-time-field="followTime"] .time-meridiem-btn[data-meridiem="AM"]').classList.contains('active'),
    'Only Scheduled Start should use the current-time meridiem default',
  );
  afternoonDom.window.close();
}

async function testScheduledStartDraftValueIsNotOverwritten() {
  const storedDraft = JSON.stringify({
    savedAt: new Date().toISOString(),
    state: {
      practice: 'astra',
      visitType: 'followup',
      currentModality: 'Telehealth',
      followModality: 'Telehealth',
      scriptVisible: false,
      followupMode: 'scheduled',
      selectedInterval: '',
      therapyInterwovenTier: '0',
      astraSupportingDocsUploaded: false,
      astraSupportingDocTypes: [],
      astraFollowupContextMode: 'previousPlan',
    },
    inputs: {
      age: '',
      gender: '',
      scheduledStart: '3:30 PM',
      currentModality: 'Telehealth',
      startTime: '',
      cc: '',
      previousPlan: '',
      phq9: '',
      gad7: '',
      asrsA: '',
      asrsB: '',
      pcl5: '',
      mdq: '',
      otherScreener: '',
      screeningInfo: '',
      notes: '',
      followModality: 'Telehealth',
      followDate: '',
      followTime: '',
      therapyInterwoven: '0',
      endTime: '',
      docEnd: '',
    },
  });

  const dom = await createAppDom({
    mockNow: '2026-04-29T09:15:00',
    seedLocalStorage: {
      'noteBuilderDraft_v1:anonymous': storedDraft,
    },
  });

  assert.equal(dom.window.document.getElementById('scheduledStart').value, '3:30 PM');
  assert.ok(
    dom.window.document.querySelector('.time-control[data-time-field="scheduledStart"] .time-meridiem-btn[data-meridiem="PM"]').classList.contains('active'),
    'Restored Scheduled Start meridiem should not be overwritten by morning default',
  );

  dom.window.close();
}

async function testScreeningInformationDraftRestore() {
  const firstDom = await createAppDom();
  const firstWindow = firstDom.window;
  const firstDocument = firstWindow.document;

  firstDocument.getElementById('intakeBtn').click();
  firstDocument.querySelector('[data-astra-intake-screening-mode="enterManually"]').click();
  setField(firstWindow, 'screeningInfo', 'Outside records note longstanding concentration problems and family anxiety history.');
  firstWindow.eval(`
    setValue('startTime', '9:00 AM');
    handleFieldMutation('startTime');
    saveDraft({ flush: true });
  `);

  const draftKey = 'noteBuilderDraft_v1:anonymous';
  const storedDraft = firstWindow.localStorage.getItem(draftKey);
  assert.ok(storedDraft, 'Expected a persisted draft to be saved');
  firstDom.window.close();

  const secondDom = await createAppDom({
    seedLocalStorage: {
      [draftKey]: storedDraft,
    },
  });

  assert.equal(
    secondDom.window.document.getElementById('screeningInfo').value,
    'Outside records note longstanding concentration problems and family anxiety history.',
    'Screening information should restore from saved draft state',
  );

  secondDom.window.close();
}

async function testTelehealthDefaultsRespectBlankAndManualState() {
  const blankDom = await createAppDom();
  const blankDocument = blankDom.window.document;

  assert.equal(blankDocument.getElementById('currentModality').value, 'Telehealth');
  assert.equal(blankDocument.getElementById('followModality').value, 'Telehealth');
  assert.ok(blankDocument.querySelector('#currentModalityToggle .seg-btn.active[data-current-modality="Telehealth"]'));
  assert.ok(blankDocument.querySelector('#followModalityToggle .seg-btn.active[data-follow-modality="Telehealth"]'));
  blankDom.window.close();

  const storedDraft = JSON.stringify({
    savedAt: new Date().toISOString(),
    state: {
      practice: 'astra',
      visitType: 'followup',
      currentModality: 'In-person',
      followModality: 'In-person',
      scriptVisible: false,
      followupMode: 'scheduled',
      selectedInterval: '',
      therapyInterwovenTier: '0',
      astraSupportingDocsUploaded: false,
      astraSupportingDocTypes: [],
      astraFollowupContextMode: 'previousPlan',
    },
    inputs: {
      age: '',
      gender: '',
      scheduledStart: '',
      currentModality: 'In-person',
      startTime: '',
      cc: '',
      previousPlan: '',
      phq9: '',
      gad7: '',
      asrsA: '',
      asrsB: '',
      pcl5: '',
      mdq: '',
      otherScreener: '',
      screeningInfo: '',
      notes: '',
      followModality: 'In-person',
      followDate: '',
      followTime: '',
      therapyInterwoven: '0',
      endTime: '',
      docEnd: '',
    },
  });

  const manualDom = await createAppDom({
    seedLocalStorage: {
      'noteBuilderDraft_v1:anonymous': storedDraft,
    },
  });

  const manualDocument = manualDom.window.document;
  assert.equal(manualDocument.getElementById('currentModality').value, 'In-person');
  assert.equal(manualDocument.getElementById('followModality').value, 'In-person');
  assert.ok(manualDocument.querySelector('#currentModalityToggle .seg-btn.active[data-current-modality="In-person"]'));
  assert.ok(manualDocument.querySelector('#followModalityToggle .seg-btn.active[data-follow-modality="In-person"]'));

  manualDom.window.close();
}

async function testMedicationDrawerKeyboardKeepsSearchEditable() {
  const dom = await createAppDom();
  const { window } = dom;
  const { document } = window;

  window.eval(`
    applyMedicationCatalogPayload({
      medications: [
        {
          id: 'sertraline',
          generic_name: 'Sertraline',
          brand_names: ['Zoloft'],
          aliases: [],
          psych_class: 'SSRI',
          active: true,
          reliability_score: 95,
          reliability_tier: 'high',
          reliability_sources: ['test'],
          formulations: []
        },
        {
          id: 'quetiapine',
          generic_name: 'Quetiapine',
          brand_names: ['Seroquel'],
          aliases: [],
          psych_class: 'Atypical antipsychotic',
          active: true,
          reliability_score: 92,
          reliability_tier: 'high',
          reliability_sources: ['test'],
          formulations: []
        }
      ]
    }, { force: true });
  `);

  assert.ok(!document.getElementById('medDrawerBtn').classList.contains('active'));
  assert.equal(document.getElementById('medDrawerBtn').getAttribute('aria-pressed'), 'false');
  document.getElementById('medDrawerBtn').click();
  assert.ok(document.getElementById('medDrawerBtn').classList.contains('active'));
  assert.equal(document.getElementById('medDrawerBtn').getAttribute('aria-pressed'), 'true');
  const searchInput = document.getElementById('medSearchInput');
  searchInput.focus();
  searchInput.value = 'ser';
  searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));

  searchInput.dispatchEvent(new window.KeyboardEvent('keydown', {
    key: 'ArrowDown',
    bubbles: true,
  }));

  assert.equal(document.activeElement, searchInput, 'Arrow navigation should not move focus off the search input');
  assert.ok(document.querySelector('.med-result-item.is-focused'), 'Arrow navigation should visibly highlight a result');

  searchInput.value = `${searchInput.value}a`;
  searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(searchInput.value, 'sera', 'The search box should remain editable after keyboard navigation');

  searchInput.dispatchEvent(new window.KeyboardEvent('keydown', {
    key: 'Enter',
    bubbles: true,
  }));

  assert.ok(
    document.querySelector('.med-result-item.is-selected') || /Sertraline|Quetiapine/.test(document.getElementById('medDetailContent').textContent),
    'Enter should still select the highlighted medication result',
  );

  dom.window.close();
}

async function testPatientLettersPacketBuilderAndPersistence() {
  const navDom = await createAppDom();
  const navDocument = navDom.window.document;
  assert.equal(navDocument.getElementById('patientLettersWorkspace'), null);
  assert.equal(navDocument.getElementById('patientLettersBtn').getAttribute('href'), 'letter.html');
  navDom.window.close();

  const firstDom = await createLetterDom({ mockNow: '2026-05-10T10:00:00', driveEnabled: true });
  const { window } = firstDom;
  const { document } = window;

  assert.equal(document.querySelector('.letter-preview-card'), null);
  assert.equal(document.getElementById('buildLetterPacketBtn'), null);
  assert.equal(document.getElementById('letterAttachmentManifest'), null);
  assert.equal(document.getElementById('letterIncludeSymptoms'), null);
  assert.ok(document.getElementById('letterExportBox').classList.contains('hidden'));
  assert.match(document.getElementById('clinicianConfigStatus').textContent, /Clinicians from Drive/);
  assert.equal(document.getElementById('clinicianSelect').value, 'nick-stanzione');
  assert.match(document.getElementById('clinicianMeta').textContent, /NY-123/);
  document.getElementById('refreshCliniciansBtn').click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.match(document.getElementById('clinicianConfigStatus').textContent, /Clinicians from Drive/);
  document.querySelector('[data-clinician-state="CT"]').click();
  assert.match(document.getElementById('clinicianMeta').textContent, /CT-456/);

  setField(window, 'letterType', 'accommodation', 'change');
  assert.ok(document.getElementById('letterIncludeFunctionalLimitations').checked);
  setField(window, 'letterRecipient', 'HR Department');
  setField(window, 'letterPurpose', 'Request schedule flexibility. Use the uploaded prior note for demographics and clinical context.');

  document.getElementById('copyLetterPacketBtn').click();
  await new Promise((resolve) => setTimeout(resolve, 0));
  const packet = document.getElementById('letterExportBox').value;
  assert.match(packet, /ASTRA PATIENT LETTER REQUEST/);
  assert.match(packet, /Accommodation Letter/);
  assert.match(packet, /Patient consent\/release confirmed: No/);
  assert.match(packet, /Patient consent\/release has not been confirmed/);
  assert.match(packet, /Clinician: Nick Stanzione/);
  assert.match(packet, /Selected state: CT/);
  assert.match(packet, /License number: CT-456/);
  assert.match(packet, /Signature block: Nick Stanzione, PMHNP - CT/);
  assert.match(packet, /Signature asset label\/path: nick-ct-signature\.png/);
  assert.match(packet, /Prior note uploaded separately: Yes/);
  assert.match(packet, /Use the uploaded prior note for patient demographics, background, and clinically relevant context when the prior note is provided\./);
  assert.match(packet, /Incorporate the proper clinician signature/);
  assert.doesNotMatch(packet, /FILES \/ IMAGES TO UPLOAD WITH THIS REQUEST/);
  assert.equal(window.__copiedText, packet);
  assert.equal(
    document.body.dataset.astraLetterGptUrl,
    'https://chatgpt.com/g/g-69ff5644fd80819182ccbb07dfee15fa-astra-document-generator',
  );

  const stored = window.localStorage.getItem('patientLettersDraft_v1');
  assert.ok(stored, 'Expected Patient Letters draft to persist separately');
  const noteDraftBeforeClear = window.localStorage.getItem('noteBuilderDraft_v1:anonymous');
  document.getElementById('clearLetterFieldsBtn').click();
  assert.equal(document.getElementById('letterPurpose').value, '');
  assert.equal(document.getElementById('letterExportBox').value, '');
  assert.equal(window.localStorage.getItem('noteBuilderDraft_v1:anonymous'), noteDraftBeforeClear);

  firstDom.window.close();

  const secondDom = await createLetterDom({
    seedLocalStorage: {
      patientLettersDraft_v1: stored,
    },
  });
  const secondDocument = secondDom.window.document;
  assert.equal(secondDocument.getElementById('letterType').value, 'accommodation');
  assert.equal(secondDocument.querySelector('[data-clinician-state="CT"]').classList.contains('active'), true);
  assert.match(secondDocument.getElementById('letterPurpose').value, /Request schedule flexibility/);
  secondDom.window.close();
}

async function testPatientLettersLocalFallbackStatus() {
  const dom = await createLetterDom({ driveEnabled: false });
  assert.match(dom.window.document.getElementById('clinicianConfigStatus').textContent, /Using local fallback/);
  dom.window.close();

  const fallbackDom = await createLetterDom({ driveEnabled: false, localConfigFails: true });
  assert.match(fallbackDom.window.document.getElementById('clinicianConfigStatus').textContent, /Drive config unavailable/);
  fallbackDom.window.close();
}

async function testIncompletePatientBackupsDoNotUseQuestionMarkLabels() {
  const dom = await createAppDom();
  const { window } = dom;

  const incomplete = window.eval(`
    normalizeSnapshotEntry({
      draft: {
        state: { practice: 'astra', visitType: 'followup' },
        inputs: { age: '', gender: 'Male' }
      }
    })
  `);
  assert.equal(incomplete, null, 'Drafts without age should not become recent-patient backup entries');

  const ageOnly = window.eval(`
    normalizeSnapshotEntry({
      draft: {
        state: { practice: 'astra', visitType: 'followup' },
        inputs: { age: '34', gender: '' }
      }
    })
  `);
  assert.equal(ageOnly.patientLabel, '34 unknown gender');
  assert.doesNotMatch(ageOnly.patientLabel, /\?/);

  dom.window.close();
}

function testAppsScriptDiagnosticsAndBuildId() {
  assert.match(appsScript, /const APP_BUILD_ID = '20260520-intake-screeners-ui';/);
  assert.match(appsScript, /function buildStatusHtml_/);
  assert.match(appsScript, /function htmlResponse_/);
  assert.match(appsScript, /DRIVE_LAST_ERROR/);
  assert.match(appsScript, /function getAdvancedDriveStatus_/);
  assert.match(appsScript, /Advanced Drive API/);
}

async function run() {
  await testAstraGptRouting();
  await testAstraIntakeExportIncludesScreeningInformation();
  await testAstraSupportingDocumentsInstruction();
  await testAstraFollowupUploadedPreviousNoteMode();
  await testAstraWorkflowTogglesDraftRestore();
  await testClosingTimeRowsUseLevelGrid();
  await testScheduledStartMeridiemDefaultsFromCurrentTime();
  await testScheduledStartDraftValueIsNotOverwritten();
  await testScreeningInformationDraftRestore();
  await testTelehealthDefaultsRespectBlankAndManualState();
  await testMedicationDrawerKeyboardKeepsSearchEditable();
  await testPatientLettersPacketBuilderAndPersistence();
  await testPatientLettersLocalFallbackStatus();
  await testIncompletePatientBackupsDoNotUseQuestionMarkLabels();
  testAppsScriptDiagnosticsAndBuildId();
  console.log('All note-builder tests passed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
