import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_CONFIG_PATH = path.resolve(process.cwd(), 'config/drive-sync.local.json');
const EXAMPLE_CONFIG_PATH = path.resolve(process.cwd(), 'config/drive-sync.config.example.json');

export async function loadDriveConfig(configPath = DEFAULT_CONFIG_PATH) {
  const merged = {
    endpointUrl: process.env.DRIVE_ENDPOINT_URL || '',
    sharedDriveId: process.env.DRIVE_SHARED_DRIVE_ID || '',
    rootFolderName: process.env.DRIVE_ROOT_FOLDER_NAME || 'Astra Clinical Note Builder',
    ownerEmail: process.env.DRIVE_OWNER_EMAIL || '',
    userEmail: process.env.DRIVE_USER_EMAIL || '',
    serviceToken: process.env.DRIVE_SERVICE_TOKEN || process.env.DRIVE_OWNER_TOKEN || '',
    ownerToken: process.env.DRIVE_OWNER_TOKEN || '',
    manifestPath: process.env.DRIVE_MANIFEST_PATH || 'config/drive-manifest.json',
  };

  const selectedPath = path.resolve(configPath || DEFAULT_CONFIG_PATH);

  try {
    const raw = await fs.readFile(selectedPath, 'utf8');
    Object.assign(merged, JSON.parse(raw));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new Error(`Unable to parse ${selectedPath}: ${error.message}`);
    }

    // fall back to the checked-in example when local config is not present
    const fallbackRaw = await fs.readFile(EXAMPLE_CONFIG_PATH, 'utf8');
    Object.assign(merged, JSON.parse(fallbackRaw));
  }

  if (!merged.endpointUrl || String(merged.endpointUrl).includes('REPLACE_WITH_DEPLOYMENT_ID')) {
    throw new Error('Drive endpoint URL is not configured. Set DRIVE_ENDPOINT_URL or create config/drive-sync.local.json.');
  }

  return {
    ...merged,
    endpointUrl: String(merged.endpointUrl).trim(),
    sharedDriveId: String(merged.sharedDriveId || '').trim(),
    rootFolderName: String(merged.rootFolderName || 'Astra Clinical Note Builder').trim(),
    ownerEmail: String(merged.ownerEmail || '').trim(),
    userEmail: String(merged.userEmail || '').trim(),
    serviceToken: String(merged.serviceToken || merged.ownerToken || '').trim(),
    ownerToken: String(merged.ownerToken || '').trim(),
    manifestPath: String(merged.manifestPath || 'config/drive-manifest.json').trim(),
  };
}

export async function callDriveAction(action, payload = {}, options = {}) {
  const config = options.config || await loadDriveConfig(options.configPath);

  const requestBody = {
    ...payload,
    action,
    sharedDriveId: payload.sharedDriveId || config.sharedDriveId,
    rootFolderName: payload.rootFolderName || config.rootFolderName,
    userEmail: payload.userEmail || config.userEmail,
    serviceToken: payload.serviceToken || config.serviceToken || config.ownerToken,
    ownerEmail: payload.ownerEmail || config.ownerEmail,
    ownerToken: payload.ownerToken || config.ownerToken,
    manifestPath: payload.manifestPath || config.manifestPath,
    client: {
      source: 'note-builder-local-script',
      timestamp: new Date().toISOString(),
    },
  };

  const response = await fetch(config.endpointUrl, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Drive action ${action} failed with HTTP ${response.status}`);
  }

  const result = await response.json();
  if (result && result.ok === false) {
    throw new Error(result.error || `Drive action ${action} returned ok=false`);
  }

  return result;
}

export function checksum(text) {
  const value = String(text || '');
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash) + value.charCodeAt(i);
    hash >>>= 0;
  }
  return hash.toString(16);
}
