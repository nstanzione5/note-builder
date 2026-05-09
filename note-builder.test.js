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
    mockNow,
    failAstraConfigFetch = false,
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
      window.fetch = async (resource) => {
        const requested = String(resource || '');
        const pathname = new URL(requested, 'http://localhost:8000/').pathname.replace(/^\//, '');
        if (failAstraConfigFetch && pathname.startsWith('src/config/')) {
          return {
            ok: false,
            status: 404,
            json: async () => ({}),
            text: async () => '',
          };
        }
        const localPath = path.join(ROOT, pathname);
        if (pathname.startsWith('src/config/') || pathname.startsWith('data/') || pathname === 'config/drive-manifest.json') {
          if (fs.existsSync(localPath)) {
            return {
              ok: true,
              status: 200,
              json: async () => JSON.parse(fs.readFileSync(localPath, 'utf8')),
              text: async () => fs.readFileSync(localPath, 'utf8'),
            };
          }
        }
        return {
          ok: false,
          status: 404,
          json: async () => ({}),
          text: async () => '',
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

  document.getElementById('ebhBtn').click();

  assert.equal(
    document.getElementById('activeGptUrl').value,
    'https://chatgpt.com/g/g-69f2450c4b648191b3b2ed94e74cf369-ebh-follow-up-note',
    'EBH follow-up should route to the EBH follow-up GPT URL',
  );

  document.getElementById('intakeBtn').click();

  assert.equal(
    document.getElementById('activeGptUrl').value,
    'https://chatgpt.com/g/g-69f245e113008191823124c55e26ec7f-ebh-intake-note',
    'EBH intake should route to the EBH intake GPT URL',
  );

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
    Boolean(document.getElementById('docEnd').compareDocumentPosition(document.getElementById('astraSupportingDocsControl')) & window.Node.DOCUMENT_POSITION_FOLLOWING),
    'Supporting docs control should appear after time collection fields',
  );

  document.getElementById('ebhBtn').click();
  assert.ok(document.getElementById('astraSupportingDocsControl').classList.contains('hidden'));
  document.getElementById('astraBtn').click();

  document.getElementById('intakeBtn').click();

  let exportText = document.getElementById('exportBox').value;
  assert.ok(!document.getElementById('astraSupportingDocsUploaded').checked);
  assert.match(exportText, /Uploaded Documents: None selected in app/);
  assert.match(exportText, /UPLOADED SUPPORTING DOCUMENTS\nNone selected in app\./);

  document.querySelector('[data-supporting-doc-type="intakeScreening"]').click();
  document.querySelector('[data-supporting-doc-type="labs"]').click();
  document.querySelector('[data-supporting-doc-type="genesight"]').click();
  exportText = document.getElementById('exportBox').value;
  assert.match(
    exportText,
    /Uploaded directly to GPT: intake\/screening documentation, lab results, GeneSight report\. Use uploaded documents as supporting context with the current encounter data\./,
  );
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
  assert.match(document.getElementById('previousPlanSectionCopy').textContent, /Upload the full previous note directly to the GPT/i);

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
  assert.ok(secondDocument.querySelector('[data-astra-followup-context-mode="uploadedPreviousNote"]').classList.contains('active'));
  assert.ok(secondDocument.querySelector('[data-supporting-doc-type="other"]').classList.contains('active'));
  assert.ok(secondDocument.getElementById('previousPlanField').classList.contains('hidden'));

  secondDom.window.close();
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
      testDump: '',
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

async function testAstraLetterProviderConfigAndStateFiltering() {
  const dom = await createAppDom();
  const { window } = dom;
  const { document } = window;

  document.getElementById('letterGeneratorTab').click();

  assert.ok(!document.getElementById('letterGeneratorShell').classList.contains('hidden'));
  assert.equal(document.body.dataset.activeWorkspace, 'letter');
  assert.match(document.getElementById('brandSubtitle').textContent, /GPT packet generation/i);
  assert.equal(document.getElementById('letterOutputMode'), null, 'Letter Generator should not include output mode controls');
  assert.equal(document.getElementById('previewLetterBtn'), null, 'Letter Generator should not include preview controls');
  assert.equal(document.getElementById('printLetterBtn'), null, 'Letter Generator should not include print controls');
  assert.equal(document.getElementById('downloadLetterHtmlBtn'), null, 'Letter Generator should not include HTML export controls');
  assert.equal(document.getElementById('letterPriorNoteUpload'), null, 'Letter Generator should use a static upload reminder, not a prior-note toggle');
  assert.equal(document.getElementById('letterProviderSelect').options.length, 2);
  assert.equal(document.getElementById('letterStateSelect').options.length, 3);
  assert.equal(document.getElementById('letterDocumentType').options.length, 13);

  window.eval(`
    applyAstraProviderConfig({
      providers: [
        {
          id: 'active_provider',
          active: true,
          displayName: 'Active Provider',
          credentials: 'PMHNP',
          title: 'Psychiatric Nurse Practitioner',
          licenses: { NY: 'NY License #: 123', NJ: 'NJ License #: 456' },
          defaultSignatureBlock: 'Active Provider, PMHNP\\nAstra Psychiatry',
          sortOrder: 1
        },
        {
          id: 'inactive_provider',
          active: false,
          displayName: 'Inactive Provider',
          credentials: 'PMHNP',
          licenses: { CT: 'CT License #: 789' },
          defaultSignatureBlock: 'Inactive Provider, PMHNP\\nAstra Psychiatry',
          sortOrder: 2
        }
      ]
    }, 'test');
  `);

  const providerSelect = document.getElementById('letterProviderSelect');
  const stateSelect = document.getElementById('letterStateSelect');

  assert.equal(providerSelect.options.length, 1, 'Inactive providers should be hidden');
  assert.equal(providerSelect.value, 'active_provider');
  assert.deepEqual(
    Array.from(stateSelect.options).map((option) => option.value),
    ['NJ', 'NY'],
    'State dropdown should only show states available for the selected provider',
  );

  dom.window.close();
}

async function testAstraLetterPacketGenerationAndSecurity() {
  const dom = await createAppDom();
  const { window } = dom;
  const { document } = window;

  document.getElementById('letterGeneratorTab').click();
  document.getElementById('generateLetterPacketBtn').click();

  assert.match(
    document.getElementById('letterValidationMessage').textContent,
    /brief description/i,
    'Brief description should be required before generating a GPT packet',
  );

  setField(window, 'letterBriefDescription', 'Draft a concise treatment verification letter for continuity of care.');
  setField(window, 'letterRawOutput', 'Astra raw output: patient is stable on current regimen per clinician note.');
  document.getElementById('generateLetterPacketBtn').click();

  const packet = document.getElementById('letterOutputBox').value;
  assert.match(packet, /ASTRA CLINICAL LETTER GPT PACKET/);
  assert.match(packet, /Practice: Astra Psychiatry/);
  assert.match(packet, /Logo: public\/astra\/logo\.png/);
  assert.match(packet, /Letterhead: public\/astra\/letterhead-background\.png/);
  assert.match(packet, /General Clinical Letter/);
  assert.match(packet, /Name: Nick Stanzione/);
  assert.match(packet, /License line: Connecticut License #: \[ENTER LICENSE\]|Delaware License #: \[ENTER LICENSE\]|New York License #: \[ENTER LICENSE\]/);
  assert.match(packet, /Signature image: public\/signatures\/nick-stanzione\.png/);
  assert.match(packet, /Astra raw output: patient is stable/);
  assert.match(packet, /Do not invent facts\./);
  assert.match(packet, /Provider Verification Needed:/);
  assert.match(packet, /Use the uploaded most recent patient note as the main clinical source when available/);
  assert.match(packet, /The final GPT output may contain PHI/);
  assert.equal(
    window.eval('getLetterGptUrl()'),
    'https://chatgpt.com/g/g-69ff5644fd80819182ccbb07dfee15fa-astra-document-generator',
    'Letter generator should use the permanent Astra Document Generator GPT URL',
  );

  window.eval(`
    setValue('startTime', '9:00 AM');
    handleFieldMutation('startTime');
    saveDraft({ flush: true });
  `);
  const storedDraft = JSON.parse(window.localStorage.getItem('noteBuilderDraft_v1:anonymous'));
  assert.ok(!Object.prototype.hasOwnProperty.call(storedDraft.inputs, 'letterBriefDescription'));
  assert.ok(!Object.prototype.hasOwnProperty.call(storedDraft.inputs, 'letterRawOutput'));
  assert.doesNotMatch(JSON.stringify(storedDraft), /treatment verification letter|Astra raw output/);

  document.getElementById('clearLetterBtn').click();
  assert.equal(document.getElementById('letterBriefDescription').value, '');
  assert.equal(document.getElementById('letterRawOutput').value, '');
  assert.equal(document.getElementById('letterOutputBox').value, '');

  dom.window.close();
}

async function testAstraLetterCustomGptSetupAndFallbacks() {
  const dom = await createAppDom();
  const { window } = dom;
  const { document } = window;

  document.getElementById('letterGeneratorTab').click();

  window.eval(`
    applyAstraProviderConfig({
      providers: [
        {
          id: 'typed_signature_provider',
          active: true,
          displayName: 'Typed Signature Provider',
          credentials: 'PMHNP',
          title: 'Psychiatric Nurse Practitioner',
          signatureImage: '',
          licenses: { NY: 'NY License #: 321' },
          defaultSignatureBlock: 'Typed Signature Provider, PMHNP\\nAstra Psychiatry',
          sortOrder: 1
        }
      ]
    }, 'test');
  `);

  setField(window, 'letterBriefDescription', 'Create a body-only accommodation letter draft.');
  document.getElementById('copyCustomGptBtn').click();
  const customGpt = document.getElementById('letterOutputBox').value;
  assert.match(customGpt, /Astra Clinical Letter Assistant/);
  assert.match(customGpt, /You may produce output containing PHI/);
  assert.match(customGpt, /Conversation starters:/);
  assert.match(customGpt, /Knowledge files to upload to GPT:/);
  assert.match(customGpt, /Relevant prior treatment plan:/);

  document.getElementById('generateLetterPacketBtn').click();
  const packet = document.getElementById('letterOutputBox').value;
  assert.match(packet, /Signature image: \[No signature image configured; use fallback signature block\.\]/);
  assert.match(packet, /Typed Signature Provider, PMHNP\nAstra Psychiatry/);
  assert.match(packet, /NY License #: 321/);

  window.eval(`
    applyAstraBrandingConfig({
      practiceName: 'Astra Psychiatry',
      website: 'AstraPsychiatry.com',
      email: 'clientservices@astrapsychiatry.com',
      phone: '(914) 764-2954',
      fax: '(914) 259-5363',
      logoPath: '',
      letterheadBackgroundPath: '',
      colors: { primary: '#0B3D67', secondary: '#5BA6D9', accent: '#5BA6D9', background: '#ffffff', text: '#1f2937' }
    });
  `);
  document.getElementById('generateLetterPacketBtn').click();
  const missingLogoPacket = document.getElementById('letterOutputBox').value;
  assert.match(missingLogoPacket, /Logo: \[No asset configured; use text-based Astra header\.\]/);

  dom.window.close();
}

async function testAstraLetterMissingConfigMessage() {
  const dom = await createAppDom({ failAstraConfigFetch: true });
  const { document } = dom.window;

  document.getElementById('letterGeneratorTab').click();

  assert.match(
    document.getElementById('letterConfigMessage').textContent,
    /config failed to load/i,
    'Missing config should show a clear Letter Generator error',
  );
  assert.match(document.getElementById('letterConfigMessage').textContent, /src\/config\/astraProviders\.json/);
  assert.equal(document.getElementById('letterProviderSelect').value, '');
  assert.equal(document.getElementById('letterDocumentType').value, '');

  dom.window.close();
}

async function testAstraIntakeScreeningInformationButtonStates() {
  const dom = await createAppDom();
  const { window } = dom;
  const { document } = window;

  document.getElementById('addScreeningInfoBtn').click();
  assert.match(
    document.getElementById('screeningInfoUploadStatus').textContent,
    /Switch to Astra Intake/i,
  );

  document.getElementById('intakeBtn').click();
  document.getElementById('addScreeningInfoBtn').click();
  assert.match(
    document.getElementById('screeningInfoUploadStatus').textContent,
    /Enter screening information/i,
  );

  setField(window, 'screeningInfo', 'Pre-visit forms report attention symptoms and sleep disruption.');
  document.getElementById('addScreeningInfoBtn').click();
  assert.equal(document.getElementById('addScreeningInfoBtn').textContent, 'Uploading screening information...');
  assert.match(document.getElementById('screeningInfoUploadStatus').textContent, /Uploading screening information/);

  await new Promise((resolve) => setTimeout(resolve, 520));

  assert.equal(document.getElementById('addScreeningInfoBtn').textContent, 'Add Screening Information');
  assert.match(
    document.getElementById('screeningInfoUploadStatus').textContent,
    /Screening information added to Astra Intake/,
  );

  dom.window.close();
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

async function run() {
  await testAstraGptRouting();
  await testAstraIntakeExportIncludesScreeningInformation();
  await testAstraSupportingDocumentsInstruction();
  await testAstraFollowupUploadedPreviousNoteMode();
  await testAstraWorkflowTogglesDraftRestore();
  await testScheduledStartMeridiemDefaultsFromCurrentTime();
  await testScheduledStartDraftValueIsNotOverwritten();
  await testScreeningInformationDraftRestore();
  await testAstraLetterProviderConfigAndStateFiltering();
  await testAstraLetterPacketGenerationAndSecurity();
  await testAstraLetterCustomGptSetupAndFallbacks();
  await testAstraLetterMissingConfigMessage();
  await testAstraIntakeScreeningInformationButtonStates();
  await testTelehealthDefaultsRespectBlankAndManualState();
  await testMedicationDrawerKeyboardKeepsSearchEditable();
  await testIncompletePatientBackupsDoNotUseQuestionMarkLabels();
  console.log('All note-builder tests passed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
