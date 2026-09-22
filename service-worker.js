// Kiriya Stopwatch — offline cache
// Bump this version string whenever you edit index.html so returning
// visitors pick up the new file instead of the old cached copy.
const CACHE_NAME = 'kiriya-stopwatch-v5';
const APP_SHELL = [
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

// Fetch:
// - Page navigations (opening/reloading the URL): try the network first,
//   but if that fails (offline), ALWAYS serve the cached index.html —
//   no exact-URL match required, so this works no matter how the page
//   is reopened (address bar, bookmark, home-screen icon, trailing slash
//   or not).
// - Everything else (manifest.json, any future assets): serve from cache
//   if present, otherwise go to the network.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
