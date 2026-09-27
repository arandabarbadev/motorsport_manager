// ============================================================
// SERVICE WORKER (PWA): cache-first for same-origin GET requests
// so the installed game works offline. Hand-written, no
// dependencies. Bump CACHE to invalidate old files.
// ============================================================
const CACHE = 'f1manager-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(event.request, {
        ignoreSearch: url.pathname.endsWith('/'),
      });
      if (hit) return hit;
      try {
        const response = await fetch(event.request);
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      } catch (err) {
        const fallback =
          (await cache.match('./index.html')) || (await cache.match('index.html'));
        if (fallback) return fallback;
        throw err;
      }
    })()
  );
});
