const STORAGE_KEY = "clinical-note-generator-state-v1";

const els = {
  practice: document.getElementById("practice"),
  appointmentType: document.getElementById("appointmentType"),
  visitDate: document.getElementById("visitDate"),
  visitTime: document.getElementById("visitTime"),
  patientName: document.getElementById("patientName"),
  clinicianName: document.getElementById("clinicianName"),
  priorPlan: document.getElementById("priorPlan"),
  freeformNotes: document.getElementById("freeformNotes"),
  followupDate: document.getElementById("followupDate"),
  followupTime: document.getElementById("followupTime"),
  gptUrl: document.getElementById("gptUrl"),
  exportPreview: document.getElementById("exportPreview"),
  priorPlanField: document.getElementById("priorPlanField"),
  followupFields: document.getElementById("followupFields"),
  workspaceShell: document.getElementById("workspaceShell"),
  scriptWorkspace: document.getElementById("scriptWorkspace"),
  collapseScriptBtn: document.getElementById("collapseScriptBtn"),
  setupCompletion: document.getElementById("setupCompletion"),
  notesCompletion: document.getElementById("notesCompletion"),
  closingCompletion: document.getElementById("closingCompletion"),
  copyBtn: document.getElementById("copyBtn"),
  openGptBtn: document.getElementById("openGptBtn"),
  openOnlyBtn: document.getElementById("openOnlyBtn")
};

const state = {
  practice: "Astra",
  appointmentType: "Follow-up",
  visitDate: "",
  visitTime: "",
  patientName: "",
  clinicianName: "",
  priorPlan: "",
  freeformNotes: "",
  followupDate: "",
  followupTime: "",
  gptUrl: "",
  followupPRN: false,
  scriptCollapsed: false,
  scriptChecks: []
};

function saveState() {
  const payload = {
    ...state,
    scriptChecks: Array.from(document.querySelectorAll(".script-check")).map(cb => cb.checked)
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);
  } catch (err) {
    console.error("Could not load saved state:", err);
  }
}

function setInputValuesFromState() {
  els.practice.value = state.practice;
  els.appointmentType.value = state.appointmentType;
  els.visitDate.value = state.visitDate || "";
  els.visitTime.value = state.visitTime || "";
  els.patientName.value = state.patientName || "";
  els.clinicianName.value = state.clinicianName || "";
  els.priorPlan.value = state.priorPlan || "";
  els.freeformNotes.value = state.freeformNotes || "";
  els.followupDate.value = state.followupDate || "";
  els.followupTime.value = state.followupTime || "";
  els.gptUrl.value = state.gptUrl || "";

  const checks = document.querySelectorAll(".script-check");
  checks.forEach((cb, i) => {
    cb.checked = Boolean(state.scriptChecks?.[i]);
  });

  updateSegmentedButtons("practice", state.practice);
  updateSegmentedButtons("appointmentType", state.appointmentType);
  syncAppointmentTypeUI();
  syncPRNUI();
  syncScriptUI();
  updateCompletionDashboard();
  renderExport();
}

function updateSegmentedButtons(group, value) {
  document.querySelectorAll(`.segmented-btn[data-group="${group}"]`).forEach(btn => {
    btn.classList.toggle("active", btn.dataset.value === value);
  });
}

function syncAppointmentTypeUI() {
  const isIntake = state.appointmentType === "Intake";

  els.priorPlanField.classList.toggle("is-hidden", isIntake);

  if (isIntake) {
    els.scriptWorkspace.classList.remove("is-hidden");
    els.workspaceShell.classList.toggle("has-script", !state.scriptCollapsed);
  } else {
    els.scriptWorkspace.classList.add("is-hidden");
    els.workspaceShell.classList.remove("has-script");
  }

  // This is the key layout bug fix:
  // when script workspace is hidden, force single-column full-width layout.
  if (!isIntake || state.scriptCollapsed) {
    els.workspaceShell.classList.remove("has-script");
  }

  if (isIntake && !state.scriptCollapsed) {
    els.workspaceShell.classList.add("has-script");
  }
}

function syncPRNUI() {
  const prnBtn = document.getElementById("prnBtn");
  const isPRN = state.followupPRN === true;

  prnBtn.classList.toggle("prn-active", isPRN);
  els.followupFields.classList.toggle("is-disabled", isPRN);

  els.followupDate.disabled = isPRN;
  els.followupTime.disabled = isPRN;

  document.querySelectorAll(".quick-followup-btn[data-weeks]").forEach(btn => {
    btn.classList.remove("active");
  });
}

function syncScriptUI() {
  const isIntake = state.appointmentType === "Intake";
  if (!isIntake) return;

  els.scriptWorkspace.classList.toggle("is-hidden", state.scriptCollapsed);
  els.workspaceShell.classList.toggle("has-script", !state.scriptCollapsed);
  els.collapseScriptBtn.textContent = state.scriptCollapsed ? "Expand" : "Collapse";
}

function collectStateFromInputs() {
  state.practice = els.practice.value;
  state.appointmentType = els.appointmentType.value;
  state.visitDate = els.visitDate.value.trim();
  state.visitTime = els.visitTime.value.trim();
  state.patientName = els.patientName.value.trim();
  state.clinicianName = els.clinicianName.value.trim();
  state.priorPlan = els.priorPlan.value.trim();
  state.freeformNotes = els.freeformNotes.value.trim();
  state.followupDate = els.followupDate.value.trim();
  state.followupTime = els.followupTime.value.trim();
  state.gptUrl = els.gptUrl.value.trim();
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  if (h == null || m == null) return timeStr;
  const d = new Date();
  d.setHours(Number(h), Number(m), 0, 0);
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit"
  });
}

function buildExportText() {
  const lines = [];

  lines.push(`Practice: ${state.practice}`);
  lines.push(`Appointment Type: ${state.appointmentType}`);

  if (state.visitDate || state.visitTime) {
    const dateTime = [formatDate(state.visitDate), formatTime(state.visitTime)].filter(Boolean).join(" at ");
    lines.push(`Visit: ${dateTime}`);
  }

  if (state.patientName) lines.push(`Patient: ${state.patientName}`);
  if (state.clinicianName) lines.push(`Clinician: ${state.clinicianName}`);

  lines.push("");
  lines.push("Structured Raw Inputs:");

  if (state.appointmentType === "Follow-up" && state.priorPlan) {
    lines.push("");
    lines.push("Prior Plan:");
    lines.push(state.priorPlan);
  }

  lines.push("");
  lines.push("Visit Notes:");
  lines.push(state.freeformNotes || "[No notes entered]");

  lines.push("");
  lines.push("Follow-up:");

  if (state.followupPRN) {
    lines.push("No follow-up appointment was scheduled during this encounter.");
  } else {
    const followupBits = [formatDate(state.followupDate), formatTime(state.followupTime)].filter(Boolean);
    if (followupBits.length) {
      lines.push(`Follow-up scheduled for ${followupBits.join(" at ")}.`);
    } else {
      lines.push("[No follow-up details entered]");
    }
  }

  if (state.appointmentType === "Intake") {
    const checks = Array.from(document.querySelectorAll(".script-check"));
    const complete = checks.filter(cb => cb.checked).length;
    const total = checks.length;

    lines.push("");
    lines.push("Intake Script Progress:");
    lines.push(`${complete}/${total} prompts completed`);
  }

  return lines.join("\n");
}

function renderExport() {
  collectStateFromInputs();
  const output = buildExportText();
  els.exportPreview.textContent = output;
  updateCompletionDashboard();
  saveState();
}

function updateCompletionDashboard() {
  collectStateFromInputs();

  const setupFields = [
    state.practice,
    state.appointmentType,
    state.visitDate,
    state.visitTime
  ];

  const notesFields = state.appointmentType === "Follow-up"
    ? [state.priorPlan, state.freeformNotes]
    : [state.freeformNotes];

  const closingFields = state.followupPRN
    ? [true]
    : [state.followupDate, state.followupTime];

  const setupPct = percentComplete(setupFields);
  const notesPct = percentComplete(notesFields);
  const closingPct = percentComplete(closingFields);

  els.setupCompletion.textContent = `${setupPct}%`;
  els.notesCompletion.textContent = `${notesPct}%`;
  els.closingCompletion.textContent = `${closingPct}%`;
}

function percentComplete(items) {
  const total = items.length || 1;
  const complete = items.filter(Boolean).length;
  return Math.round((complete / total) * 100);
}

async function copyExport() {
  renderExport();
  const text = els.exportPreview.textContent || "";
  try {
    await navigator.clipboard.writeText(text);
    flashButton(els.copyBtn, "Copied");
    return true;
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    flashButton(els.copyBtn, "Copy failed");
    return false;
  }
}

function openGpt() {
  const url = els.gptUrl.value.trim();
  if (!url) {
    alert("Please paste your GPT URL first.");
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

function flashButton(button, text) {
  const original = button.textContent;
  button.textContent = text;
  setTimeout(() => {
    button.textContent = original;
  }, 1200);
}

function addWeeksToFollowup(weeks) {
  state.followupPRN = false;

  const baseDate = els.visitDate.value
    ? new Date(`${els.visitDate.value}T00:00:00`)
    : new Date();

  baseDate.setDate(baseDate.getDate() + (weeks * 7));

  const yyyy = baseDate.getFullYear();
  const mm = String(baseDate.getMonth() + 1).padStart(2, "0");
  const dd = String(baseDate.getDate()).padStart(2, "0");

  els.followupDate.value = `${yyyy}-${mm}-${dd}`;

  document.querySelectorAll(".quick-followup-btn[data-weeks]").forEach(btn => {
    btn.classList.toggle("active", Number(btn.dataset.weeks) === weeks);
  });

  syncPRNUI();
  renderExport();
}

function setPRNMode() {
  state.followupPRN = true;
  els.followupDate.value = "";
  els.followupTime.value = "";
  syncPRNUI();
  renderExport();
}

function bindEvents() {
  document.querySelectorAll(".segmented-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const group = btn.dataset.group;
      const value = btn.dataset.value;

      if (group === "practice") {
        state.practice = value;
        els.practice.value = value;
        updateSegmentedButtons(group, value);
      }

      if (group === "appointmentType") {
        state.appointmentType = value;
        els.appointmentType.value = value;
        updateSegmentedButtons(group, value);

        if (value === "Follow-up") {
          state.scriptCollapsed = false;
        }
        syncAppointmentTypeUI();
        syncScriptUI();
      }

      renderExport();
    });
  });

  [
    els.visitDate,
    els.visitTime,
    els.patientName,
    els.clinicianName,
    els.priorPlan,
    els.freeformNotes,
    els.followupDate,
    els.followupTime,
    els.gptUrl
  ].forEach(input => {
    input.addEventListener("input", renderExport);
    input.addEventListener("change", renderExport);
  });

  document.querySelectorAll(".quick-followup-btn[data-weeks]").forEach(btn => {
    btn.addEventListener("click", () => addWeeksToFollowup(Number(btn.dataset.weeks)));
  });

  document.getElementById("prnBtn").addEventListener("click", setPRNMode);

  els.collapseScriptBtn.addEventListener("click", () => {
    state.scriptCollapsed = !state.scriptCollapsed;
    syncScriptUI();
    syncAppointmentTypeUI();
    renderExport();
  });

  document.querySelectorAll(".script-check").forEach(cb => {
    cb.addEventListener("change", renderExport);
  });

  els.copyBtn.addEventListener("click", async () => {
    await copyExport();
  });

  els.openOnlyBtn.addEventListener("click", () => {
    openGpt();
  });

  els.openGptBtn.addEventListener("click", async () => {
    const copied = await copyExport();
    if (copied) openGpt();
  });

  document.addEventListener("keydown", async (e) => {
    const isModifier = (e.ctrlKey || e.metaKey) && e.shiftKey;
    if (!isModifier) return;

    const key = e.key.toLowerCase();

    if (key === "c") {
      e.preventDefault();
      await copyExport();
    }

    if (key === "o") {
      e.preventDefault();
      const copied = await copyExport();
      if (copied) openGpt();
    }

    if (key === "g") {
      e.preventDefault();
      openGpt();
    }
  });
}

function init() {
  loadState();
  setInputValuesFromState();
  bindEvents();
  renderExport();
}

init();
