const APP_ROOT_DEFAULT = 'Astra Clinical Note Builder';
const MANIFEST_PATH = 'config/drive-manifest.json';
const MED_REFRESH_QUEUE_PATH = 'logs/sync/med-refresh-requests.json';
const PATIENT_DRAFT_CURRENT_PATH = 'data/draft/current.json';
const PATIENT_DRAFT_RECENT_PATH = 'data/draft/recent-patients.json';
const PATIENT_DRAFT_USERS_PREFIX = 'data/draft/users/';
const ROOT_FOLDER_ID_PROPERTY = 'DRIVE_ROOT_FOLDER_ID';
const ROOT_FOLDER_NAME_PROPERTY = 'DRIVE_ROOT_FOLDER_NAME';
const ROOT_SHARED_DRIVE_ID_PROPERTY = 'DRIVE_ROOT_SHARED_DRIVE_ID';
const MANIFEST_FILE_ID_PROPERTY = 'DRIVE_MANIFEST_FILE_ID';
const REQUIRED_SHARED_DRIVE_ID_PROPERTY = 'DRIVE_REQUIRED_SHARED_DRIVE_ID';
const ALLOWED_USER_EMAILS_PROPERTY = 'DRIVE_ALLOWED_USER_EMAILS';
const SERVICE_TOKEN_PROPERTY = 'DRIVE_SERVICE_TOKEN';
const LEGACY_OWNER_TOKEN_PROPERTY = 'DRIVE_OWNER_TOKEN';
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
    case 'root.audit':
      return handleRootAudit_(payload);
    case 'mydrive.condense':
      return handleMyDriveCondense_(payload);
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
    'mydrive.condense': true,
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
  return {
    timestamp: new Date().toISOString(),
    owner: normalizeText_(payload.ownerEmail || '') || normalizeText_(PropertiesService.getScriptProperties().getProperty('DRIVE_OWNER_EMAIL') || ''),
    tokenConfigured: tokenConfigured,
    requiredSharedDriveId: getRequiredSharedDriveId_(),
    allowlistedUsers: allowlist,
    runtime: 'google-apps-script',
  };
}

function handleBootstrap_(payload) {
  const sharedDriveId = resolveSharedDriveId_(payload);
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  ensureDefaultAllowlist_();

  const root = getOrCreateRootFolder_(sharedDriveId, rootFolderName);
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
  const canonical = expectedMatches.length ? selectStableRootAuditItem_(expectedMatches) : null;

  return {
    rootFolderName: rootFolderName,
    requiredSharedDriveId: requiredSharedDriveId,
    expectedSharedDriveId: expectedDriveId,
    canonicalRoot: canonical || null,
    duplicateRoots: roots.filter(function (item) {
      return canonical ? item.id !== canonical.id : true;
    }),
    allRoots: roots,
  };
}

function handleMyDriveCondense_(payload) {
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const archiveFolderName = normalizeText_(payload.archiveFolderName || ('Astra Personal Drive Cleanup ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd'))) || 'Astra Personal Drive Cleanup';
  const dryRun = payload && (payload.dryRun === true || normalizeText_(payload.dryRun || '') === 'true');

  const archiveFolder = getOrCreateMyDriveFolder_(archiveFolderName);
  const candidates = findMyDriveCleanupCandidates_(rootFolderName, archiveFolder.getId());
  const moved = [];
  const errors = [];

  if (!dryRun) {
    candidates.forEach(function (item) {
      try {
        const folder = DriveApp.getFolderById(item.id);
        folder.moveTo(archiveFolder);
        moved.push(item);
      } catch (error) {
        errors.push({
          id: item.id,
          name: item.name,
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
    candidates: candidates,
    moved: moved,
    errors: errors,
  };
}

function getOrCreateMyDriveFolder_(folderName) {
  const root = DriveApp.getRootFolder();
  const existing = root.getFoldersByName(folderName);
  if (existing.hasNext()) {
    return existing.next();
  }
  return root.createFolder(folderName);
}

function findMyDriveCleanupCandidates_(rootFolderName, archiveFolderId) {
  const query = "trashed=false and mimeType='application/vnd.google-apps.folder' and 'root' in parents";
  const listed = listFilesSafe_({ q: query, maxResults: 500 }, '');
  const items = listed.items || [];

  return items
    .filter(function (item) {
      const driveId = normalizeText_((item && (item.driveId || item.teamDriveId)) || '');
      return !driveId;
    })
    .map(function (item) {
      return {
        id: String(item.id || ''),
        name: String(item.title || item.name || ''),
        createdAt: String(item.createdDate || item.createdTime || ''),
        modifiedAt: String(item.modifiedDate || item.modifiedTime || ''),
        url: toFolderUrl_(item.id),
      };
    })
    .filter(function (item) {
      if (!item.id || item.id === archiveFolderId) return false;
      if (normalizeText_(item.name) === normalizeText_(rootFolderName)) return true;
      if (!isUntitledLikeName_(item.name)) return false;
      return isLikelyAppRootFolder_(item.id);
    });
}

function isUntitledLikeName_(name) {
  const normalized = normalizeText_(name || '').toLowerCase();
  return normalized === 'untitled'
    || normalized === 'untitled folder'
    || normalized === 'untitled document'
    || normalized.indexOf('untitled-') === 0;
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
  const root = getOrCreateRootFolder_(sharedDriveId, rootFolderName);

  const backupFolderId = ensureFolderPath_(root.id, 'backups/notes', sharedDriveId, []);

  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  const safeLabel = sanitizeFileToken_(String(entry.label || 'note-backup')).slice(0, 42);
  const fileName = timestamp + '-' + safeLabel + '.json';

  const file = insertFileSafe_({
    title: fileName,
    mimeType: 'application/json',
    parents: [{ id: backupFolderId }],
  }, Utilities.newBlob(JSON.stringify(entry, null, 2), 'application/json', fileName));

  return {
    backupId: file.id,
    backupFile: file.title || file.name || fileName,
  };
}

function handleBackupList_(payload) {
  const sharedDriveId = resolveSharedDriveId_(payload);
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const root = getRootFolderForRead_(sharedDriveId, rootFolderName);
  if (!root) {
    return { backups: [] };
  }

  const backupFolderId = findFolderPath_(root.id, 'backups/notes', sharedDriveId);
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

  return { backups: items };
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
  writeFileContent_(manifestFileId, JSON.stringify(manifest, null, 2));
  return getFileMeta_(manifestFileId);
}

function resolvePathFile_(manifest, rootFolderId, targetPath, sharedDriveId, createIfMissing, createFolders) {
  manifest.pathMap = manifest.pathMap || {};
  const mapped = manifest.pathMap[targetPath];
  if (mapped && mapped.id) {
    try {
      getFileSafe_(mapped.id);
      return { fileId: mapped.id };
    } catch (error) {
      // stale mapping, continue with path lookup
    }
  }

  const parts = targetPath.split('/').filter(function (part) { return Boolean(part); });
  if (!parts.length) throw new Error('Invalid path: ' + targetPath);

  const fileName = parts.pop();
  const folderPath = parts.join('/');
  const shouldCreateFolders = createFolders !== false;
  const folderId = folderPath
    ? (shouldCreateFolders ? ensureFolderPath_(rootFolderId, folderPath, sharedDriveId, []) : findFolderPath_(rootFolderId, folderPath, sharedDriveId))
    : rootFolderId;
  if (!folderId) {
    return { fileId: '' };
  }

  let file = findFileInFolder_(folderId, fileName, sharedDriveId);

  if (!file && createIfMissing) {
    file = insertFileSafe_({
      title: fileName,
      mimeType: 'text/plain',
      parents: [{ id: folderId }],
    }, Utilities.newBlob('', 'text/plain', fileName));
  }

  return {
    fileId: file ? file.id : '',
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
      }, null);

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

function getRootFolderForRead_(sharedDriveId, rootFolderName) {
  const storedRoot = getStoredRootFolder_(sharedDriveId, rootFolderName);
  if (storedRoot) {
    return storedRoot;
  }

  const escaped = escapeQueryText_(rootFolderName);
  let query = "trashed=false and mimeType='application/vnd.google-apps.folder' and title='" + escaped + "'";
  if (sharedDriveId) {
    query += " and '" + sharedDriveId + "' in parents";
  }

  const listed = listFilesSafe_({
    q: query,
    maxResults: 20,
  }, sharedDriveId);
  const candidates = (listed.items || []).filter(function (item) {
    return !sharedDriveId || fileBelongsToSharedDrive_(item, sharedDriveId);
  });

  if (!candidates.length) {
    return null;
  }

  const selected = selectStableFolder_(candidates);
  saveStoredRootFolder_(selected.id, sharedDriveId, rootFolderName);
  return selected;
}

function getOrCreateRootFolder_(sharedDriveId, rootFolderName) {
  const storedRoot = getRootFolderForRead_(sharedDriveId, rootFolderName);
  if (storedRoot) {
    return storedRoot;
  }

  const escaped = escapeQueryText_(rootFolderName);
  let query = "trashed=false and mimeType='application/vnd.google-apps.folder' and title='" + escaped + "'";
  if (sharedDriveId) {
    query += " and '" + sharedDriveId + "' in parents";
  }

  const params = {
    q: query,
    maxResults: 10,
  };

  const listed = listFilesSafe_(params, sharedDriveId);
  const candidates = (listed.items || []).filter(function (item) {
    return !sharedDriveId || fileBelongsToSharedDrive_(item, sharedDriveId);
  });

  if (candidates.length) {
    const selected = selectStableFolder_(candidates);
    saveStoredRootFolder_(selected.id, sharedDriveId, rootFolderName);
    return selected;
  }

  try {
    const resource = {
      title: rootFolderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (sharedDriveId) {
      resource.parents = [{ id: sharedDriveId }];
    }

    const created = insertFileSafe_(resource, null);
    saveStoredRootFolder_(created.id, sharedDriveId, rootFolderName);
    return created;
  } catch (error) {
    if (sharedDriveId) {
      throw new Error('Unable to create root folder inside shared drive. Verify DRIVE root shared drive access and ID.');
    }
    const fallback = DriveApp.createFolder(rootFolderName);
    const fallbackMeta = getFileSafe_(fallback.getId());
    saveStoredRootFolder_(fallbackMeta.id, sharedDriveId, rootFolderName);
    return fallbackMeta;
  }
}

function findFolderInParent_(parentId, folderName, sharedDriveId) {
  const escaped = escapeQueryText_(folderName);
  const query = "trashed=false and mimeType='application/vnd.google-apps.folder' and title='" + escaped + "' and '" + parentId + "' in parents";

  const params = {
    q: query,
    maxResults: 1,
  };

  const listed = listFilesSafe_(params, sharedDriveId);
  if (listed.items && listed.items.length) {
    return listed.items[0];
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

  const listed = listFilesSafe_(params, sharedDriveId);
  if (listed.items && listed.items.length) {
    return listed.items[0];
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
  try {
    return Drive.Files.get(fileId, { supportsAllDrives: true });
  } catch (allDrivesError) {
    try {
      return Drive.Files.get(fileId, { supportsTeamDrives: true });
    } catch (teamDriveError) {
      return Drive.Files.get(fileId);
    }
  }
}

function insertFileSafe_(resource, blobOrNull) {
  const normalizedResource = normalizeInsertResource_(resource);

  if (Drive.Files.insert) {
    try {
      return Drive.Files.insert(normalizedResource, blobOrNull, { supportsAllDrives: true });
    } catch (allDrivesError) {
      try {
        return Drive.Files.insert(normalizedResource, blobOrNull, { supportsTeamDrives: true });
      } catch (teamDriveError) {
        return Drive.Files.insert(normalizedResource, blobOrNull);
      }
    }
  }

  if (Drive.Files.create) {
    try {
      return Drive.Files.create(normalizedResource, blobOrNull, { supportsAllDrives: true });
    } catch (allDrivesError) {
      try {
        return Drive.Files.create(normalizedResource, blobOrNull, { supportsTeamDrives: true });
      } catch (teamDriveError) {
        return Drive.Files.create(normalizedResource, blobOrNull);
      }
    }
  }

  throw new Error('No supported Drive file creation method is available.');
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

  const v3NoDrive = toV3ListParams_(base, '', false);
  variants.push(v3NoDrive);

  const plain = cloneObject_(base);
  variants.push(plain);

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

function fileHasParent_(file, parentId) {
  const parents = (file && file.parents) ? file.parents : [];
  for (var i = 0; i < parents.length; i += 1) {
    const parent = parents[i];
    const id = normalizeText_((parent && parent.id) ? parent.id : parent);
    if (id && id === normalizeText_(parentId || '')) {
      return true;
    }
  }
  return false;
}

function fileBelongsToSharedDrive_(file, sharedDriveId) {
  const normalizedDriveId = normalizeText_(sharedDriveId || '');
  if (!normalizedDriveId) return true;

  const fileDriveId = normalizeText_((file && (file.driveId || file.teamDriveId)) || '');
  if (fileDriveId) {
    return fileDriveId === normalizedDriveId;
  }

  // Some API variants omit driveId in responses; fall back to parent check if available.
  const parents = (file && file.parents) ? file.parents : [];
  if (!parents.length) {
    return false;
  }

  return fileHasParent_(file, normalizedDriveId);
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
        if (!sharedDriveId || fileBelongsToSharedDrive_(meta, sharedDriveId)) {
          return { fileId: storedManifestId };
        }
      }
      clearManifestFileId_();
    } catch (error) {
      clearManifestFileId_();
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
