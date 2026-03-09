const APP_ROOT_DEFAULT = 'Astra Clinical Note Builder';
const MANIFEST_PATH = 'config/drive-manifest.json';
const ROOT_FOLDER_ID_PROPERTY = 'DRIVE_ROOT_FOLDER_ID';
const ROOT_FOLDER_NAME_PROPERTY = 'DRIVE_ROOT_FOLDER_NAME';
const ROOT_SHARED_DRIVE_ID_PROPERTY = 'DRIVE_ROOT_SHARED_DRIVE_ID';
const MANIFEST_FILE_ID_PROPERTY = 'DRIVE_MANIFEST_FILE_ID';
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
    case 'health':
      return handleHealth_(payload);
    default:
      throw new Error('Unsupported action: ' + action);
  }
}

function enforceOwnerWrite_(action, payload) {
  const writeActions = {
    bootstrap: true,
    'file.put': true,
    'backup.append': true,
  };

  if (!writeActions[action]) return;

  const tokenFromPayload = normalizeText_(payload.ownerToken || '');
  const tokenFromProperties = normalizeText_(PropertiesService.getScriptProperties().getProperty('DRIVE_OWNER_TOKEN') || '');
  if (tokenFromProperties && tokenFromPayload && tokenFromPayload === tokenFromProperties) {
    return;
  }

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
  const tokenConfigured = Boolean(normalizeText_(PropertiesService.getScriptProperties().getProperty('DRIVE_OWNER_TOKEN') || ''));
  return {
    timestamp: new Date().toISOString(),
    owner: normalizeText_(payload.ownerEmail || '') || normalizeText_(PropertiesService.getScriptProperties().getProperty('DRIVE_OWNER_EMAIL') || ''),
    tokenConfigured: tokenConfigured,
    runtime: 'google-apps-script',
  };
}

function handleBootstrap_(payload) {
  const sharedDriveId = normalizeText_(payload.sharedDriveId || '');
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;

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

function handleManifestGet_(payload) {
  const sharedDriveId = normalizeText_(payload.sharedDriveId || '');
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const root = getOrCreateRootFolder_(sharedDriveId, rootFolderName);
  const manifestBundle = loadManifest_(root.id, sharedDriveId, rootFolderName, payload.ownerEmail || '');

  const manifestMeta = getFileMeta_(manifestBundle.fileId);

  return {
    manifest: manifestBundle.manifest,
    revision: String(manifestMeta.version || ''),
    checksum: String(manifestMeta.md5Checksum || ''),
    updatedAt: String(manifestMeta.modifiedDate || ''),
  };
}

function handleFileGet_(payload) {
  const targetPath = normalizeText_(payload.path || '');
  if (!targetPath) throw new Error('file.get requires path');

  const sharedDriveId = normalizeText_(payload.sharedDriveId || '');
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const root = getOrCreateRootFolder_(sharedDriveId, rootFolderName);

  const manifestBundle = loadManifest_(root.id, sharedDriveId, rootFolderName, payload.ownerEmail || '');
  const resolved = resolvePathFile_(manifestBundle.manifest, root.id, targetPath, sharedDriveId, false);

  if (!resolved.fileId) {
    return { file: null };
  }

  const content = readFileContent_(resolved.fileId);
  const meta = getFileMeta_(resolved.fileId);

  manifestBundle.manifest.pathMap = manifestBundle.manifest.pathMap || {};
  manifestBundle.manifest.pathMap[targetPath] = {
    id: resolved.fileId,
    revision: String(meta.version || ''),
    checksum: String(meta.md5Checksum || ''),
    updatedAt: String(meta.modifiedDate || ''),
  };
  manifestBundle.manifest.revisions = manifestBundle.manifest.revisions || {};
  manifestBundle.manifest.revisions[targetPath] = String(meta.version || '');
  manifestBundle.manifest.checksums = manifestBundle.manifest.checksums || {};
  manifestBundle.manifest.checksums[targetPath] = String(meta.md5Checksum || '');
  manifestBundle.manifest.lastUpdatedAt = new Date().toISOString();
  saveManifest_(manifestBundle.fileId, manifestBundle.manifest);

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
  const targetPath = normalizeText_(payload.path || '');
  if (!targetPath) throw new Error('file.put requires path');

  const content = String(payload.content == null ? '' : payload.content);
  const expectedRevision = normalizeText_(payload.expectedRevision || '');
  const sharedDriveId = normalizeText_(payload.sharedDriveId || '');
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;

  const root = getOrCreateRootFolder_(sharedDriveId, rootFolderName);
  const manifestBundle = loadManifest_(root.id, sharedDriveId, rootFolderName, payload.ownerEmail || '');
  const resolved = resolvePathFile_(manifestBundle.manifest, root.id, targetPath, sharedDriveId, true);

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
  const sharedDriveId = normalizeText_(payload.sharedDriveId || '');
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
  const sharedDriveId = normalizeText_(payload.sharedDriveId || '');
  const rootFolderName = normalizeText_(payload.rootFolderName || APP_ROOT_DEFAULT) || APP_ROOT_DEFAULT;
  const root = getOrCreateRootFolder_(sharedDriveId, rootFolderName);
  const backupFolderId = ensureFolderPath_(root.id, 'backups/notes', sharedDriveId, []);

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
    manifest = {
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

function saveManifest_(manifestFileId, manifest) {
  rememberManifestFileId_(manifestFileId);
  writeFileContent_(manifestFileId, JSON.stringify(manifest, null, 2));
  return getFileMeta_(manifestFileId);
}

function resolvePathFile_(manifest, rootFolderId, targetPath, sharedDriveId, createIfMissing) {
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
  const folderId = folderPath ? ensureFolderPath_(rootFolderId, folderPath, sharedDriveId, []) : rootFolderId;

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

function getOrCreateRootFolder_(sharedDriveId, rootFolderName) {
  const storedRoot = getStoredRootFolder_(sharedDriveId, rootFolderName);
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
  return listed.items && listed.items.length ? listed.items[0] : null;
}

function findFileInFolder_(folderId, fileName, sharedDriveId) {
  const escaped = escapeQueryText_(fileName);
  const query = "trashed=false and title='" + escaped + "' and '" + folderId + "' in parents";

  const params = {
    q: query,
    maxResults: 1,
  };

  const listed = listFilesSafe_(params, sharedDriveId);
  return listed.items && listed.items.length ? listed.items[0] : null;
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
  if (Drive.Files.insert) {
    try {
      return Drive.Files.insert(resource, blobOrNull, { supportsAllDrives: true });
    } catch (allDrivesError) {
      try {
        return Drive.Files.insert(resource, blobOrNull, { supportsTeamDrives: true });
      } catch (teamDriveError) {
        return Drive.Files.insert(resource, blobOrNull);
      }
    }
  }

  if (Drive.Files.create) {
    try {
      return Drive.Files.create(resource, blobOrNull, { supportsAllDrives: true });
    } catch (allDrivesError) {
      try {
        return Drive.Files.create(resource, blobOrNull, { supportsTeamDrives: true });
      } catch (teamDriveError) {
        return Drive.Files.create(resource, blobOrNull);
      }
    }
  }

  throw new Error('No supported Drive file creation method is available.');
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

    if (sharedDriveId && !fileBelongsToSharedDrive_(file, sharedDriveId)) {
      clearStoredRootFolder_();
      return null;
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

  const resolved = resolvePathFile_({ pathMap: {} }, rootFolderId, MANIFEST_PATH, sharedDriveId, true);
  if (!resolved.fileId) {
    throw new Error('Unable to create or resolve drive manifest file.');
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
