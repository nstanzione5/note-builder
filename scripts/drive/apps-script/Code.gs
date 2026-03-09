const APP_ROOT_DEFAULT = 'Astra Clinical Note Builder';
const MANIFEST_PATH = 'config/drive-manifest.json';
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
  return {
    timestamp: new Date().toISOString(),
    owner: normalizeText_(payload.ownerEmail || '') || normalizeText_(PropertiesService.getScriptProperties().getProperty('DRIVE_OWNER_EMAIL') || ''),
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

  const file = Drive.Files.insert({
    title: fileName,
    mimeType: 'application/json',
    parents: [{ id: backupFolderId }],
  }, Utilities.newBlob(JSON.stringify(entry, null, 2), 'application/json', fileName), {
    supportsAllDrives: true,
  });

  return {
    backupId: file.id,
    backupFile: file.title || fileName,
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
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  };
  if (sharedDriveId) {
    params.corpora = 'drive';
    params.driveId = sharedDriveId;
  }

  const listed = Drive.Files.list(params);
  const items = (listed.items || []).map(function (file) {
    return {
      id: file.id,
      name: file.title,
      modifiedDate: file.modifiedDate,
      version: file.version,
    };
  });

  return { backups: items };
}

function loadManifest_(rootFolderId, sharedDriveId, rootFolderName, ownerEmail) {
  const manifestResolved = resolvePathFile_({ pathMap: {} }, rootFolderId, MANIFEST_PATH, sharedDriveId, true);
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
  writeFileContent_(manifestFileId, JSON.stringify(manifest, null, 2));
  return getFileMeta_(manifestFileId);
}

function resolvePathFile_(manifest, rootFolderId, targetPath, sharedDriveId, createIfMissing) {
  manifest.pathMap = manifest.pathMap || {};
  const mapped = manifest.pathMap[targetPath];
  if (mapped && mapped.id) {
    try {
      Drive.Files.get(mapped.id, { supportsAllDrives: true });
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
    file = Drive.Files.insert({
      title: fileName,
      mimeType: 'text/plain',
      parents: [{ id: folderId }],
    }, Utilities.newBlob('', 'text/plain', fileName), {
      supportsAllDrives: true,
    });
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
      child = Drive.Files.insert({
        title: segment,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [{ id: parentId }],
      }, null, {
        supportsAllDrives: true,
      });

      if (createdFolders) {
        createdFolders.push(folderPathUntil_(segments, segment));
      }
    }

    parentId = child.id;
  });

  return parentId;
}

function folderPathUntil_(segments, segment) {
  const index = segments.indexOf(segment);
  if (index < 0) return segment;
  return segments.slice(0, index + 1).join('/');
}

function getOrCreateRootFolder_(sharedDriveId, rootFolderName) {
  const escaped = escapeQueryText_(rootFolderName);
  const query = "trashed=false and mimeType='application/vnd.google-apps.folder' and title='" + escaped + "'";

  const params = {
    q: query,
    maxResults: 10,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  };

  if (sharedDriveId) {
    params.corpora = 'drive';
    params.driveId = sharedDriveId;
  }

  const listed = Drive.Files.list(params);
  if (listed.items && listed.items.length) {
    return listed.items[0];
  }

  try {
    const resource = {
      title: rootFolderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (sharedDriveId) {
      resource.parents = [{ id: sharedDriveId }];
    }

    return Drive.Files.insert(resource, null, {
      supportsAllDrives: true,
    });
  } catch (error) {
    const fallback = DriveApp.createFolder(rootFolderName);
    return Drive.Files.get(fallback.getId(), { supportsAllDrives: true });
  }
}

function findFolderInParent_(parentId, folderName, sharedDriveId) {
  const escaped = escapeQueryText_(folderName);
  const query = "trashed=false and mimeType='application/vnd.google-apps.folder' and title='" + escaped + "' and '" + parentId + "' in parents";

  const params = {
    q: query,
    maxResults: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  };

  if (sharedDriveId) {
    params.corpora = 'drive';
    params.driveId = sharedDriveId;
  }

  const listed = Drive.Files.list(params);
  return listed.items && listed.items.length ? listed.items[0] : null;
}

function findFileInFolder_(folderId, fileName, sharedDriveId) {
  const escaped = escapeQueryText_(fileName);
  const query = "trashed=false and title='" + escaped + "' and '" + folderId + "' in parents";

  const params = {
    q: query,
    maxResults: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  };

  if (sharedDriveId) {
    params.corpora = 'drive';
    params.driveId = sharedDriveId;
  }

  const listed = Drive.Files.list(params);
  return listed.items && listed.items.length ? listed.items[0] : null;
}

function readFileContent_(fileId) {
  return DriveApp.getFileById(fileId).getBlob().getDataAsString('utf-8');
}

function writeFileContent_(fileId, text) {
  DriveApp.getFileById(fileId).setContent(String(text || ''));
}

function getFileMeta_(fileId) {
  return Drive.Files.get(fileId, {
    supportsAllDrives: true,
  });
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
