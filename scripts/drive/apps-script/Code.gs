const APP_ROOT_DEFAULT = 'Note App';
const MANIFEST_PATH = 'config/drive-manifest.json';
const MED_REFRESH_QUEUE_PATH = 'logs/sync/med-refresh-requests.json';
const DRIVE_MED_RUNTIME_FALLBACKS_PATH = 'data/meds/review/runtime-fallbacks.json';
const PATIENT_DRAFT_CURRENT_PATH = 'data/draft/current.json';
const PATIENT_DRAFT_RECENT_PATH = 'data/draft/recent-patients.json';
const PATIENT_DRAFT_USERS_PREFIX = 'data/draft/users/';
const ROOT_FOLDER_ID_PROPERTY = 'DRIVE_ROOT_FOLDER_ID';
const ROOT_FOLDER_NAME_PROPERTY = 'DRIVE_ROOT_FOLDER_NAME';
const ROOT_SHARED_DRIVE_ID_PROPERTY = 'DRIVE_ROOT_SHARED_DRIVE_ID';
const MANIFEST_FILE_ID_PROPERTY = 'DRIVE_MANIFEST_FILE_ID';
const PATH_INDEX_PROPERTY = 'DRIVE_PATH_INDEX';
const REQUIRED_SHARED_DRIVE_ID_PROPERTY = 'DRIVE_REQUIRED_SHARED_DRIVE_ID';
const REQUIRED_SHARED_ROOT_FOLDER_ID_PROPERTY = 'DRIVE_SHARED_ROOT_FOLDER_ID';
const ALLOWED_USER_EMAILS_PROPERTY = 'DRIVE_ALLOWED_USER_EMAILS';
const SERVICE_TOKEN_PROPERTY = 'DRIVE_SERVICE_TOKEN';
const LEGACY_OWNER_TOKEN_PROPERTY = 'DRIVE_OWNER_TOKEN';
const APP_BUILD_ID = '20260311-drive-reset-v2';
const PREFLIGHT_STATUS = {
  OK: 'ok',
  ROOT_MISSING: 'root_missing',
  ROOT_ID_MISSING: 'root_id_missing',
  ROOT_ID_INVALID: 'root_id_invalid',
  ROOT_NOT_IN_REQUIRED_DRIVE: 'root_not_in_required_drive',
  SCOPE_UNVERIFIABLE: 'scope_unverifiable',
  MANIFEST_MISSING: 'manifest_missing',
  IDENTITY_MISSING: 'identity_missing',
  VERSION_MISMATCH: 'version_mismatch',
};
const CLEANUP_SNAPSHOT_DIR = 'backups/cleanup-snapshots';
const BACKUP_NOTES_RETENTION_PER_USER = 200;
const CLEANUP_SNAPSHOT_RETENTION = 40;
const DEFAULT_ALLOWED_USER_EMAILS = [
  'nick@astrapsychiatry.com',
  'kris@astrapsychiatry.com',
];
const FOLDER_STRUCTURE = [
  'app-shell',
  'data/meds/source',
  'data/meds/curated',
  'data/meds/compiled',
  'data/meds/review',
  'data/draft',
  'backups/notes',
  'logs/sync',
  'config',
];

function doGet(e) {
  try {
    const action = e && e.parameter ? (e.parameter.action || 'health') : 'health';
    const payload = e && e.parameter ? e.parameter : {};
    enforceOwnerWrite_(action, payload);
    const result = handleAction_(action, payload);
    return jsonResponse_({ ok: true, action: action, ...result });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error.message || error) });
  }
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const payload = JSON.parse(raw);
    const action = payload.action || 'health';

    enforceOwnerWrite_(action, payload);

    const result = handleAction_(action, payload);
    return jsonResponse_({ ok: true, action: action, ...result });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error.message || error) });
  }
}

function handleAction_(action, payload) {
  switch (action) {
    case 'bootstrap':
      return handleBootstrap_(payload);
    case 'drive.repair':
      return handleDriveRepair_(payload);
    case 'root.audit':
      return handleRootAudit_(payload);
    case 'mydrive.condense':
      return handleMyDriveCondense_(payload);
    case 'cleanup.preview':
      return handleCleanupPreview_(payload);
    case 'cleanup.snapshot':
      return handleCleanupSnapshot_(payload);
    case 'cleanup.apply':
      return handleCleanupApply_(payload);
    case 'manifest.get':
      return handleManifestGet_(payload);
    case 'file.get':
      return handleFileGet_(payload);
    case 'file.put':
      return handleFilePut_(payload);
    case 'backup.append':
      return handleBackupAppend_(payload);
    case 'backup.list':
      return handleBackupList_(payload);
    case 'med.refresh.request':
      return handleMedRefreshRequest_(payload);
    case 'health':
      return handleHealth_(payload);
    default:
      throw new Error('Unsupported action: ' + action);
  }
}

function enforceOwnerWrite_(action, payload) {
  const writeActions = {
    bootstrap: true,
    'drive.repair': true,
    'mydrive.condense': true,
    'cleanup.snapshot': true,
    'cleanup.apply': true,
    'file.put': true,
    'backup.append': true,
    'med.refresh.request': true,
  };

  if (!writeActions[action]) return;

  const sharedDriveId = resolveSharedDriveId_(payload);
  if (sharedDriveId) {
    payload.sharedDriveId = sharedDriveId;
  }

  if (hasValidServiceToken_(payload)) {
    return;
  }

  const effectiveUser = resolveEffectiveUserEmail_(payload);
  const isAllowlisted = effectiveUser && isEmailAllowlisted_(effectiveUser);

  if (action === 'med.refresh.request' && isAllowlisted) {
    return;
  }

  if (action === 'bootstrap' && isAllowlisted) {
    return;
  }

  if (action === 'backup.append' && isAllowlisted) {
    return;
  }

  if (action === 'mydrive.condense' && isAllowlisted) {
    return;
  }

  if (action === 'cleanup.apply' && isAllowlisted) {
    return;
  }

  if (action === 'cleanup.snapshot' && isAllowlisted) {
    return;
  }

  if (action === 'drive.repair' && isAllowlisted) {
    return;
  }

  if (action === 'file.put') {
    const path = normalizeText_(payload.path || '');
    if (isAllowlisted && isAllowlistedWritePath_(path)) {
      return;
    }
  }

  // Fallback owner check for privileged maintenance writes.
  const ownerFromPayload = normalizeText_(payload.ownerEmail || '');
  const ownerFromProperties = normalizeText_(PropertiesService.getScriptProperties().getProperty('DRIVE_OWNER_EMAIL') || '');
  const ownerEmail = ownerFromProperties || ownerFromPayload;

  if (!ownerEmail) {
    throw new Error('Owner email is required for write actions. Set ownerEmail or script property DRIVE_OWNER_EMAIL.');
  }

  const activeEmail = normalizeText_(Session.getActiveUser().getEmail() || '');
  if (!activeEmail || activeEmail !== ownerEmail) {
    throw new Error('Write actions are restricted to the configured owner account.');
  }
}

function handleHealth_(payload) {
  const tokenConfigured = Boolean(getServiceToken_());
  const allowlist = getAllowedUserEmails_();
  const resolvedUserEmail = normalizeEmail_(resolveEffectiveUserEmail_(payload) || '');
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const requiredSharedDriveId = getRequiredSharedDriveId_();
  const requiredRootFolderId = getRequiredSharedRootFolderId_();
  const sharedDriveId = requiredSharedDriveId || normalizeText_(payload.sharedDriveId || '');
  const clientBuildId = normalizeText_((payload.client && payload.client.appBuildId) || payload.clientBuildId || '');
  const preflight = evaluateDrivePreflight_({
    sharedDriveId: sharedDriveId,
    rootFolderName: rootFolderName,
    resolvedUserEmail: resolvedUserEmail,
    clientBuildId: clientBuildId,
  });

  return {
    timestamp: new Date().toISOString(),
    owner: normalizeText_(payload.ownerEmail || '') || normalizeText_(PropertiesService.getScriptProperties().getProperty('DRIVE_OWNER_EMAIL') || ''),
    tokenConfigured: tokenConfigured,
    appBuildId: APP_BUILD_ID,
    requiredSharedDriveId: requiredSharedDriveId,
    requiredRootFolderId: requiredRootFolderId,
    resolvedUserEmail: resolvedUserEmail,
    rootFolderName: rootFolderName,
    canonicalRoot: preflight.canonicalRoot || null,
    resolvedRootFolderId: preflight.resolvedRootFolderId || '',
    preflightStatus: preflight.code || PREFLIGHT_STATUS.ROOT_MISSING,
    preflightReason: preflight.reason || '',
    allowlistedUsers: allowlist,
    runtime: 'google-apps-script',
  };
}

function handleDriveRepair_(payload) {
  const sharedDriveId = resolveSharedDriveId_(payload);
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const repairedBy = resolveAllowlistedUserEmail_(payload);
  const requiredRootFolderId = getRequiredSharedRootFolderId_();
  resetCachedDrivePointers_();

  const bootstrap = handleBootstrap_({
    sharedDriveId: sharedDriveId,
    rootFolderName: rootFolderName,
    ownerEmail: payload.ownerEmail || '',
    rootFolderId: payload.rootFolderId || '',
  });

  const preflight = evaluateDrivePreflight_({
    sharedDriveId: sharedDriveId,
    rootFolderName: rootFolderName,
    resolvedUserEmail: repairedBy,
    clientBuildId: normalizeText_((payload.client && payload.client.appBuildId) || payload.clientBuildId || ''),
  });

  return {
    repaired: true,
    repairedAt: new Date().toISOString(),
    repairedBy: repairedBy,
    appBuildId: APP_BUILD_ID,
    requiredRootFolderId: requiredRootFolderId,
    resolvedRootFolderId: preflight.resolvedRootFolderId || '',
    preflightStatus: preflight.code || PREFLIGHT_STATUS.ROOT_MISSING,
    preflightReason: preflight.reason || '',
    canonicalRoot: preflight.canonicalRoot || null,
    bootstrap: bootstrap,
  };
}

function handleBootstrap_(payload) {
  const sharedDriveId = resolveSharedDriveId_(payload);
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const requestedRootFolderId = normalizeText_(payload.rootFolderId || '');
  ensureDefaultAllowlist_();

  const root = resolveConfiguredRootFolder_({
    sharedDriveId: sharedDriveId,
    rootFolderName: rootFolderName,
    requestedRootFolderId: requestedRootFolderId,
    requireRootId: true,
  });
  const createdFolders = [];

  FOLDER_STRUCTURE.forEach(function (folderPath) {
    ensureFolderPath_(root.id, folderPath, sharedDriveId, createdFolders);
  });

  const manifestBundle = loadManifest_(root.id, sharedDriveId, rootFolderName, payload.ownerEmail || '');
  const manifest = manifestBundle.manifest;

  manifest.paths = manifest.paths || {};
  FOLDER_STRUCTURE.forEach(function (folderPath) {
    manifest.paths[folderPath] = folderPath;
  });

  manifest.rootFolderName = rootFolderName;
  manifest.rootFolderId = root.id;
  manifest.sharedDriveId = sharedDriveId;
  manifest.ownerEmail = normalizeText_(payload.ownerEmail || manifest.ownerEmail || '');
  manifest.lastBootstrapAt = new Date().toISOString();
  manifest.lastUpdatedAt = new Date().toISOString();

  const manifestMeta = saveManifest_(manifestBundle.fileId, manifest);

  return {
    rootFolderId: root.id,
    sharedDriveId: sharedDriveId,
    createdFolders: createdFolders,
    manifestRevision: String(manifestMeta.version || ''),
    manifestChecksum: String(manifestMeta.md5Checksum || ''),
  };
}

function handleRootAudit_(payload) {
  const sharedDriveId = resolveSharedDriveId_(payload);
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const requiredRootFolderId = getRequiredSharedRootFolderId_();
  const validation = validateRequiredRootBinding_(sharedDriveId, requiredRootFolderId);
  const resolvedRoot = validation.rootMeta || null;
  const escaped = escapeQueryText_(rootFolderName);
  const query = "trashed=false and mimeType='application/vnd.google-apps.folder' and title='" + escaped + "'";
  const requiredSharedDriveId = getRequiredSharedDriveId_();
  const expectedDriveId = requiredSharedDriveId || sharedDriveId;
  const driveScoped = expectedDriveId
    ? listFilesSafe_({ q: query, maxResults: 100 }, expectedDriveId)
    : { items: [] };
  const myDriveScoped = listFilesSafe_({ q: query, maxResults: 100 }, '');
  const merged = mergeUniqueFilesById_([
    driveScoped.items || [],
    myDriveScoped.items || [],
  ]);

  const roots = merged.map(function (file) {
    const driveId = normalizeText_((file && (file.driveId || file.teamDriveId)) || '');
    const parents = (file && file.parents) ? file.parents.map(function (parent) {
      return normalizeText_((parent && parent.id) ? parent.id : parent);
    }).filter(Boolean) : [];

    return {
      id: String(file.id || ''),
      name: String(file.title || file.name || ''),
      driveId: driveId,
      parents: parents,
      createdAt: String(file.createdDate || file.createdTime || ''),
      modifiedAt: String(file.modifiedDate || file.modifiedTime || ''),
      inExpectedSharedDrive: Boolean(expectedDriveId && driveId === expectedDriveId),
      isMyDriveRootCandidate: !driveId,
      url: toFolderUrl_(file.id),
    };
  });

  const expectedMatches = roots.filter(function (item) {
    return item.inExpectedSharedDrive;
  });
  const canonical = resolvedRoot
    ? {
      id: String(resolvedRoot.id || ''),
      name: String(resolvedRoot.title || resolvedRoot.name || ''),
      driveId: normalizeText_((resolvedRoot.driveId || resolvedRoot.teamDriveId) || ''),
      parents: getFileParentIds_(resolvedRoot),
      createdAt: String(resolvedRoot.createdDate || resolvedRoot.createdTime || ''),
      modifiedAt: String(resolvedRoot.modifiedDate || resolvedRoot.modifiedTime || ''),
      inExpectedSharedDrive: true,
      isMyDriveRootCandidate: false,
      url: toFolderUrl_(resolvedRoot.id),
    }
    : (expectedMatches.length ? selectStableRootAuditItem_(expectedMatches) : null);

  return {
    rootFolderName: rootFolderName,
    requiredSharedDriveId: requiredSharedDriveId,
    requiredRootFolderId: requiredRootFolderId,
    expectedSharedDriveId: expectedDriveId,
    canonicalRoot: canonical || null,
    resolvedRootFolderId: canonical && canonical.id ? canonical.id : '',
    preflightStatus: validation.code || PREFLIGHT_STATUS.OK,
    preflightReason: validation.reason || '',
    duplicateRoots: roots.filter(function (item) {
      return canonical ? item.id !== canonical.id : true;
    }),
    allRoots: roots,
  };
}

function evaluateDrivePreflight_(options) {
  const sharedDriveId = normalizeText_((options && options.sharedDriveId) || '');
  const rootFolderName = normalizeText_((options && options.rootFolderName) || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const resolvedUserEmail = normalizeEmail_((options && options.resolvedUserEmail) || '');
  const clientBuildId = normalizeText_((options && options.clientBuildId) || '');
  const requiredRootFolderId = getRequiredSharedRootFolderId_();

  if (!resolvedUserEmail || !isEmailAllowlisted_(resolvedUserEmail)) {
    return {
      code: PREFLIGHT_STATUS.IDENTITY_MISSING,
      reason: 'Active user identity is unavailable or not in DRIVE_ALLOWED_USER_EMAILS.',
      canonicalRoot: null,
      requiredRootFolderId: requiredRootFolderId,
      resolvedRootFolderId: '',
    };
  }

  if (clientBuildId && clientBuildId !== APP_BUILD_ID) {
    return {
      code: PREFLIGHT_STATUS.VERSION_MISMATCH,
      reason: 'Client build does not match Apps Script deployment build.',
      canonicalRoot: null,
      requiredRootFolderId: requiredRootFolderId,
      resolvedRootFolderId: '',
    };
  }

  if (!sharedDriveId) {
    return {
      code: PREFLIGHT_STATUS.SCOPE_UNVERIFIABLE,
      reason: 'Required shared drive ID is not configured.',
      canonicalRoot: null,
      requiredRootFolderId: requiredRootFolderId,
      resolvedRootFolderId: '',
    };
  }

  const rootValidation = validateRequiredRootBinding_(sharedDriveId, requiredRootFolderId);
  if (rootValidation.code !== PREFLIGHT_STATUS.OK) {
    return {
      code: rootValidation.code,
      reason: rootValidation.reason,
      canonicalRoot: rootValidation.rootMeta || null,
      requiredRootFolderId: requiredRootFolderId,
      resolvedRootFolderId: rootValidation.rootMeta && rootValidation.rootMeta.id ? String(rootValidation.rootMeta.id) : '',
    };
  }

  const canonicalRootMeta = rootValidation.rootMeta;
  if (!canonicalRootMeta || !canonicalRootMeta.id) {
    return {
      code: PREFLIGHT_STATUS.ROOT_ID_INVALID,
      reason: 'Configured shared root folder is missing or invalid.',
      canonicalRoot: null,
      requiredRootFolderId: requiredRootFolderId,
      resolvedRootFolderId: '',
    };
  }

  saveStoredRootFolder_(canonicalRootMeta.id, sharedDriveId, rootFolderName);
  const canonicalRoot = {
    id: String(canonicalRootMeta.id || ''),
    name: String(canonicalRootMeta.title || canonicalRootMeta.name || rootFolderName || ''),
    driveId: normalizeText_((canonicalRootMeta.driveId || canonicalRootMeta.teamDriveId) || ''),
    parents: getFileParentIds_(canonicalRootMeta),
    createdAt: String(canonicalRootMeta.createdDate || canonicalRootMeta.createdTime || ''),
    modifiedAt: String(canonicalRootMeta.modifiedDate || canonicalRootMeta.modifiedTime || ''),
    url: toFolderUrl_(canonicalRootMeta.id),
  };

  let existingManifest = null;
  try {
    existingManifest = getExistingManifestFile_(canonicalRootMeta.id, sharedDriveId);
  } catch (error) {
    existingManifest = null;
  }
  if (!existingManifest || !existingManifest.fileId) {
    return {
      code: PREFLIGHT_STATUS.MANIFEST_MISSING,
      reason: 'Drive manifest is missing under canonical shared root.',
      canonicalRoot: canonicalRoot,
      requiredRootFolderId: requiredRootFolderId,
      resolvedRootFolderId: canonicalRoot.id,
    };
  }

  return {
    code: PREFLIGHT_STATUS.OK,
    reason: '',
    canonicalRoot: canonicalRoot,
    requiredRootFolderId: requiredRootFolderId,
    resolvedRootFolderId: canonicalRoot.id,
  };
}

function resetCachedDrivePointers_() {
  clearStoredRootFolder_();
  clearManifestFileId_();
  PropertiesService.getScriptProperties().deleteProperty(PATH_INDEX_PROPERTY);
}

function handleMyDriveCondense_(payload) {
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const archiveFolderName = normalizeText_(payload.archiveFolderName || ('Astra Personal Drive Cleanup ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd'))) || 'Astra Personal Drive Cleanup';
  const dryRun = payload && (payload.dryRun === true || normalizeText_(payload.dryRun || '') === 'true');
  const includeUntitledFiles = !(payload && (payload.includeUntitledFiles === false || normalizeText_(payload.includeUntitledFiles || '') === 'false'));
  const includeUntitledFolders = !(payload && (payload.includeUntitledFolders === false || normalizeText_(payload.includeUntitledFolders || '') === 'false'));
  const maxItems = Math.max(1, Math.min(1200, Number(payload && payload.maxItems ? payload.maxItems : 600) || 600));

  const archiveFolder = getOrCreateMyDriveFolder_(archiveFolderName);
  const candidates = findMyDriveCleanupCandidates_(rootFolderName, archiveFolder.getId(), {
    includeUntitledFiles: includeUntitledFiles,
    includeUntitledFolders: includeUntitledFolders,
    maxItems: maxItems,
    archiveFolderName: archiveFolderName,
  });
  const moved = [];
  const errors = [];
  const movedByType = { files: 0, folders: 0 };

  if (!dryRun) {
    candidates.forEach(function (item) {
      try {
        if (item.kind === 'folder') {
          const folder = DriveApp.getFolderById(item.id);
          folder.moveTo(archiveFolder);
          movedByType.folders += 1;
        } else {
          const file = DriveApp.getFileById(item.id);
          file.moveTo(archiveFolder);
          movedByType.files += 1;
        }
        moved.push(item);
      } catch (error) {
        errors.push({
          id: item.id,
          name: item.name,
          kind: item.kind,
          error: String(error && error.message ? error.message : error),
        });
      }
    });
  }

  return {
    dryRun: dryRun,
    archiveFolderId: archiveFolder.getId(),
    archiveFolderName: archiveFolder.getName(),
    archiveFolderUrl: toFolderUrl_(archiveFolder.getId()),
    candidateCount: candidates.length,
    movedCount: moved.length,
    movedByType: movedByType,
    candidates: candidates,
    moved: moved,
    errors: errors,
  };
}

function handleCleanupPreview_(payload) {
  const sharedDriveId = resolveSharedDriveId_(payload);
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const requestedBy = resolveAllowlistedUserEmail_(payload);
  const maxItems = Math.max(1, Math.min(60000, Number(payload && payload.maxItems ? payload.maxItems : 20000) || 20000));
  const sampleSize = Math.max(5, Math.min(50, Number(payload && payload.sampleSize ? payload.sampleSize : 20) || 20));
  const protectedIds = buildProtectedDriveIds_(sharedDriveId, rootFolderName);
  const candidates = findCleanupCandidatesV3_(rootFolderName, maxItems, protectedIds, sharedDriveId);
  const summary = summarizeCleanupCandidates_(candidates);

  return {
    mode: 'preview',
    requestedBy: requestedBy,
    generatedAt: new Date().toISOString(),
    candidateCount: candidates.length,
    summary: summary,
    sample: candidates.slice(0, sampleSize),
    protectedIdCount: Object.keys(protectedIds).length,
  };
}

function handleCleanupSnapshot_(payload) {
  const sharedDriveId = resolveSharedDriveId_(payload);
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const requestedBy = resolveAllowlistedUserEmail_(payload);
  const root = resolveConfiguredRootFolder_({
    sharedDriveId: sharedDriveId,
    rootFolderName: rootFolderName,
    requireRootId: true,
  });
  const manifestBundle = loadManifest_(root.id, sharedDriveId, rootFolderName, payload.ownerEmail || '');
  const nowIso = new Date().toISOString();
  const userKey = userPathKeyFromEmail_(requestedBy);
  const snapshotName = ('cleanup-snapshot-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + sanitizeFileToken_(userKey || 'user') + '.json');

  const scopedCurrentPath = resolveScopedPathForPayload_(PATIENT_DRAFT_CURRENT_PATH, payload);
  const scopedRecentPath = resolveScopedPathForPayload_(PATIENT_DRAFT_RECENT_PATH, payload);
  const targetPaths = [
    scopedCurrentPath,
    scopedRecentPath,
    DRIVE_MED_RUNTIME_FALLBACKS_PATH,
    MANIFEST_PATH,
  ];
  const files = [];

  targetPaths.forEach(function (path) {
    const resolved = resolvePathFile_(manifestBundle.manifest, root.id, path, sharedDriveId, false, false);
    if (!resolved || !resolved.fileId) {
      files.push({ path: path, exists: false, id: '', revision: '', checksum: '', content: '' });
      return;
    }
    const meta = getFileMeta_(resolved.fileId);
    files.push({
      path: path,
      exists: true,
      id: resolved.fileId,
      revision: String(meta.version || ''),
      checksum: String(meta.md5Checksum || ''),
      updatedAt: String(meta.modifiedDate || meta.modifiedTime || ''),
      content: readFileContent_(resolved.fileId),
    });
  });

  const snapshotPayload = {
    generatedAt: nowIso,
    generatedBy: requestedBy,
    appBuildId: APP_BUILD_ID,
    requiredSharedDriveId: getRequiredSharedDriveId_(),
    requiredRootFolderId: getRequiredSharedRootFolderId_(),
    resolvedRootFolderId: root.id,
    files: files,
  };

  const snapshotFolderId = ensureFolderPath_(root.id, CLEANUP_SNAPSHOT_DIR, sharedDriveId, []);
  const created = insertFileSafe_({
    title: snapshotName,
    mimeType: 'application/json',
    parents: [{ id: snapshotFolderId }],
  }, Utilities.newBlob(JSON.stringify(snapshotPayload, null, 2), 'application/json', snapshotName), sharedDriveId, root.id);
  const retention = pruneJsonFilesInFolder_(snapshotFolderId, sharedDriveId, CLEANUP_SNAPSHOT_RETENTION);

  return {
    mode: 'snapshot',
    requestedBy: requestedBy,
    generatedAt: nowIso,
    snapshotFileId: String(created.id || ''),
    snapshotFileName: String(created.title || created.name || snapshotName),
    snapshotFileUrl: toFileUrl_(created.id),
    snapshotPath: CLEANUP_SNAPSHOT_DIR + '/' + snapshotName,
    fileCount: files.filter(function (entry) { return entry.exists; }).length,
    missingCount: files.filter(function (entry) { return !entry.exists; }).length,
    retention: {
      keep: CLEANUP_SNAPSHOT_RETENTION,
      scanned: retention.scannedCount,
      trashed: retention.trashedCount,
      errors: retention.errorCount,
    },
  };
}

function handleCleanupApply_(payload) {
  const sharedDriveId = resolveSharedDriveId_(payload);
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const requestedBy = resolveAllowlistedUserEmail_(payload);
  const maxItems = Math.max(1, Math.min(60000, Number(payload && payload.maxItems ? payload.maxItems : 20000) || 20000));
  const batchSize = Math.max(10, Math.min(500, Number(payload && payload.batchSize ? payload.batchSize : 250) || 250));
  const protectedIds = buildProtectedDriveIds_(sharedDriveId, rootFolderName);
  const candidates = findCleanupCandidatesV3_(rootFolderName, maxItems, protectedIds, sharedDriveId);
  const batch = candidates.slice(0, batchSize);
  const trashed = [];
  const errors = [];
  const trashedByType = { files: 0, folders: 0 };

  batch.forEach(function (item) {
    try {
      if (item.kind === 'folder') {
        DriveApp.getFolderById(item.id).setTrashed(true);
        trashedByType.folders += 1;
      } else {
        DriveApp.getFileById(item.id).setTrashed(true);
        trashedByType.files += 1;
      }
      trashed.push(item);
    } catch (error) {
      errors.push({
        id: item.id,
        name: item.name,
        kind: item.kind,
        error: String(error && error.message ? error.message : error),
      });
    }
  });

  const remaining = findCleanupCandidatesV3_(rootFolderName, maxItems, protectedIds, sharedDriveId);
  return {
    mode: 'apply',
    requestedBy: requestedBy,
    appliedAt: new Date().toISOString(),
    requestedBatchSize: batchSize,
    processedCount: batch.length,
    trashedCount: trashed.length,
    trashedByType: trashedByType,
    remainingCount: remaining.length,
    done: remaining.length <= 0 || batch.length <= 0,
    checkpoint: {
      remainingCount: remaining.length,
      nextSuggestedBatchSize: batchSize,
    },
    sampleRemaining: remaining.slice(0, 20),
    trashed: trashed,
    errors: errors,
  };
}

function buildCleanupProfiles_(rootFolderName) {
  const base = [
    normalizeText_(rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT,
    'Astra Clinical Note Builder',
    'app-shell',
    'Note App',
  ];
  const seen = {};
  const out = [];
  base.forEach(function (entry) {
    const safe = normalizeText_(entry || '');
    if (!safe) return;
    const key = safe.toLowerCase();
    if (seen[key]) return;
    seen[key] = true;
    out.push(safe);
  });
  return out;
}

function findCleanupCandidatesV3_(rootFolderName, maxItems, protectedIds, sharedDriveId) {
  const profiles = buildCleanupProfiles_(rootFolderName);
  const protectedMap = protectedIds || {};
  const scanTarget = Math.max(500, Math.min(60000, Number(maxItems || 20000) || 20000));
  const perQueryLimit = Math.max(500, Math.min(5000, scanTarget));
  const rootGroups = [];
  const fileGroups = [];
  const folderRootIds = {};

  profiles.forEach(function (profileName) {
    const escaped = escapeQueryText_(profileName);
    const exactFolderQuery = "trashed=false and mimeType='application/vnd.google-apps.folder' and title='" + escaped + "'";
    const containsFolderQuery = "trashed=false and mimeType='application/vnd.google-apps.folder' and title contains '" + escaped + "'";
    rootGroups.push(listFilesAllSafe_({ q: exactFolderQuery, maxResults: 300 }, '', perQueryLimit));
    rootGroups.push(listFilesAllSafe_({ q: containsFolderQuery, maxResults: 300 }, '', perQueryLimit));
  });

  const appRootFolders = mergeUniqueFilesById_(rootGroups)
    .map(function (item) {
      return toCleanupItem_(item);
    })
    .filter(function (item) {
      if (!item || !item.id) return false;
      if (!isSafeMyDriveCleanupCandidate_(item, sharedDriveId)) return false;
      if (protectedMap[item.id]) return false;
      if (item.kind !== 'folder') return false;
      return isLikelyAppCleanupFolderName_(item.name, rootFolderName) || isLikelyAppRootFolder_(item.id);
    });

  appRootFolders.forEach(function (item) {
    folderRootIds[item.id] = true;
  });

  const broadFileTerms = [
    'current',
    'recent-patients',
    'drive-manifest',
    'artifact-publish',
    'note-builder',
    'app-shell',
    'astra clinical note builder',
    'note app',
  ];
  broadFileTerms.forEach(function (term) {
    const escaped = escapeQueryText_(term);
    const query = "trashed=false and title contains '" + escaped + "'";
    fileGroups.push(listFilesAllSafe_({ q: query, maxResults: 400 }, '', perQueryLimit));
  });

  const broadMatched = mergeUniqueFilesById_(fileGroups)
    .map(function (item) { return toCleanupItem_(item); })
    .filter(function (item) {
      if (!item || !item.id) return false;
      if (protectedMap[item.id]) return false;
      if (!isSafeMyDriveCleanupCandidate_(item, sharedDriveId)) return false;
      if (item.kind === 'folder') {
        if (isLikelyAppCleanupFolderName_(item.name, rootFolderName) || isLikelyAppRootFolder_(item.id)) {
          folderRootIds[item.id] = true;
          return true;
        }
        return false;
      }
      return isLikelyAppCleanupFileName_(item.name)
        || (isUntitledLikeName_(item.name) && isLikelyAppCleanupFileMime_(item.mimeType));
    });

  const descendants = collectCleanupDescendants_(Object.keys(folderRootIds), scanTarget, protectedMap, sharedDriveId);
  const merged = mergeCleanupItemsById_([
    appRootFolders,
    broadMatched,
    descendants,
  ]);

  return merged
    .filter(function (item) {
      return item
        && item.id
        && !protectedMap[item.id]
        && isSafeMyDriveCleanupCandidate_(item, sharedDriveId);
    })
    .slice(0, scanTarget);
}

function toCleanupItem_(item) {
  if (!item) return null;
  const mimeType = normalizeText_(item.mimeType || '');
  const kind = mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file';
  return {
    id: String(item.id || ''),
    name: String(item.title || item.name || ''),
    kind: kind,
    mimeType: mimeType,
    driveId: normalizeText_((item.driveId || item.teamDriveId) || ''),
    parents: resolveFileParentIds_(item),
    createdAt: String(item.createdDate || item.createdTime || ''),
    modifiedAt: String(item.modifiedDate || item.modifiedTime || ''),
    url: kind === 'folder' ? toFolderUrl_(item.id) : toFileUrl_(item.id),
  };
}

function collectCleanupDescendants_(rootFolderIds, maxItems, protectedMap, sharedDriveId) {
  const queue = (rootFolderIds || []).map(function (id) {
    return normalizeText_(id || '');
  }).filter(Boolean);
  const seenFolderIds = {};
  const seenItemIds = {};
  const out = [];
  const limit = Math.max(500, Math.min(60000, Number(maxItems || 20000) || 20000));

  while (queue.length && out.length < limit) {
    const parentId = queue.shift();
    if (!parentId || seenFolderIds[parentId]) continue;
    seenFolderIds[parentId] = true;

    const query = "trashed=false and '" + escapeQueryText_(parentId) + "' in parents";
    const children = listFilesAllSafe_({
      q: query,
      maxResults: 300,
    }, '', Math.max(200, limit - out.length));

    children.forEach(function (child) {
      if (!child || !child.id) return;
      const item = toCleanupItem_(child);
      if (!item || !item.id) return;
      if (seenItemIds[item.id]) return;
      if (protectedMap && protectedMap[item.id]) return;
      if (!isSafeMyDriveCleanupCandidate_(item, sharedDriveId)) return;
      seenItemIds[item.id] = true;
      out.push(item);
      if (item.kind === 'folder' && !seenFolderIds[item.id]) {
        queue.push(item.id);
      }
    });
  }

  return out.slice(0, limit);
}

function isSafeMyDriveCleanupCandidate_(item, sharedDriveId) {
  const id = normalizeText_((item && item.id) || '');
  if (!id) return false;

  const listedDriveId = normalizeText_((item && (item.driveId || item.teamDriveId)) || '');
  if (listedDriveId) return false;

  const normalizedSharedDriveId = normalizeText_(sharedDriveId || '');
  if (!normalizedSharedDriveId) return true;

  const parentIds = Array.isArray(item && item.parents)
    ? item.parents.map(function (parent) {
      return normalizeText_(parent && parent.id ? parent.id : parent);
    }).filter(Boolean)
    : [];
  if (parentIds.indexOf(normalizedSharedDriveId) >= 0) {
    return false;
  }

  // If listing metadata already indicates a regular My Drive parent, skip expensive hydration.
  if (parentIds.length) {
    return true;
  }

  // Ambiguous parentless records are rare; hydrate once as a safety backstop.
  try {
    const meta = getFileSafe_(id);
    return !fileBelongsToSharedDrive_(meta, normalizedSharedDriveId);
  } catch (error) {
    // Fail-closed for safety. Unknown scope items are not purged automatically.
    return false;
  }
}

function mergeCleanupItemsById_(groups) {
  const seen = {};
  const out = [];
  (groups || []).forEach(function (group) {
    (group || []).forEach(function (item) {
      const id = normalizeText_((item && item.id) || '');
      if (!id || seen[id]) return;
      seen[id] = true;
      out.push(item);
    });
  });

  out.sort(function (a, b) {
    const modifiedA = String((a && a.modifiedAt) || '');
    const modifiedB = String((b && b.modifiedAt) || '');
    if (modifiedA !== modifiedB) {
      return modifiedA > modifiedB ? -1 : 1;
    }
    const idA = String((a && a.id) || '');
    const idB = String((b && b.id) || '');
    if (idA === idB) return 0;
    return idA < idB ? -1 : 1;
  });

  return out;
}

function summarizeCleanupCandidates_(candidates) {
  const counts = {};
  const totals = { files: 0, folders: 0 };
  (candidates || []).forEach(function (item) {
    if (!item) return;
    if (item.kind === 'folder') {
      totals.folders += 1;
    } else {
      totals.files += 1;
    }
    const key = String(item.kind || 'file') + ':' + normalizeText_(item.name || '').toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
  });

  const topGroups = Object.keys(counts)
    .map(function (key) {
      return { key: key, count: counts[key] };
    })
    .sort(function (a, b) {
      if (a.count !== b.count) return b.count - a.count;
      return a.key < b.key ? -1 : 1;
    })
    .slice(0, 25);

  return {
    totals: totals,
    topGroups: topGroups,
  };
}

function buildProtectedDriveIds_(sharedDriveId, rootFolderName) {
  const out = {};
  const sharedId = normalizeText_(sharedDriveId || '');
  const rootName = normalizeText_(rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  let root = null;
  try {
    root = resolveConfiguredRootFolder_({
      sharedDriveId: sharedId,
      rootFolderName: rootName,
      requireRootId: true,
    });
  } catch (error) {
    root = null;
  }
  if (root && root.id) {
    out[String(root.id)] = true;
  }

  if (!root || !root.id) {
    return out;
  }

  const manifestBundle = loadManifestForRead_(root.id, sharedId, rootName, '');
  if (!manifestBundle || !manifestBundle.fileId) {
    return out;
  }

  out[String(manifestBundle.fileId)] = true;
  const pathMap = manifestBundle.manifest && manifestBundle.manifest.pathMap
    ? manifestBundle.manifest.pathMap
    : {};
  Object.keys(pathMap).forEach(function (path) {
    const mapped = pathMap[path];
    const id = mapped && mapped.id ? String(mapped.id) : '';
    if (id) out[id] = true;
  });
  return out;
}

function getOrCreateMyDriveFolder_(folderName) {
  const root = DriveApp.getRootFolder();
  const existing = root.getFoldersByName(folderName);
  if (existing.hasNext()) {
    return existing.next();
  }
  return root.createFolder(folderName);
}

function pushCleanupQueryItems_(groups, query, maxResults) {
  try {
    const listed = listFilesSafe_({ q: query, maxResults: maxResults }, '');
    groups.push((listed && listed.items) ? listed.items : []);
  } catch (error) {
    groups.push([]);
  }
}

function findMyDriveCleanupCandidates_(rootFolderName, archiveFolderId, options) {
  const maxItems = Math.max(1, Math.min(15000, Number(options && options.maxItems ? options.maxItems : 600) || 600));
  const includeUntitledFiles = options ? Boolean(options.includeUntitledFiles) : true;
  const includeUntitledFolders = options ? Boolean(options.includeUntitledFolders) : true;
  const archiveFolderName = normalizeText_((options && options.archiveFolderName) || '');
  const archivePrefix = archiveFolderName ? archiveFolderName.replace(/\s+\d{8}$/, '') : '';
  const escapedRootName = escapeQueryText_(rootFolderName);
  const archiveFilter = archiveFolderId ? " and not '" + escapeQueryText_(archiveFolderId) + "' in parents" : '';
  const scanLimit = Math.max(200, Math.min(1500, maxItems));

  const groups = [];
  const rootByNameQuery = "trashed=false and mimeType='application/vnd.google-apps.folder' and title='" + escapedRootName + "'" + archiveFilter;
  pushCleanupQueryItems_(groups, rootByNameQuery, scanLimit);

  // Look for known duplicate folder families generated by prior app builds.
  const folderLikeTerms = Array.from(new Set([
    normalizeText_(rootFolderName || ''),
    'Astra Clinical Note Builder',
    'Note App',
    'app-shell',
  ].filter(Boolean)));
  folderLikeTerms.forEach(function (term) {
    const escaped = escapeQueryText_(term);
    const exact = "trashed=false and mimeType='application/vnd.google-apps.folder' and title='" + escaped + "'" + archiveFilter;
    const partial = "trashed=false and mimeType='application/vnd.google-apps.folder' and title contains '" + escaped + "'" + archiveFilter;
    pushCleanupQueryItems_(groups, exact, scanLimit);
    pushCleanupQueryItems_(groups, partial, scanLimit);
  });

  // Look for known duplicate JSON artifact families.
  const fileLikeTerms = ['drive-manifest', 'recent-patients', 'current', 'artifact-publish'];
  fileLikeTerms.forEach(function (term) {
    const escaped = escapeQueryText_(term);
    const query = "trashed=false and mimeType!='application/vnd.google-apps.folder' and title contains '" + escaped + "'" + archiveFilter;
    pushCleanupQueryItems_(groups, query, scanLimit);
  });

  if (includeUntitledFolders) {
    const untitledFoldersQuery = "trashed=false and mimeType='application/vnd.google-apps.folder' and title contains 'Untitled'" + archiveFilter;
    pushCleanupQueryItems_(groups, untitledFoldersQuery, scanLimit);
  }

  if (includeUntitledFiles) {
    const untitledFilesQuery = "trashed=false and mimeType!='application/vnd.google-apps.folder' and title contains 'Untitled'" + archiveFilter;
    pushCleanupQueryItems_(groups, untitledFilesQuery, scanLimit);
  }

  const merged = mergeUniqueFilesById_(groups);

  const candidates = merged
    .filter(function (item) {
      const driveId = normalizeText_((item && (item.driveId || item.teamDriveId)) || '');
      return !driveId;
    })
    .map(function (item) {
      const mimeType = normalizeText_(item && item.mimeType ? item.mimeType : '');
      const kind = mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file';
      return {
        id: String(item.id || ''),
        name: String(item.title || item.name || ''),
        kind: kind,
        mimeType: mimeType,
        driveId: normalizeText_((item && (item.driveId || item.teamDriveId)) || ''),
        parents: resolveFileParentIds_(item),
        createdAt: String(item.createdDate || item.createdTime || ''),
        modifiedAt: String(item.modifiedDate || item.modifiedTime || ''),
        url: kind === 'folder' ? toFolderUrl_(item.id) : toFileUrl_(item.id),
      };
    })
    .filter(function (item) {
      if (!item.id || item.id === archiveFolderId) return false;
      if (item.parents.indexOf(archiveFolderId) >= 0) return false;
      if (isItemInsideCleanupArchive_(item, archiveFolderId, archivePrefix)) return false;

      if (item.kind === 'folder') {
        if (isLikelyAppCleanupFolderName_(item.name, rootFolderName)) {
          return true;
        }
        if (isLikelyAppRootFolder_(item.id)) {
          return true;
        }
        if (includeUntitledFolders && isUntitledLikeName_(item.name)) {
          return isLikelyAppRootFolder_(item.id);
        }
        return false;
      }

      if (item.kind === 'file') {
        if (isLikelyAppCleanupFileName_(item.name)) {
          return true;
        }
        if (includeUntitledFiles && isUntitledLikeName_(item.name)) {
          return isLikelyAppCleanupFileMime_(item.mimeType);
        }
      }

      return false;
    });

  candidates.sort(function (a, b) {
    const modifiedA = String(a.modifiedAt || '');
    const modifiedB = String(b.modifiedAt || '');
    if (modifiedA !== modifiedB) {
      return modifiedA > modifiedB ? -1 : 1;
    }
    const idA = String(a.id || '');
    const idB = String(b.id || '');
    if (idA === idB) return 0;
    return idA < idB ? -1 : 1;
  });

  return candidates.slice(0, maxItems);
}

function isItemInsideCleanupArchive_(item, archiveFolderId, archivePrefix) {
  const safePrefix = normalizeText_(archivePrefix || '');
  const ownName = normalizeText_((item && item.name) || '');
  if (safePrefix && ownName.indexOf(safePrefix) === 0) {
    return true;
  }

  const parents = item && Array.isArray(item.parents) ? item.parents : [];
  for (var i = 0; i < parents.length; i += 1) {
    const parentId = normalizeText_(parents[i] || '');
    if (!parentId) continue;
    if (archiveFolderId && parentId === archiveFolderId) return true;
    try {
      const parentMeta = getFileSafe_(parentId);
      const parentName = normalizeText_((parentMeta && (parentMeta.title || parentMeta.name)) || '');
      if (safePrefix && parentName.indexOf(safePrefix) === 0) {
        return true;
      }
    } catch (error) {
      // best-effort parent inspection
    }
  }
  return false;
}

function isUntitledLikeName_(name) {
  const normalized = normalizeText_(name || '').toLowerCase();
  return normalized === 'untitled'
    || normalized === 'untitled folder'
    || normalized === 'untitled document'
    || normalized.indexOf('untitled ') === 0
    || normalized.indexOf('untitled-') === 0;
}

function isLikelyAppCleanupFolderName_(name, rootFolderName) {
  const normalized = normalizeText_(name || '').toLowerCase();
  const normalizedRoot = normalizeText_(rootFolderName || '').toLowerCase();
  if (!normalized) return false;
  if (normalizedRoot) {
    if (normalized === normalizedRoot) return true;
    if (normalized.indexOf(normalizedRoot + ' (') === 0 && normalized.slice(-1) === ')') return true;
  }
  return /^app-shell(?: \(\d+\))?$/.test(normalized)
    || /^astra clinical note builder(?: \(\d+\))?$/.test(normalized)
    || /^note app(?: \(\d+\))?$/.test(normalized);
}

function isLikelyAppCleanupFileName_(name) {
  const normalized = normalizeText_(name || '').toLowerCase();
  if (!normalized) return false;
  return /^(?:current|recent-patients|drive-manifest)(?: \(\d+\))?\.json$/.test(normalized)
    || /artifact-publish\.json$/.test(normalized)
    || /^note-builder(?:[-_. ].*)?\.json$/.test(normalized);
}

function isLikelyAppCleanupFileMime_(mimeType) {
  const normalized = normalizeText_(mimeType || '').toLowerCase();
  return normalized === 'application/json' || normalized === 'text/plain';
}

function getFileParentIds_(file) {
  const parents = (file && file.parents) ? file.parents : [];
  return parents.map(function (parent) {
    return normalizeText_((parent && parent.id) ? parent.id : parent);
  }).filter(Boolean);
}

function resolveFileParentIds_(file) {
  const directParents = getFileParentIds_(file);
  if (directParents.length) return directParents;

  const fileId = normalizeText_((file && file.id) || '');
  if (!fileId) return directParents;

  try {
    const hydrated = getFileSafe_(fileId);
    return getFileParentIds_(hydrated);
  } catch (error) {
    return directParents;
  }
}

function isLikelyAppRootFolder_(folderId) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const anchors = ['app-shell', 'data', 'backups', 'logs', 'config'];
    let matched = 0;
    anchors.forEach(function (anchor) {
      if (folder.getFoldersByName(anchor).hasNext()) {
        matched += 1;
      }
    });
    return matched >= 2;
  } catch (error) {
    return false;
  }
}

function mergeUniqueFilesById_(groups) {
  const seen = {};
  const out = [];

  (groups || []).forEach(function (group) {
    (group || []).forEach(function (item) {
      const id = normalizeText_((item && item.id) || '');
      if (!id || seen[id]) {
        return;
      }
      seen[id] = true;
      out.push(item);
    });
  });

  return out;
}

function selectStableRootAuditItem_(items) {
  const candidates = (items || []).slice();
  candidates.sort(function (a, b) {
    const createdA = String(a.createdAt || '');
    const createdB = String(b.createdAt || '');
    if (createdA !== createdB) {
      return createdA < createdB ? -1 : 1;
    }
    const idA = String(a.id || '');
    const idB = String(b.id || '');
    if (idA === idB) return 0;
    return idA < idB ? -1 : 1;
  });
  return candidates[0];
}

function handleManifestGet_(payload) {
  const sharedDriveId = resolveSharedDriveId_(payload);
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const root = getRootFolderForRead_(sharedDriveId, rootFolderName);
  if (!root) {
    return {
      manifest: null,
      revision: '',
      checksum: '',
      updatedAt: '',
    };
  }

  const manifestBundle = loadManifestForRead_(root.id, sharedDriveId, rootFolderName, payload.ownerEmail || '');
  if (!manifestBundle) {
    return {
      manifest: null,
      revision: '',
      checksum: '',
      updatedAt: '',
    };
  }

  const manifestMeta = getFileMeta_(manifestBundle.fileId);

  return {
    manifest: manifestBundle.manifest,
    revision: String(manifestMeta.version || ''),
    checksum: String(manifestMeta.md5Checksum || ''),
    updatedAt: String(manifestMeta.modifiedDate || ''),
  };
}

function handleFileGet_(payload) {
  const targetPath = resolveScopedPathForPayload_(normalizeText_(payload.path || ''), payload);
  if (!targetPath) throw new Error('file.get requires path');

  const sharedDriveId = resolveSharedDriveId_(payload);
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const root = getRootFolderForRead_(sharedDriveId, rootFolderName);
  if (!root) {
    return { file: null };
  }

  const manifestBundle = loadManifestForRead_(root.id, sharedDriveId, rootFolderName, payload.ownerEmail || '')
    || { manifest: { pathMap: {}, revisions: {}, checksums: {} }, fileId: '' };
  const resolved = resolvePathFile_(manifestBundle.manifest, root.id, targetPath, sharedDriveId, false, false);

  if (!resolved.fileId) {
    return { file: null };
  }

  const content = readFileContent_(resolved.fileId);
  const meta = getFileMeta_(resolved.fileId);

  return {
    file: {
      path: targetPath,
      id: resolved.fileId,
      content: content,
      revision: String(meta.version || ''),
      checksum: String(meta.md5Checksum || ''),
      updatedAt: String(meta.modifiedDate || ''),
    },
  };
}

function handleFilePut_(payload) {
  const targetPath = resolveScopedPathForPayload_(normalizeText_(payload.path || ''), payload);
  if (!targetPath) throw new Error('file.put requires path');

  const content = String(payload.content == null ? '' : payload.content);
  const expectedRevision = normalizeText_(payload.expectedRevision || '');
  const sharedDriveId = resolveSharedDriveId_(payload);
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;

  const root = getOrCreateRootFolder_(sharedDriveId, rootFolderName);
  const manifestBundle = loadManifest_(root.id, sharedDriveId, rootFolderName, payload.ownerEmail || '');
  const resolved = resolvePathFile_(manifestBundle.manifest, root.id, targetPath, sharedDriveId, true, true);

  const currentMeta = getFileMeta_(resolved.fileId);
  const currentRevision = String(currentMeta.version || '');

  if (expectedRevision && currentRevision && expectedRevision !== currentRevision) {
    return {
      conflict: true,
      path: targetPath,
      currentRevision: currentRevision,
      currentChecksum: String(currentMeta.md5Checksum || ''),
      currentContent: readFileContent_(resolved.fileId),
    };
  }

  writeFileContent_(resolved.fileId, content);
  const updatedMeta = getFileMeta_(resolved.fileId);

  manifestBundle.manifest.pathMap = manifestBundle.manifest.pathMap || {};
  manifestBundle.manifest.pathMap[targetPath] = {
    id: resolved.fileId,
    revision: String(updatedMeta.version || ''),
    checksum: String(updatedMeta.md5Checksum || ''),
    updatedAt: String(updatedMeta.modifiedDate || ''),
  };
  manifestBundle.manifest.revisions = manifestBundle.manifest.revisions || {};
  manifestBundle.manifest.revisions[targetPath] = String(updatedMeta.version || '');
  manifestBundle.manifest.checksums = manifestBundle.manifest.checksums || {};
  manifestBundle.manifest.checksums[targetPath] = String(updatedMeta.md5Checksum || '');
  manifestBundle.manifest.lastUpdatedAt = new Date().toISOString();
  saveManifest_(manifestBundle.fileId, manifestBundle.manifest);

  return {
    path: targetPath,
    id: resolved.fileId,
    revision: String(updatedMeta.version || ''),
    checksum: String(updatedMeta.md5Checksum || ''),
    updatedAt: String(updatedMeta.modifiedDate || ''),
  };
}

function handleBackupAppend_(payload) {
  const entry = payload.entry || {};
  const sharedDriveId = resolveSharedDriveId_(payload);
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const requestedBy = resolveAllowlistedUserEmail_(payload);
  const userKey = userPathKeyFromEmail_(requestedBy);
  if (!userKey) {
    throw new Error('Unable to derive user key for backup append.');
  }
  const root = getOrCreateRootFolder_(sharedDriveId, rootFolderName);
  const backupFolderPath = 'backups/notes/users/' + userKey;
  const backupFolderId = ensureFolderPath_(root.id, backupFolderPath, sharedDriveId, []);

  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  const safeLabel = sanitizeFileToken_(String(entry.label || 'note-backup')).slice(0, 42);
  const fileName = timestamp + '-' + safeLabel + '.json';

  const file = insertFileSafe_({
    title: fileName,
    mimeType: 'application/json',
    parents: [{ id: backupFolderId }],
  }, Utilities.newBlob(JSON.stringify(entry, null, 2), 'application/json', fileName), sharedDriveId, root.id);
  const retention = pruneJsonFilesInFolder_(backupFolderId, sharedDriveId, BACKUP_NOTES_RETENTION_PER_USER);

  return {
    backupId: file.id,
    backupFile: file.title || file.name || fileName,
    backupFolderPath: backupFolderPath,
    retention: {
      keep: BACKUP_NOTES_RETENTION_PER_USER,
      scanned: retention.scannedCount,
      trashed: retention.trashedCount,
      errors: retention.errorCount,
    },
  };
}

function handleBackupList_(payload) {
  const sharedDriveId = resolveSharedDriveId_(payload);
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const requestedBy = resolveAllowlistedUserEmail_(payload);
  const userKey = userPathKeyFromEmail_(requestedBy);
  if (!userKey) {
    return { backups: [] };
  }
  const root = getRootFolderForRead_(sharedDriveId, rootFolderName);
  if (!root) {
    return { backups: [] };
  }

  const backupFolderPath = 'backups/notes/users/' + userKey;
  const backupFolderId = findFolderPath_(root.id, backupFolderPath, sharedDriveId);
  if (!backupFolderId) {
    return { backups: [] };
  }

  const query = "trashed=false and '" + backupFolderId + "' in parents and mimeType='application/json'";
  const params = {
    q: query,
    maxResults: 50,
    orderBy: 'modifiedDate desc',
  };

  const listed = listFilesSafe_(params, sharedDriveId);
  const items = (listed.items || []).map(function (file) {
    return {
      id: file.id,
      name: file.title || file.name,
      modifiedDate: file.modifiedDate || file.modifiedTime || '',
      version: file.version || file.etag || '',
    };
  });

  return {
    backups: items,
    backupFolderPath: backupFolderPath,
  };
}

function pruneJsonFilesInFolder_(folderId, sharedDriveId, keepCount) {
  const safeFolderId = normalizeText_(folderId || '');
  const keep = Math.max(1, Math.min(5000, Number(keepCount || 0) || 0));
  if (!safeFolderId || !keep) {
    return {
      keep: keep,
      scannedCount: 0,
      trashedCount: 0,
      errorCount: 0,
    };
  }

  const query = "trashed=false and '" + escapeQueryText_(safeFolderId) + "' in parents and mimeType='application/json'";
  const scanLimit = Math.max(keep + 200, Math.min(60000, keep * 10));
  const listed = listFilesAllSafe_({
    q: query,
    maxResults: 250,
    orderBy: 'modifiedDate desc',
  }, sharedDriveId, scanLimit);
  const overflow = listed.slice(keep);
  let trashedCount = 0;
  let errorCount = 0;

  overflow.forEach(function (item) {
    const itemId = normalizeText_((item && item.id) || '');
    if (!itemId) return;
    try {
      DriveApp.getFileById(itemId).setTrashed(true);
      trashedCount += 1;
    } catch (error) {
      errorCount += 1;
    }
  });

  return {
    keep: keep,
    scannedCount: listed.length,
    trashedCount: trashedCount,
    errorCount: errorCount,
  };
}

function handleMedRefreshRequest_(payload) {
  const sharedDriveId = resolveSharedDriveId_(payload);
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const root = getOrCreateRootFolder_(sharedDriveId, rootFolderName);
  const userEmail = resolveAllowlistedUserEmail_(payload);
  const nowIso = new Date().toISOString();
  const reason = normalizeText_(payload.reason || 'catalog-stale') || 'catalog-stale';

  const manifestBundle = loadManifest_(root.id, sharedDriveId, rootFolderName, payload.ownerEmail || '');
  const resolved = resolvePathFile_(manifestBundle.manifest, root.id, MED_REFRESH_QUEUE_PATH, sharedDriveId, true, true);
  if (!resolved.fileId) {
    throw new Error('Unable to resolve medication refresh queue file.');
  }

  const existing = readFileContent_(resolved.fileId);
  let queue = null;
  try {
    queue = existing ? JSON.parse(existing) : null;
  } catch (error) {
    queue = null;
  }

  if (!queue || typeof queue !== 'object') {
    queue = {
      generatedAt: nowIso,
      items: [],
    };
  }

  const items = Array.isArray(queue.items) ? queue.items : [];
  const entry = {
    id: 'med-refresh-' + Utilities.getUuid(),
    requestedAt: nowIso,
    userEmail: userEmail,
    reason: reason,
    source: normalizeText_((payload.client && payload.client.app) || (payload.client && payload.client.source) || 'note-builder'),
    details: payload.details && typeof payload.details === 'object' ? payload.details : {},
  };

  items.push(entry);
  queue.generatedAt = nowIso;
  queue.items = items.slice(Math.max(0, items.length - 500));

  writeFileContent_(resolved.fileId, JSON.stringify(queue, null, 2));
  const updatedMeta = getFileMeta_(resolved.fileId);

  manifestBundle.manifest.pathMap = manifestBundle.manifest.pathMap || {};
  manifestBundle.manifest.pathMap[MED_REFRESH_QUEUE_PATH] = {
    id: resolved.fileId,
    revision: String(updatedMeta.version || ''),
    checksum: String(updatedMeta.md5Checksum || ''),
    updatedAt: String(updatedMeta.modifiedDate || ''),
  };
  manifestBundle.manifest.revisions = manifestBundle.manifest.revisions || {};
  manifestBundle.manifest.revisions[MED_REFRESH_QUEUE_PATH] = String(updatedMeta.version || '');
  manifestBundle.manifest.checksums = manifestBundle.manifest.checksums || {};
  manifestBundle.manifest.checksums[MED_REFRESH_QUEUE_PATH] = String(updatedMeta.md5Checksum || '');
  manifestBundle.manifest.lastUpdatedAt = nowIso;
  saveManifest_(manifestBundle.fileId, manifestBundle.manifest);

  return {
    queued: true,
    requestId: entry.id,
    queuePath: MED_REFRESH_QUEUE_PATH,
    revision: String(updatedMeta.version || ''),
    updatedAt: String(updatedMeta.modifiedDate || ''),
  };
}

function loadManifest_(rootFolderId, sharedDriveId, rootFolderName, ownerEmail) {
  const manifestResolved = getOrCreateManifestFile_(rootFolderId, sharedDriveId);
  const existing = readFileContent_(manifestResolved.fileId);

  let manifest = null;
  try {
    manifest = existing ? JSON.parse(existing) : null;
  } catch (error) {
    manifest = null;
  }

  if (!manifest || typeof manifest !== 'object') {
    manifest = buildEmptyManifest_(rootFolderId, sharedDriveId, rootFolderName, ownerEmail);
  }

  manifest.rootFolderName = rootFolderName;
  manifest.rootFolderId = rootFolderId;
  manifest.sharedDriveId = sharedDriveId;
  if (ownerEmail) manifest.ownerEmail = normalizeText_(ownerEmail);
  manifest.paths = manifest.paths || {};
  manifest.pathMap = manifest.pathMap || {};
  manifest.checksums = manifest.checksums || {};
  manifest.revisions = manifest.revisions || {};

  return {
    manifest: manifest,
    fileId: manifestResolved.fileId,
  };
}

function loadManifestForRead_(rootFolderId, sharedDriveId, rootFolderName, ownerEmail) {
  const manifestResolved = getExistingManifestFile_(rootFolderId, sharedDriveId);
  if (!manifestResolved || !manifestResolved.fileId) {
    return null;
  }

  const existing = readFileContent_(manifestResolved.fileId);
  let manifest = null;
  try {
    manifest = existing ? JSON.parse(existing) : null;
  } catch (error) {
    manifest = null;
  }

  if (!manifest || typeof manifest !== 'object') {
    manifest = buildEmptyManifest_(rootFolderId, sharedDriveId, rootFolderName, ownerEmail);
  }

  manifest.rootFolderName = rootFolderName;
  manifest.rootFolderId = rootFolderId;
  manifest.sharedDriveId = sharedDriveId;
  if (ownerEmail) manifest.ownerEmail = normalizeText_(ownerEmail);
  manifest.paths = manifest.paths || {};
  manifest.pathMap = manifest.pathMap || {};
  manifest.checksums = manifest.checksums || {};
  manifest.revisions = manifest.revisions || {};

  return {
    manifest: manifest,
    fileId: manifestResolved.fileId,
  };
}

function buildEmptyManifest_(rootFolderId, sharedDriveId, rootFolderName, ownerEmail) {
  return {
    version: 1,
    schema: 'astra-note-builder-drive-manifest-v1',
    rootFolderName: rootFolderName,
    rootFolderId: rootFolderId,
    sharedDriveId: sharedDriveId,
    ownerEmail: normalizeText_(ownerEmail || ''),
    paths: {},
    pathMap: {},
    checksums: {},
    revisions: {},
    lastBootstrapAt: '',
    lastUpdatedAt: '',
  };
}

function saveManifest_(manifestFileId, manifest) {
  rememberManifestFileId_(manifestFileId);
  setPathIndexEntry_(MANIFEST_PATH, manifestFileId);
  writeFileContent_(manifestFileId, JSON.stringify(manifest, null, 2));
  return getFileMeta_(manifestFileId);
}

function resolvePathFile_(manifest, rootFolderId, targetPath, sharedDriveId, createIfMissing, createFolders) {
  const indexedId = getPathIndexFileId_(targetPath);
  if (indexedId) {
    try {
      const indexedMeta = getFileSafe_(indexedId);
      if ((!sharedDriveId || fileBelongsToSharedDrive_(indexedMeta, sharedDriveId))
        && isFileInsideRequiredRootScope_(indexedMeta, rootFolderId, sharedDriveId, {})) {
        return { fileId: indexedId };
      }
      clearPathIndexEntry_(targetPath);
    } catch (error) {
      clearPathIndexEntry_(targetPath);
    }
  }

  manifest.pathMap = manifest.pathMap || {};
  const mapped = manifest.pathMap[targetPath];
  if (mapped && mapped.id) {
    try {
      const mappedMeta = getFileSafe_(mapped.id);
      if ((!sharedDriveId || fileBelongsToSharedDrive_(mappedMeta, sharedDriveId))
        && isFileInsideRequiredRootScope_(mappedMeta, rootFolderId, sharedDriveId, {})) {
        setPathIndexEntry_(targetPath, mapped.id);
        return { fileId: mapped.id };
      }
      clearPathIndexEntry_(targetPath);
    } catch (error) {
      clearPathIndexEntry_(targetPath);
      // stale mapping, continue with path lookup
    }
  }

  if (!targetPath) {
    clearPathIndexEntry_(targetPath);
    return { fileId: '' };
  }

  const parts = targetPath.split('/').filter(function (part) { return Boolean(part); });
  if (!parts.length) {
    clearPathIndexEntry_(targetPath);
    throw new Error('Invalid path: ' + targetPath);
  }

  const fileName = parts.pop();
  const folderPath = parts.join('/');
  const shouldCreateFolders = createFolders !== false;
  const folderId = folderPath
    ? (shouldCreateFolders ? ensureFolderPath_(rootFolderId, folderPath, sharedDriveId, []) : findFolderPath_(rootFolderId, folderPath, sharedDriveId))
    : rootFolderId;
  if (!folderId) {
    clearPathIndexEntry_(targetPath);
    return { fileId: '' };
  }

  let file = findFileInFolder_(folderId, fileName, sharedDriveId);

  if (!file && createIfMissing) {
    file = insertFileSafe_({
      title: fileName,
      mimeType: 'text/plain',
      parents: [{ id: folderId }],
    }, Utilities.newBlob('', 'text/plain', fileName), sharedDriveId, rootFolderId);
  }

  const resolvedId = file ? String(file.id || '') : '';
  if (resolvedId) {
    setPathIndexEntry_(targetPath, resolvedId);
  } else {
    clearPathIndexEntry_(targetPath);
  }

  return {
    fileId: resolvedId,
  };
}

function findFolderPath_(rootFolderId, folderPath, sharedDriveId) {
  const segments = folderPath.split('/').filter(function (part) { return Boolean(part); });
  let parentId = rootFolderId;

  for (var i = 0; i < segments.length; i += 1) {
    const child = findFolderInParent_(parentId, segments[i], sharedDriveId);
    if (!child || !child.id) {
      return '';
    }
    parentId = child.id;
  }

  return parentId;
}

function ensureFolderPath_(rootFolderId, folderPath, sharedDriveId, createdFolders) {
  const segments = folderPath.split('/').filter(function (part) { return Boolean(part); });
  let parentId = rootFolderId;

  segments.forEach(function (segment) {
    let child = findFolderInParent_(parentId, segment, sharedDriveId);
    if (!child) {
      child = insertFileSafe_({
        title: segment,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [{ id: parentId }],
      }, null, sharedDriveId, rootFolderId);

      if (createdFolders) {
        const createdPath = folderPathUntil_(segments, segment);
        if (createdFolders.indexOf(createdPath) < 0) {
          createdFolders.push(createdPath);
        }
      }
    }

    parentId = child.id;
  });

  return parentId;
}

function folderPathUntil_(segments, segment) {
  const index = segments.lastIndexOf(segment);
  if (index < 0) return segment;
  return segments.slice(0, index + 1).join('/');
}

function findRootFolderCandidates_(rootFolderName, sharedDriveId, maxResults) {
  const escaped = escapeQueryText_(rootFolderName);
  const query = "trashed=false and mimeType='application/vnd.google-apps.folder' and title='" + escaped + "'";
  const limit = Math.max(10, Number(maxResults || 20) || 20);
  const groups = [];
  const scopedIds = {};

  try {
    const scoped = listFilesSafe_({
      q: query,
      maxResults: limit,
    }, sharedDriveId);
    const scopedItems = (scoped && scoped.items) ? scoped.items : [];
    groups.push(scopedItems);
    scopedItems.forEach(function (item) {
      const id = normalizeText_((item && item.id) || '');
      if (id) scopedIds[id] = true;
    });
  } catch (error) {
    groups.push([]);
  }

  if (sharedDriveId) {
    try {
      const unscoped = listFilesSafe_({
        q: query,
        maxResults: limit,
      }, '');
      groups.push((unscoped && unscoped.items) ? unscoped.items : []);
    } catch (error) {
      groups.push([]);
    }
  }

  const merged = mergeUniqueFilesById_(groups);
  return merged.filter(function (item) {
    if (!sharedDriveId) return true;
    const id = normalizeText_((item && item.id) || '');
    const driveId = normalizeText_((item && (item.driveId || item.teamDriveId)) || '');
    if (driveId) {
      return driveId === sharedDriveId;
    }
    if (id && scopedIds[id]) {
      return true;
    }
    return fileBelongsToSharedDrive_(item, sharedDriveId);
  });
}

function validateRequiredRootBinding_(sharedDriveId, rootFolderId) {
  const requiredRootId = normalizeText_(rootFolderId || '');
  if (!requiredRootId) {
    return {
      code: PREFLIGHT_STATUS.ROOT_ID_MISSING,
      reason: 'Script property DRIVE_SHARED_ROOT_FOLDER_ID is required.',
      rootMeta: null,
    };
  }

  let rootMeta = null;
  try {
    rootMeta = getFileSafe_(requiredRootId);
  } catch (error) {
    return {
      code: PREFLIGHT_STATUS.ROOT_ID_INVALID,
      reason: 'Configured DRIVE_SHARED_ROOT_FOLDER_ID is invalid or inaccessible: ' + String(error && error.message ? error.message : error),
      rootMeta: null,
    };
  }

  if (!rootMeta || rootMeta.mimeType !== 'application/vnd.google-apps.folder') {
    return {
      code: PREFLIGHT_STATUS.ROOT_ID_INVALID,
      reason: 'Configured DRIVE_SHARED_ROOT_FOLDER_ID does not resolve to a folder.',
      rootMeta: null,
    };
  }

  const requiredDriveId = normalizeText_(sharedDriveId || '');
  if (requiredDriveId) {
    try {
      if (!fileBelongsToSharedDrive_(rootMeta, requiredDriveId)) {
        return {
          code: PREFLIGHT_STATUS.ROOT_NOT_IN_REQUIRED_DRIVE,
          reason: 'Configured DRIVE_SHARED_ROOT_FOLDER_ID is not inside DRIVE_REQUIRED_SHARED_DRIVE_ID.',
          rootMeta: rootMeta,
        };
      }
    } catch (error) {
      return {
        code: PREFLIGHT_STATUS.SCOPE_UNVERIFIABLE,
        reason: 'Unable to verify shared-drive scope for configured root folder: ' + String(error && error.message ? error.message : error),
        rootMeta: null,
      };
    }
  }

  return {
    code: PREFLIGHT_STATUS.OK,
    reason: '',
    rootMeta: rootMeta,
  };
}

function resolveConfiguredRootFolder_(options) {
  const sharedDriveId = normalizeText_((options && options.sharedDriveId) || '');
  const rootFolderName = normalizeText_((options && options.rootFolderName) || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const requestedRootFolderId = normalizeText_((options && options.requestedRootFolderId) || '');
  const requireRootId = !(options && options.requireRootId === false);
  const configuredRootFolderId = getRequiredSharedRootFolderId_();

  if (configuredRootFolderId && requestedRootFolderId && configuredRootFolderId !== requestedRootFolderId) {
    throw new Error('Requested root folder does not match configured DRIVE_SHARED_ROOT_FOLDER_ID.');
  }

  const effectiveRootId = configuredRootFolderId || requestedRootFolderId;
  if (!effectiveRootId) {
    if (requireRootId) {
      throw new Error('DRIVE_SHARED_ROOT_FOLDER_ID is required.');
    }
    return null;
  }

  const validation = validateRequiredRootBinding_(sharedDriveId, effectiveRootId);
  if (validation.code !== PREFLIGHT_STATUS.OK || !validation.rootMeta || !validation.rootMeta.id) {
    throw new Error(validation.reason || 'Unable to resolve configured shared root folder.');
  }

  const rootMeta = validation.rootMeta;
  saveStoredRootFolder_(String(rootMeta.id), sharedDriveId, rootFolderName || String(rootMeta.title || rootMeta.name || APP_ROOT_DEFAULT));
  return rootMeta;
}

function getRootFolderForRead_(sharedDriveId, rootFolderName) {
  try {
    return resolveConfiguredRootFolder_({
      sharedDriveId: sharedDriveId,
      rootFolderName: rootFolderName,
      requireRootId: true,
    });
  } catch (error) {
    return null;
  }
}

function getOrCreateRootFolder_(sharedDriveId, rootFolderName) {
  return resolveConfiguredRootFolder_({
    sharedDriveId: sharedDriveId,
    rootFolderName: rootFolderName,
    requireRootId: true,
  });
}

function findFolderInParent_(parentId, folderName, sharedDriveId) {
  const escaped = escapeQueryText_(folderName);
  const query = "trashed=false and mimeType='application/vnd.google-apps.folder' and title='" + escaped + "' and '" + parentId + "' in parents";

  const params = {
    q: query,
    maxResults: 1,
  };

  try {
    const listed = listFilesSafe_(params, sharedDriveId);
    if (listed.items && listed.items.length) {
      return listed.items[0];
    }
  } catch (error) {
    // fall through to DriveApp fallback
  }

  if (sharedDriveId) {
    try {
      const unscoped = listFilesSafe_(params, '');
      const items = (unscoped && unscoped.items) ? unscoped.items : [];
      for (var i = 0; i < items.length; i += 1) {
        if (fileBelongsToSharedDrive_(items[i], sharedDriveId)) {
          return items[i];
        }
      }
    } catch (error) {
      // continue to DriveApp fallback
    }
  }

  return findFolderViaDriveApp_(parentId, folderName);
}

function findFileInFolder_(folderId, fileName, sharedDriveId) {
  const escaped = escapeQueryText_(fileName);
  const query = "trashed=false and title='" + escaped + "' and '" + folderId + "' in parents";

  const params = {
    q: query,
    maxResults: 1,
  };

  try {
    const listed = listFilesSafe_(params, sharedDriveId);
    if (listed.items && listed.items.length) {
      return listed.items[0];
    }
  } catch (error) {
    // fall through to DriveApp fallback
  }

  if (sharedDriveId) {
    try {
      const unscoped = listFilesSafe_(params, '');
      const items = (unscoped && unscoped.items) ? unscoped.items : [];
      for (var i = 0; i < items.length; i += 1) {
        if (fileBelongsToSharedDrive_(items[i], sharedDriveId)) {
          return items[i];
        }
      }
    } catch (error) {
      // continue to DriveApp fallback
    }
  }

  return findFileViaDriveApp_(folderId, fileName);
}

function findFolderViaDriveApp_(parentId, folderName) {
  try {
    const parent = DriveApp.getFolderById(parentId);
    const iter = parent.getFoldersByName(folderName);
    if (iter.hasNext()) {
      return getFileSafe_(iter.next().getId());
    }
  } catch (error) {
    // ignore lookup fallback errors and return null
  }
  return null;
}

function findFileViaDriveApp_(folderId, fileName) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const iter = folder.getFilesByName(fileName);
    if (iter.hasNext()) {
      return getFileSafe_(iter.next().getId());
    }
  } catch (error) {
    // ignore lookup fallback errors and return null
  }
  return null;
}

function readFileContent_(fileId) {
  return DriveApp.getFileById(fileId).getBlob().getDataAsString('utf-8');
}

function writeFileContent_(fileId, text) {
  DriveApp.getFileById(fileId).setContent(String(text || ''));
}

function getFileMeta_(fileId) {
  return getFileSafe_(fileId);
}

function getFileSafe_(fileId) {
  const fields = 'id,title,name,mimeType,parents,driveId,teamDriveId,createdDate,createdTime,modifiedDate,modifiedTime,version,md5Checksum';
  const variants = [
    { supportsAllDrives: true, fields: fields },
    { supportsTeamDrives: true, fields: fields },
    { fields: fields },
    { supportsAllDrives: true },
    { supportsTeamDrives: true },
    {},
  ];

  let lastError = null;
  for (var i = 0; i < variants.length; i += 1) {
    try {
      return Drive.Files.get(fileId, variants[i]);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to fetch Drive file metadata.');
}

function insertFileSafe_(resource, blobOrNull, sharedDriveId, expectedRootFolderId) {
  const normalizedResource = normalizeInsertResource_(resource);
  const expectedSharedDriveId = normalizeText_(sharedDriveId || '');
  const requiredRootId = normalizeText_(expectedRootFolderId || getRequiredSharedRootFolderId_() || '');
  let lastError = null;

  if (Drive.Files.insert) {
    try {
      const created = Drive.Files.insert(normalizedResource, blobOrNull, { supportsAllDrives: true });
      if (isCreatedFileInExpectedScope_(created, expectedSharedDriveId, requiredRootId)) {
        return created;
      }
      moveFileToTrashSafe_(created && created.id);
      lastError = new Error('Created file resolved outside expected shared-drive root scope.');
    } catch (allDrivesError) {
      lastError = allDrivesError;
      try {
        const createdLegacy = Drive.Files.insert(normalizedResource, blobOrNull, { supportsTeamDrives: true });
        if (isCreatedFileInExpectedScope_(createdLegacy, expectedSharedDriveId, requiredRootId)) {
          return createdLegacy;
        }
        moveFileToTrashSafe_(createdLegacy && createdLegacy.id);
        lastError = new Error('Created file resolved outside expected shared-drive root scope.');
      } catch (teamDriveError) {
        lastError = teamDriveError;
      }
    }

    if (!expectedSharedDriveId && !requiredRootId) {
      try {
        return Drive.Files.insert(normalizedResource, blobOrNull);
      } catch (plainInsertError) {
        lastError = plainInsertError;
      }
    }
  }

  if (Drive.Files.create) {
    try {
      const created = Drive.Files.create(normalizedResource, blobOrNull, { supportsAllDrives: true });
      if (isCreatedFileInExpectedScope_(created, expectedSharedDriveId, requiredRootId)) {
        return created;
      }
      moveFileToTrashSafe_(created && created.id);
      lastError = new Error('Created file resolved outside expected shared-drive root scope.');
    } catch (allDrivesError) {
      lastError = allDrivesError;
      try {
        const createdLegacy = Drive.Files.create(normalizedResource, blobOrNull, { supportsTeamDrives: true });
        if (isCreatedFileInExpectedScope_(createdLegacy, expectedSharedDriveId, requiredRootId)) {
          return createdLegacy;
        }
        moveFileToTrashSafe_(createdLegacy && createdLegacy.id);
        lastError = new Error('Created file resolved outside expected shared-drive root scope.');
      } catch (teamDriveError) {
        lastError = teamDriveError;
      }
    }

    if (!expectedSharedDriveId && !requiredRootId) {
      try {
        return Drive.Files.create(normalizedResource, blobOrNull);
      } catch (plainCreateError) {
        lastError = plainCreateError;
      }
    }
  }

  if (expectedSharedDriveId || requiredRootId) {
    throw new Error('Unable to create file in required shared drive scope. ' + String(lastError && lastError.message ? lastError.message : lastError || 'Unknown Drive API error.'));
  }

  throw lastError || new Error('No supported Drive file creation method is available.');
}

function isCreatedFileInExpectedScope_(file, sharedDriveId, rootFolderId) {
  const expectedRootId = normalizeText_(rootFolderId || '');
  const expectedDriveId = normalizeText_(sharedDriveId || '');
  if (!expectedDriveId && !expectedRootId) return true;

  const fileId = normalizeText_((file && file.id) || '');
  if (!fileId) return false;

  let hydrated = null;
  try {
    hydrated = getFileSafe_(fileId);
  } catch (error) {
    return false;
  }

  if (!isCreatedFileInExpectedDrive_(hydrated, expectedDriveId)) {
    return false;
  }

  if (!expectedRootId) {
    return true;
  }

  return isFileInsideRequiredRootScope_(hydrated, expectedRootId, expectedDriveId, {});
}

function isCreatedFileInExpectedDrive_(file, sharedDriveId) {
  const expected = normalizeText_(sharedDriveId || '');
  if (!expected) return true;

  return Boolean(file && fileBelongsToSharedDrive_(file, expected));
}

function isFileInsideRequiredRootScope_(file, requiredRootFolderId, sharedDriveId, visitedIds) {
  const rootId = normalizeText_(requiredRootFolderId || '');
  if (!rootId) return true;

  const currentId = normalizeText_((file && file.id) || '');
  if (!currentId) return false;
  if (currentId === rootId) return true;

  const seen = visitedIds || {};
  if (seen[currentId]) return false;
  seen[currentId] = true;

  const parentIds = getFileParentIds_(file);
  if (!parentIds.length) {
    return false;
  }
  if (parentIds.indexOf(rootId) >= 0) {
    return true;
  }

  for (var i = 0; i < parentIds.length; i += 1) {
    const parentId = parentIds[i];
    if (!parentId || seen[parentId]) continue;
    if (parentId === rootId) return true;
    try {
      const parentMeta = getFileSafe_(parentId);
      if (sharedDriveId && !fileBelongsToSharedDrive_(parentMeta, sharedDriveId)) {
        continue;
      }
      if (isFileInsideRequiredRootScope_(parentMeta, rootId, sharedDriveId, seen)) {
        return true;
      }
    } catch (error) {
      // best-effort ancestry walk
    }
  }

  return false;
}

function moveFileToTrashSafe_(fileId) {
  const safeId = normalizeText_(fileId || '');
  if (!safeId) return;

  try {
    DriveApp.getFileById(safeId).setTrashed(true);
  } catch (error) {
    // best-effort rollback only
  }
}

function normalizeInsertResource_(resource) {
  const normalized = cloneObject_(resource || {});
  const title = normalizeText_(normalized.title || '');
  const name = normalizeText_(normalized.name || '');

  if (title && !name) {
    normalized.name = title;
  } else if (name && !title) {
    normalized.title = name;
  }

  return normalized;
}

function listFilesAllSafe_(params, sharedDriveId, maxItems) {
  const limit = Math.max(1, Math.min(60000, Number(maxItems || 20000) || 20000));
  const base = cloneObject_(params || {});
  const pageSizeHint = Math.max(50, Math.min(1000, Number(base.maxResults || 250) || 250));
  delete base.pageToken;
  const out = [];
  let pageToken = '';

  while (out.length < limit) {
    const nextParams = cloneObject_(base);
    nextParams.maxResults = Math.min(pageSizeHint, limit - out.length);
    if (pageToken) {
      nextParams.pageToken = pageToken;
    }

    const listed = listFilesSafe_(nextParams, sharedDriveId);
    const items = listed && Array.isArray(listed.items) ? listed.items : [];
    if (items.length) {
      out.push.apply(out, items.slice(0, limit - out.length));
    }

    pageToken = normalizeText_((listed && listed.nextPageToken) || '');
    if (!pageToken || !items.length) {
      break;
    }
  }

  return out;
}

function listFilesSafe_(params, sharedDriveId) {
  const base = {};
  Object.keys(params || {}).forEach(function (key) {
    base[key] = params[key];
  });

  const variants = [];

  const v2All = cloneObject_(base);
  if (sharedDriveId) {
    v2All.corpora = 'drive';
    v2All.driveId = sharedDriveId;
  }
  v2All.includeItemsFromAllDrives = true;
  v2All.supportsAllDrives = true;
  variants.push(v2All);

  const v2Legacy = cloneObject_(base);
  if (sharedDriveId) {
    v2Legacy.corpora = 'drive';
    v2Legacy.teamDriveId = sharedDriveId;
  }
  v2Legacy.includeTeamDriveItems = true;
  v2Legacy.supportsTeamDrives = true;
  variants.push(v2Legacy);

  const v3All = toV3ListParams_(base, sharedDriveId, true);
  variants.push(v3All);

  if (!sharedDriveId) {
    const v3NoDrive = toV3ListParams_(base, '', false);
    variants.push(v3NoDrive);

    const plain = cloneObject_(base);
    variants.push(plain);
  }

  let lastError = null;
  let firstSuccess = null;

  for (var i = 0; i < variants.length; i += 1) {
    try {
      const result = Drive.Files.list(variants[i]);
      const normalized = normalizeListResult_(result);
      if (!firstSuccess) {
        firstSuccess = normalized;
      }
      if (normalized.items && normalized.items.length) {
        return normalized;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (firstSuccess) {
    return firstSuccess;
  }

  throw lastError || new Error('Unable to list files with provided parameters.');
}

function cloneObject_(source) {
  const out = {};
  Object.keys(source || {}).forEach(function (key) {
    out[key] = source[key];
  });
  return out;
}

function toV3ListParams_(baseParams, sharedDriveId, includeDriveScope) {
  const converted = cloneObject_(baseParams || {});

  if (Object.prototype.hasOwnProperty.call(converted, 'maxResults')) {
    converted.pageSize = converted.maxResults;
    delete converted.maxResults;
  }

  if (converted.orderBy === 'modifiedDate desc') {
    converted.orderBy = 'modifiedTime desc';
  }

  if (typeof converted.q === 'string') {
    converted.q = converted.q.replace(/\btitle\b/g, 'name');
  }

  if (includeDriveScope && sharedDriveId) {
    converted.corpora = 'drive';
    converted.driveId = sharedDriveId;
  } else {
    delete converted.corpora;
    delete converted.driveId;
    delete converted.teamDriveId;
  }

  converted.includeItemsFromAllDrives = true;
  converted.supportsAllDrives = true;

  return converted;
}

function normalizeListResult_(result) {
  if (!result) return { items: [] };
  if (!result.items && result.files) {
    result.items = result.files;
  }
  if (!result.items) {
    result.items = [];
  }
  return result;
}

function selectStableFolder_(items) {
  const candidates = (items || []).slice();
  candidates.sort(function (a, b) {
    const createdA = String(a.createdDate || a.createdTime || '');
    const createdB = String(b.createdDate || b.createdTime || '');
    if (createdA !== createdB) {
      return createdA < createdB ? -1 : 1;
    }
    const idA = String(a.id || '');
    const idB = String(b.id || '');
    if (idA === idB) return 0;
    return idA < idB ? -1 : 1;
  });
  return candidates[0];
}

function getStoredRootFolder_(sharedDriveId, rootFolderName) {
  const props = PropertiesService.getScriptProperties();
  const storedId = normalizeText_(props.getProperty(ROOT_FOLDER_ID_PROPERTY) || '');
  if (!storedId) return null;

  const storedName = normalizeText_(props.getProperty(ROOT_FOLDER_NAME_PROPERTY) || '');
  if (storedName && storedName !== normalizeText_(rootFolderName || '')) {
    return null;
  }

  const storedDriveId = normalizeText_(props.getProperty(ROOT_SHARED_DRIVE_ID_PROPERTY) || '');
  if (sharedDriveId && storedDriveId && sharedDriveId !== storedDriveId) {
    return null;
  }

  try {
    const file = getFileSafe_(storedId);
    if (!file || file.mimeType !== 'application/vnd.google-apps.folder') {
      clearStoredRootFolder_();
      return null;
    }

    if (sharedDriveId) {
      // When the cached drive ID matches the required drive, trust the pinned root.
      // Some Drive API variants omit driveId/teamDriveId for folders in responses.
      if (storedDriveId && storedDriveId === sharedDriveId) {
        return file;
      }

      if (!fileBelongsToSharedDrive_(file, sharedDriveId)) {
        clearStoredRootFolder_();
        return null;
      }
    }

    return file;
  } catch (error) {
    clearStoredRootFolder_();
    return null;
  }
}

function saveStoredRootFolder_(folderId, sharedDriveId, rootFolderName) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty(ROOT_FOLDER_ID_PROPERTY, normalizeText_(folderId || ''));
  props.setProperty(ROOT_FOLDER_NAME_PROPERTY, normalizeText_(rootFolderName || APP_ROOT_DEFAULT));
  props.setProperty(ROOT_SHARED_DRIVE_ID_PROPERTY, normalizeText_(sharedDriveId || ''));
}

function clearStoredRootFolder_() {
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty(ROOT_FOLDER_ID_PROPERTY);
  props.deleteProperty(ROOT_FOLDER_NAME_PROPERTY);
  props.deleteProperty(ROOT_SHARED_DRIVE_ID_PROPERTY);
}

function fileBelongsToSharedDrive_(file, sharedDriveId, visitedIds) {
  const normalizedDriveId = normalizeText_(sharedDriveId || '');
  if (!normalizedDriveId) return true;

  const fileDriveId = normalizeText_((file && (file.driveId || file.teamDriveId)) || '');
  if (fileDriveId) {
    return fileDriveId === normalizedDriveId;
  }

  const seen = visitedIds || {};
  const currentId = normalizeText_((file && file.id) || '');
  if (currentId) {
    if (seen[currentId]) return false;
    seen[currentId] = true;
  }

  const storedRootId = normalizeText_(PropertiesService.getScriptProperties().getProperty(ROOT_FOLDER_ID_PROPERTY) || '');
  const parentIds = getFileParentIds_(file);

  if (!parentIds.length) {
    return Boolean(currentId && storedRootId && currentId === storedRootId);
  }

  if (parentIds.indexOf(normalizedDriveId) >= 0) {
    return true;
  }
  if (storedRootId && parentIds.indexOf(storedRootId) >= 0) {
    return true;
  }

  for (var i = 0; i < parentIds.length; i += 1) {
    const parentId = parentIds[i];
    if (!parentId || seen[parentId]) continue;

    if (storedRootId && parentId === storedRootId) {
      return true;
    }

    try {
      const parentMeta = getFileSafe_(parentId);
      if (parentMeta && fileBelongsToSharedDrive_(parentMeta, normalizedDriveId, seen)) {
        return true;
      }
    } catch (error) {
      // best-effort ancestry check; continue scanning parents
    }
  }

  return false;
}

function getOrCreateManifestFile_(rootFolderId, sharedDriveId) {
  const existing = getExistingManifestFile_(rootFolderId, sharedDriveId);
  if (existing && existing.fileId) {
    return existing;
  }

  const resolved = resolvePathFile_({ pathMap: {} }, rootFolderId, MANIFEST_PATH, sharedDriveId, true, true);
  if (!resolved.fileId) {
    throw new Error('Unable to create or resolve drive manifest file.');
  }
  rememberManifestFileId_(resolved.fileId);
  return resolved;
}

function getExistingManifestFile_(rootFolderId, sharedDriveId) {
  const props = PropertiesService.getScriptProperties();
  const storedManifestId = normalizeText_(props.getProperty(MANIFEST_FILE_ID_PROPERTY) || '');
  if (storedManifestId) {
    try {
      const meta = getFileSafe_(storedManifestId);
      if (meta && meta.mimeType !== 'application/vnd.google-apps.folder') {
        // If a shared drive is configured, prefer same-drive manifest.
        if ((!sharedDriveId || fileBelongsToSharedDrive_(meta, sharedDriveId))
          && isFileInsideRequiredRootScope_(meta, rootFolderId, sharedDriveId, {})) {
          return { fileId: storedManifestId };
        }
      }
      clearManifestFileId_();
    } catch (error) {
      clearManifestFileId_();
    }
  }

  const indexedManifestId = getPathIndexFileId_(MANIFEST_PATH);
  if (indexedManifestId) {
    try {
      const meta = getFileSafe_(indexedManifestId);
      if (meta && meta.mimeType !== 'application/vnd.google-apps.folder') {
        if ((!sharedDriveId || fileBelongsToSharedDrive_(meta, sharedDriveId))
          && isFileInsideRequiredRootScope_(meta, rootFolderId, sharedDriveId, {})) {
          rememberManifestFileId_(indexedManifestId);
          return { fileId: indexedManifestId };
        }
      }
      clearPathIndexEntry_(MANIFEST_PATH);
    } catch (error) {
      clearPathIndexEntry_(MANIFEST_PATH);
    }
  }

  const resolved = resolvePathFile_({ pathMap: {} }, rootFolderId, MANIFEST_PATH, sharedDriveId, false, false);
  if (!resolved.fileId) {
    return { fileId: '' };
  }
  rememberManifestFileId_(resolved.fileId);
  return resolved;
}

function rememberManifestFileId_(fileId) {
  const safeId = normalizeText_(fileId || '');
  if (!safeId) return;
  PropertiesService.getScriptProperties().setProperty(MANIFEST_FILE_ID_PROPERTY, safeId);
}

function clearManifestFileId_() {
  PropertiesService.getScriptProperties().deleteProperty(MANIFEST_FILE_ID_PROPERTY);
}

function loadPathIndex_() {
  const props = PropertiesService.getScriptProperties();
  const raw = String(props.getProperty(PATH_INDEX_PROPERTY) || '').trim();
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    return parsed;
  } catch (error) {
    return {};
  }
}

function savePathIndex_(index) {
  const props = PropertiesService.getScriptProperties();
  const safe = index && typeof index === 'object' ? index : {};
  const keys = Object.keys(safe);
  if (keys.length > 120) {
    keys.sort();
    while (keys.length > 120) {
      const dropKey = keys.shift();
      delete safe[dropKey];
    }
  }

  props.setProperty(PATH_INDEX_PROPERTY, JSON.stringify(safe));
}

function getPathIndexFileId_(targetPath) {
  const safePath = normalizeText_(targetPath || '');
  if (!safePath) return '';
  const index = loadPathIndex_();
  return normalizeText_(index[safePath] || '');
}

function setPathIndexEntry_(targetPath, fileId) {
  const safePath = normalizeText_(targetPath || '');
  const safeId = normalizeText_(fileId || '');
  if (!safePath || !safeId) return;

  const index = loadPathIndex_();
  if (index[safePath] === safeId) return;
  index[safePath] = safeId;
  savePathIndex_(index);
}

function clearPathIndexEntry_(targetPath) {
  const safePath = normalizeText_(targetPath || '');
  if (!safePath) return;

  const index = loadPathIndex_();
  if (!Object.prototype.hasOwnProperty.call(index, safePath)) return;
  delete index[safePath];
  savePathIndex_(index);
}

function resolveSharedDriveId_(payload) {
  const incoming = normalizeText_((payload && payload.sharedDriveId) || '');
  const required = getRequiredSharedDriveId_();
  if (!required) {
    return incoming;
  }

  if (incoming && incoming !== required) {
    throw new Error('Configured sharedDriveId does not match required shared drive.');
  }

  return required;
}

function getRequiredSharedDriveId_() {
  return normalizeText_(PropertiesService.getScriptProperties().getProperty(REQUIRED_SHARED_DRIVE_ID_PROPERTY) || '');
}

function getRequiredSharedRootFolderId_() {
  return normalizeText_(PropertiesService.getScriptProperties().getProperty(REQUIRED_SHARED_ROOT_FOLDER_ID_PROPERTY) || '');
}

function getServiceToken_() {
  const props = PropertiesService.getScriptProperties();
  return normalizeText_(props.getProperty(SERVICE_TOKEN_PROPERTY) || props.getProperty(LEGACY_OWNER_TOKEN_PROPERTY) || '');
}

function hasValidServiceToken_(payload) {
  const fromPayload = normalizeText_((payload && (payload.serviceToken || payload.ownerToken)) || '');
  const fromProps = getServiceToken_();
  return Boolean(fromPayload && fromProps && fromPayload === fromProps);
}

function getAllowedUserEmails_() {
  const raw = normalizeText_(PropertiesService.getScriptProperties().getProperty(ALLOWED_USER_EMAILS_PROPERTY) || '');
  if (!raw) return [];

  const tokens = raw.split(/[\s,;\n\r]+/g).map(function (entry) {
    return normalizeEmail_(entry);
  }).filter(Boolean);

  return Array.from(new Set(tokens));
}

function ensureDefaultAllowlist_() {
  const props = PropertiesService.getScriptProperties();
  const existing = getAllowedUserEmails_();
  if (existing.length) return existing;

  props.setProperty(ALLOWED_USER_EMAILS_PROPERTY, DEFAULT_ALLOWED_USER_EMAILS.join(','));
  return DEFAULT_ALLOWED_USER_EMAILS.slice();
}

function normalizeEmail_(value) {
  return normalizeText_(value || '').toLowerCase();
}

function resolveEffectiveUserEmail_(payload) {
  const active = normalizeEmail_(Session.getActiveUser().getEmail() || '');
  if (active) return active;

  const userFromPayload = normalizeEmail_((payload && payload.userEmail) || '');
  if (userFromPayload) return userFromPayload;

  return normalizeEmail_((payload && payload.ownerEmail) || '');
}

function isEmailAllowlisted_(email) {
  const normalized = normalizeEmail_(email || '');
  if (!normalized) return false;
  const allowlist = ensureDefaultAllowlist_();
  return allowlist.indexOf(normalized) >= 0;
}

function resolveAllowlistedUserEmail_(payload) {
  const resolved = resolveEffectiveUserEmail_(payload);
  if (!resolved) {
    throw new Error('userEmail is required when session email is unavailable.');
  }

  if (!isEmailAllowlisted_(resolved)) {
    throw new Error('User is not in DRIVE_ALLOWED_USER_EMAILS allowlist.');
  }

  return resolved;
}

function userPathKeyFromEmail_(email) {
  return normalizeEmail_(email)
    .replace(/[^a-z0-9@._-]/g, '')
    .replace(/@/g, '-at-')
    .replace(/\./g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isPatientDraftPath_(path) {
  const normalized = normalizeText_(path || '');
  return normalized === PATIENT_DRAFT_CURRENT_PATH
    || normalized === PATIENT_DRAFT_RECENT_PATH
    || normalized.indexOf(PATIENT_DRAFT_USERS_PREFIX) === 0;
}

function isAllowlistedWritePath_(path) {
  const normalized = normalizeText_(path || '');
  if (!normalized) return false;

  if (isPatientDraftPath_(normalized)) {
    return true;
  }

  return normalized.indexOf('data/') === 0
    || normalized.indexOf('config/') === 0
    || normalized.indexOf('logs/') === 0
    || normalized.indexOf('app-shell/') === 0
    || normalized.indexOf('backups/') === 0;
}

function resolveScopedPathForPayload_(path, payload) {
  const normalized = normalizeText_(path || '');
  if (!isPatientDraftPath_(normalized)) {
    return normalized;
  }

  const userEmail = resolveAllowlistedUserEmail_(payload);
  const userKey = userPathKeyFromEmail_(userEmail);
  if (!userKey) {
    throw new Error('Unable to derive user path key from user email.');
  }

  const currentScopedPath = PATIENT_DRAFT_USERS_PREFIX + userKey + '/current.json';
  const recentScopedPath = PATIENT_DRAFT_USERS_PREFIX + userKey + '/recent-patients.json';

  if (normalized === PATIENT_DRAFT_CURRENT_PATH) {
    return currentScopedPath;
  }
  if (normalized === PATIENT_DRAFT_RECENT_PATH) {
    return recentScopedPath;
  }

  // Path already scoped: enforce same-user access.
  if (normalized.indexOf(currentScopedPath) === 0 || normalized.indexOf(recentScopedPath) === 0) {
    return normalized;
  }

  throw new Error('Patient draft path is scoped to a different user.');
}

function toFolderUrl_(id) {
  const safeId = normalizeText_(id || '');
  return safeId ? 'https://drive.google.com/drive/folders/' + safeId : '';
}

function toFileUrl_(id) {
  const safeId = normalizeText_(id || '');
  return safeId ? 'https://drive.google.com/file/d/' + safeId + '/view' : '';
}

function sanitizeFileToken_(value) {
  return String(value || '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function escapeQueryText_(value) {
  return String(value || '').replace(/'/g, "\\'");
}

function normalizeText_(value) {
  return String(value || '').trim();
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
