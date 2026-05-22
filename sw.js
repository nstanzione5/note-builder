const APP_BUILD_ID = '20260522-supporting-docs-drive';
const CACHE_PREFIX = 'note-builder-shell-';
const CACHE_NAME = `${CACHE_PREFIX}${APP_BUILD_ID}`;
const SHELL_ASSETS = [
  './',
  './index.html',
  './letter.html',
  './styles.css',
  './app.js',
  './letter.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './assets/astra-logo-horizontal.png',
  './assets/astra-logo-vertical.png',
  './data/meds/compiled/medications.compiled.json',
  './data/meds/review/review-queue.json',
  './data/meds/review/runtime-fallbacks.json',
  './docs/medication-reference-maintenance.md',
  './docs/drive-sync-setup.md',
  './config/drive-manifest.json',
  './config/astra-clinicians.json',
  './config/provider-scripts.json',
];

const NETWORK_FIRST_PATHS = new Set([
  '/index.html',
  '/letter.html',
  '/styles.css',
  '/app.js',
  '/letter.js',
  '/manifest.json',
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const pathname = url.pathname;
  const isNetworkFirst = NETWORK_FIRST_PATHS.has(pathname) || pathname.endsWith('/index.html') || pathname.endsWith('/app.js') || pathname.endsWith('/styles.css');

  if (request.mode === 'navigate') {
    const fallbackPage = pathname.endsWith('/letter.html') ? './letter.html' : './index.html';
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(fallbackPage, copy));
          return response;
        })
        .catch(() => caches.match(fallbackPage))
    );
    return;
  }

  if (isNetworkFirst) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
