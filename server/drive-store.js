const crypto = require('node:crypto');
const { google } = require('googleapis');

const FOLDER_MIME = 'application/vnd.google-apps.folder';
const JSON_MIME = 'application/json';
const MANIFEST_PATH = 'config/drive-manifest.json';
const USER_DRAFT_PREFIX = 'data/draft/users/';
const LEGACY_CURRENT_PATH = 'data/draft/current.json';
const LEGACY_RECENT_PATH = 'data/draft/recent-patients.json';
const MED_REFRESH_PATH = 'logs/sync/med-refresh-requests.json';
const REQUIRED_FOLDERS = [
  'app-shell', 'data/meds/source', 'data/meds/curated', 'data/meds/compiled',
  'data/meds/review', 'data/draft/users', 'backups/notes/users', 'logs/sync', 'config',
];

function escapeQuery(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function userKeyFromEmail(email) {
  return String(email || '').trim().toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '')
    .replace(/@/g, '-at-')
    .replace(/\./g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizePath(value) {
  const path = String(value || '').trim().replace(/^\/+|\/+$/g, '');
  if (!path || path.includes('..') || path.includes('\\') || path.split('/').some((part) => !part)) {
    throw Object.assign(new Error('Invalid Drive path.'), { code: 'path_invalid', status: 400 });
  }
  return path;
}

function scopedPath(path, email) {
  const normalized = normalizePath(path);
  const userKey = userKeyFromEmail(email);
  const current = `${USER_DRAFT_PREFIX}${userKey}/current.json`;
  const recent = `${USER_DRAFT_PREFIX}${userKey}/recent-patients.json`;
  if (normalized === LEGACY_CURRENT_PATH) return current;
  if (normalized === LEGACY_RECENT_PATH) return recent;
  if (normalized.startsWith(USER_DRAFT_PREFIX) && normalized !== current && normalized !== recent) {
    throw Object.assign(new Error('Draft path belongs to a different user.'), { code: 'path_forbidden', status: 403 });
  }
  return normalized;
}

function allowedPath(path, email, write = false) {
  const normalized = scopedPath(path, email);
  const userKey = userKeyFromEmail(email);
  const userCurrent = `${USER_DRAFT_PREFIX}${userKey}/current.json`;
  const userRecent = `${USER_DRAFT_PREFIX}${userKey}/recent-patients.json`;
  const sharedRead = new Set([
    MANIFEST_PATH,
    'config/provider-scripts.json',
    'data/meds/compiled/medications.compiled.json',
    'data/meds/review/runtime-fallbacks.json',
    MED_REFRESH_PATH,
  ]);
  const userPaths = new Set([userCurrent, userRecent]);
  const ok = userPaths.has(normalized) || sharedRead.has(normalized);
  if (!ok || (write && normalized === MANIFEST_PATH)) {
    throw Object.assign(new Error('Drive path is not allowed.'), { code: 'path_forbidden', status: 403 });
  }
  return normalized;
}

function checksum(content) {
  return crypto.createHash('md5').update(String(content || ''), 'utf8').digest('hex');
}

class DriveStore {
  constructor(options = {}) {
    this.rootFolderId = String(options.rootFolderId || process.env.ASTRA_DRIVE_ROOT_FOLDER_ID || '').trim();
    this.sharedDriveId = String(options.sharedDriveId || process.env.ASTRA_SHARED_DRIVE_ID || '').trim();
    this.rootFolderName = String(options.rootFolderName || process.env.ASTRA_DRIVE_ROOT_NAME || 'Note App').trim();
    this.buildId = String(options.buildId || process.env.ASTRA_BUILD_ID || 'dev').trim();
    if (!this.rootFolderId || !this.sharedDriveId) {
      throw new Error('ASTRA_DRIVE_ROOT_FOLDER_ID and ASTRA_SHARED_DRIVE_ID are required.');
    }
    this.drive = options.drive || google.drive({
      version: 'v3',
      auth: new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/drive'] }),
    });
  }

  listParams() {
    return { supportsAllDrives: true, includeItemsFromAllDrives: true };
  }

  async findChild(parentId, name, mimeType = '') {
    const mime = mimeType ? ` and mimeType='${escapeQuery(mimeType)}'` : '';
    const response = await this.drive.files.list({
      q: `'${escapeQuery(parentId)}' in parents and name='${escapeQuery(name)}' and trashed=false${mime}`,
      fields: 'files(id,name,mimeType,version,md5Checksum,modifiedTime,driveId)',
      pageSize: 10,
      ...this.listParams(),
    });
    const files = response.data.files || [];
    if (files.length > 1) throw Object.assign(new Error('Duplicate Drive path component.'), { code: 'drive_duplicate', status: 409 });
    return files[0] || null;
  }

  async ensureFolder(parentId, name) {
    const existing = await this.findChild(parentId, name, FOLDER_MIME);
    if (existing) return existing.id;
    const created = await this.drive.files.create({
      requestBody: { name, mimeType: FOLDER_MIME, parents: [parentId] },
      fields: 'id',
      supportsAllDrives: true,
    });
    return created.data.id;
  }

  async folderForPath(folderPath, create = false) {
    let parentId = this.rootFolderId;
    for (const segment of String(folderPath || '').split('/').filter(Boolean)) {
      const child = await this.findChild(parentId, segment, FOLDER_MIME);
      if (!child && !create) return null;
      parentId = child ? child.id : await this.ensureFolder(parentId, segment);
    }
    return parentId;
  }

  async locate(path, create = false, contentType = JSON_MIME) {
    const normalized = normalizePath(path);
    const parts = normalized.split('/');
    const name = parts.pop();
    const parentId = await this.folderForPath(parts.join('/'), create);
    if (!parentId) return null;
    let file = await this.findChild(parentId, name);
    if (!file && create) {
      const created = await this.drive.files.create({
        requestBody: { name, mimeType: contentType, parents: [parentId] },
        media: { mimeType: contentType, body: '{}' },
        fields: 'id,name,mimeType,version,md5Checksum,modifiedTime,driveId',
        supportsAllDrives: true,
      });
      file = created.data;
    }
    return file;
  }

  async readContent(fileId) {
    const response = await this.drive.files.get({ fileId, alt: 'media', supportsAllDrives: true }, { responseType: 'text' });
    return typeof response.data === 'string' ? response.data : JSON.stringify(response.data || {});
  }

  async getFile(path, email) {
    const targetPath = allowedPath(path, email, false);
    const file = await this.locate(targetPath, false);
    if (!file) return { file: null };
    const content = await this.readContent(file.id);
    return { file: {
      path: targetPath,
      id: file.id,
      content,
      revision: String(file.version || ''),
      checksum: String(file.md5Checksum || checksum(content)),
      updatedAt: String(file.modifiedTime || ''),
    } };
  }

  async putFile(path, content, expectedRevision, email, contentType = JSON_MIME) {
    const targetPath = allowedPath(path, email, true);
    const file = await this.locate(targetPath, true, contentType);
    const currentRevision = String(file.version || '');
    if (expectedRevision && currentRevision && String(expectedRevision) !== currentRevision) {
      const currentContent = await this.readContent(file.id);
      return {
        conflict: true,
        path: targetPath,
        currentRevision,
        currentChecksum: String(file.md5Checksum || checksum(currentContent)),
        currentContent,
      };
    }
    const updated = await this.drive.files.update({
      fileId: file.id,
      media: { mimeType: contentType, body: String(content == null ? '' : content) },
      fields: 'id,name,mimeType,version,md5Checksum,modifiedTime,driveId',
      supportsAllDrives: true,
    });
    return {
      path: targetPath,
      id: updated.data.id,
      revision: String(updated.data.version || ''),
      checksum: String(updated.data.md5Checksum || checksum(content)),
      updatedAt: String(updated.data.modifiedTime || ''),
    };
  }

  async getManifest(email) {
    const response = await this.getFile(MANIFEST_PATH, email);
    if (!response.file) return { manifest: null, revision: '', checksum: '', updatedAt: '' };
    let manifest = null;
    try { manifest = JSON.parse(response.file.content); } catch (error) { manifest = null; }
    return {
      manifest,
      revision: response.file.revision,
      checksum: response.file.checksum,
      updatedAt: response.file.updatedAt,
    };
  }

  async bootstrap(email) {
    for (const folder of REQUIRED_FOLDERS) await this.folderForPath(folder, true);
    let file = await this.locate(MANIFEST_PATH, false);
    if (!file) {
      const manifest = {
        version: 2,
        rootFolderName: this.rootFolderName,
        paths: Object.fromEntries(REQUIRED_FOLDERS.map((path) => [path, path])),
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      };
      file = await this.locate(MANIFEST_PATH, true);
      await this.drive.files.update({
        fileId: file.id,
        media: { mimeType: JSON_MIME, body: JSON.stringify(manifest, null, 2) },
        fields: 'id,version,md5Checksum,modifiedTime',
        supportsAllDrives: true,
      });
    }
    const manifest = await this.getManifest(email);
    return {
      rootFolderId: this.rootFolderId,
      sharedDriveId: this.sharedDriveId,
      createdFolders: [],
      manifestRevision: manifest.revision,
      manifestChecksum: manifest.checksum,
    };
  }

  async appendBackup(entry, email) {
    const userKey = userKeyFromEmail(email);
    const folderPath = `backups/notes/users/${userKey}`;
    const folderId = await this.folderForPath(folderPath, true);
    const label = String((entry && entry.label) || 'note-backup')
      .replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\s+/g, '-').slice(0, 42) || 'note-backup';
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const fileName = `${timestamp}-${label}.json`;
    const created = await this.drive.files.create({
      requestBody: { name: fileName, mimeType: JSON_MIME, parents: [folderId] },
      media: { mimeType: JSON_MIME, body: JSON.stringify(entry || {}, null, 2) },
      fields: 'id,name',
      supportsAllDrives: true,
    });
    const listed = await this.drive.files.list({
      q: `'${escapeQuery(folderId)}' in parents and mimeType='${JSON_MIME}' and trashed=false`,
      orderBy: 'modifiedTime desc', pageSize: 1000,
      fields: 'files(id,name,modifiedTime,version)', ...this.listParams(),
    });
    return {
      backupId: created.data.id,
      backupFile: created.data.name,
      backupFolderPath: folderPath,
      retention: {
        mode: 'append-only',
        scanned: (listed.data.files || []).length,
        trashed: 0,
        errors: 0,
      },
    };
  }

  async listBackups(email) {
    const folderPath = `backups/notes/users/${userKeyFromEmail(email)}`;
    const folderId = await this.folderForPath(folderPath, false);
    if (!folderId) return { backups: [], backupFolderPath: folderPath };
    const listed = await this.drive.files.list({
      q: `'${escapeQuery(folderId)}' in parents and mimeType='${JSON_MIME}' and trashed=false`,
      orderBy: 'modifiedTime desc', pageSize: 50,
      fields: 'files(id,name,modifiedTime,version)', ...this.listParams(),
    });
    return {
      backups: (listed.data.files || []).map((file) => ({
        id: file.id, name: file.name, modifiedDate: file.modifiedTime || '', version: String(file.version || ''),
      })),
      backupFolderPath: folderPath,
    };
  }

  async requestMedicationRefresh(payload, email) {
    const current = await this.getFile(MED_REFRESH_PATH, email);
    let queue = { generatedAt: new Date().toISOString(), items: [] };
    try { queue = current.file ? JSON.parse(current.file.content) : queue; } catch (error) { /* start clean */ }
    queue.items = Array.isArray(queue.items) ? queue.items : [];
    queue.items.push({
      id: `med-refresh-${crypto.randomUUID()}`,
      requestedAt: new Date().toISOString(),
      userEmail: email,
      reason: String(payload.reason || 'catalog-stale'),
      source: 'note-builder-cloud-run',
      details: payload.details && typeof payload.details === 'object' ? payload.details : {},
    });
    queue.items = queue.items.slice(-500);
    queue.generatedAt = new Date().toISOString();
    return this.putFile(MED_REFRESH_PATH, JSON.stringify(queue, null, 2), current.file && current.file.revision, email);
  }

  async health(email) {
    const root = await this.drive.files.get({
      fileId: this.rootFolderId,
      fields: 'id,name,mimeType,driveId,trashed', supportsAllDrives: true,
    });
    const rootOk = root.data && root.data.mimeType === FOLDER_MIME && !root.data.trashed
      && root.data.driveId === this.sharedDriveId;
    const manifest = rootOk ? await this.getManifest(email) : { manifest: null };
    return {
      rootOk,
      manifestOk: Boolean(manifest.manifest),
      preflightStatus: rootOk ? (manifest.manifest ? 'ok' : 'manifest_missing') : 'root_id_invalid',
    };
  }
}

module.exports = {
  DriveStore, allowedPath, checksum, normalizePath, scopedPath, userKeyFromEmail,
};
