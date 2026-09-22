// Kiriya Stopwatch — offline cache
// Bump this version string whenever you edit kiriya-stopwatch.html so
// returning visitors pick up the new file instead of the old cached copy.
const CACHE_NAME = 'kiriya-stopwatch-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json'
];

// Install: pre-cache the app shell so it's available offline immediately.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: drop any old cache versions.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache first (instant + offline-proof), fall back to the
// network, and quietly refresh the cache in the background when online.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
