const CACHE_NAME = 'agenda-igreja-v1';
const VERSION_URL = '/version.json';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((names) =>
        Promise.all(names.map((name) => name !== CACHE_NAME && caches.delete(name)))
      ),
      self.clients.claim(),
    ])
  );
  checkForUpdates();
  setInterval(checkForUpdates, 300000);
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

let currentVersion = null;

async function checkForUpdates() {
  try {
    const res = await fetch(VERSION_URL + '?t=' + Date.now());
    const data = await res.json();
    const newVersion = data.commitHash;

    if (currentVersion === null) {
      currentVersion = newVersion;
    } else if (currentVersion !== newVersion) {
      currentVersion = newVersion;
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
      const clients = await self.clients.matchAll();
      clients.forEach((client) => client.postMessage({ type: 'NEW_VERSION' }));
    }
  } catch {}
}
