import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..', '..');
const localConfigPath = path.join(rootDir, 'config/drive-sync.local.json');

let cachedApiKey = null;

function normalizeText(value) {
  return String(value || '').trim();
}

function readApiKeyFromLocalConfig() {
  try {
    const raw = fs.readFileSync(localConfigPath, 'utf8');
    const parsed = JSON.parse(raw);
    return normalizeText(
      parsed.openfdaApiKey
      || parsed.openFdaApiKey
      || parsed.OPENFDA_API_KEY
      || '',
    );
  } catch (error) {
    return '';
  }
}

export function getOpenFdaApiKey() {
  if (cachedApiKey !== null) {
    return cachedApiKey;
  }

  const fromEnv = normalizeText(process.env.OPENFDA_API_KEY || '');
  if (fromEnv) {
    cachedApiKey = fromEnv;
    return cachedApiKey;
  }

  cachedApiKey = readApiKeyFromLocalConfig();
  return cachedApiKey;
}

export function appendOpenFdaApiKey(url) {
  const key = getOpenFdaApiKey();
  if (!key) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}api_key=${encodeURIComponent(key)}`;
}
