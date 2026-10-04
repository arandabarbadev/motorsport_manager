// ============================================================
// SERVICE WORKER (PWA): offline support without getting stuck on
// old deploys.
//   - Navigations (the HTML): network-first, so every new deploy
//     appears immediately; cache is the offline fallback.
//   - Same-origin assets (hashed, immutable names): cache-first.
// Bump CACHE to invalidate everything on a breaking change.
// ============================================================
const CACHE = 'f1manager-v3';

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

  if (event.request.mode === 'navigate') {
    // The page itself: always prefer the network (fresh deploys show up
    // immediately), fall back to the cache when offline. 'no-cache'
    // revalidates with the server instead of trusting the local copy.
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(event.request, { cache: 'no-cache' });
          const cache = await caches.open(CACHE);
          cache.put(event.request, fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(CACHE);
          return (
            (await cache.match(event.request)) ||
            (await cache.match('./index.html')) ||
            (await cache.match('index.html'))
          );
        }
      })()
    );
    return;
  }

  // Hashed assets: immutable names, safe to serve cache-first.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(event.request);
      if (hit) return hit;
      try {
        const response = await fetch(event.request);
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      } catch (err) {
        throw err;
      }
    })()
  );
});
