const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = __dirname;
const HTML_PATH = path.join(ROOT, 'index.html');
const APP_PATH = path.join(ROOT, 'app.js');

const html = fs.readFileSync(HTML_PATH, 'utf8');
const js = fs.readFileSync(APP_PATH, 'utf8');

function inlineApp(sourceHtml) {
  return sourceHtml.replace('<script src="app.js"></script>', `<script>\n${js}\n</script>`);
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
      window.alert = () => {};
      window.confirm = () => true;
      window.scrollTo = () => {};
      window.fetch = undefined;
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

async function testAstraGptRouting() {
  const dom = await createAppDom();
  const { document } = dom.window;

  assert.equal(
    document.getElementById('activeGptUrl').value,
    'https://chatgpt.com/g/g-69e90b22ee3c81919cfadd1ad62c0ba2-astra-note-writer-follow-up',
    'Astra follow-up should default to the Astra follow-up GPT URL',
  );

  document.getElementById('intakeBtn').click();

  assert.equal(
    document.getElementById('activeGptUrl').value,
    'https://chatgpt.com/g/g-69e904adeaa08191b4dfacb5b1fe9040-astra-note-writer-intake',
    'Astra intake should route to the Astra intake GPT URL',
  );
  assert.match(document.getElementById('exportHelper').textContent, /Astra Intake GPT/i);

  document.getElementById('followBtn').click();

  assert.equal(
    document.getElementById('activeGptUrl').value,
    'https://chatgpt.com/g/g-69e90b22ee3c81919cfadd1ad62c0ba2-astra-note-writer-follow-up',
    'Astra follow-up should route back to the Astra follow-up GPT URL',
  );
  assert.match(document.getElementById('exportHelper').textContent, /Astra Follow-Up GPT/i);

  dom.window.close();
}

async function testAstraIntakeExportIncludesScreeningInformation() {
  const dom = await createAppDom();
  const { window } = dom;
  const { document } = window;

  document.getElementById('intakeBtn').click();

  setField(window, 'phq9', '14, moderate');
  setField(window, 'screeningInfo', 'Pre-visit forms reported chronic sleep disruption and recent panic symptoms.');
  setField(window, 'notes', 'Discussed mood, anxiety, and treatment goals.');

  const exportText = document.getElementById('exportBox').value;
  assert.match(exportText, /SCREENERS/);
  assert.match(exportText, /SCREENING INFORMATION/);
  assert.match(exportText, /Pre-visit forms reported chronic sleep disruption and recent panic symptoms\./);
  assert.ok(
    exportText.indexOf('SCREENERS') < exportText.indexOf('SCREENING INFORMATION')
      && exportText.indexOf('SCREENING INFORMATION') < exportText.indexOf('INTAKE NOTES'),
    'Screening information should appear between screeners and intake notes',
  );

  dom.window.close();
}

async function testScreeningInformationDraftRestore() {
  const firstDom = await createAppDom();
  const firstWindow = firstDom.window;
  const firstDocument = firstWindow.document;

  firstDocument.getElementById('intakeBtn').click();
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
      testDump: '',
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

  document.getElementById('medDrawerBtn').click();
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

async function run() {
  await testAstraGptRouting();
  await testAstraIntakeExportIncludesScreeningInformation();
  await testScreeningInformationDraftRestore();
  await testTelehealthDefaultsRespectBlankAndManualState();
  await testMedicationDrawerKeyboardKeepsSearchEditable();
  console.log('All note-builder tests passed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
