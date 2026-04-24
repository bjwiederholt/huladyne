const CACHE_NAME = 'cascade-v2.7.11';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // Only handle same-origin requests — don't interfere with PostHog CDN or other third-party scripts
  if (url.origin !== self.location.origin) return;
  const isStatic = url.pathname.match(/\.(woff2|png|jpg|svg|ico)$/);
  if (isStatic) {
    event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((r) => { if (r.ok) { const c = r.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(event.request, c)); } return r; })));
  } else {
    event.respondWith(fetch(event.request).then((r) => { if (r.ok) { const c = r.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(event.request, c)); } return r; }).catch(() => caches.match(event.request)));
  }
});
