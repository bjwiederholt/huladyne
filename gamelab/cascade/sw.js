const CACHE_NAME = 'cascade-v2';
const ASSETS = ['/gamelab/cascade/', '/gamelab/cascade/manifest.json'];
self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', (event) => { if (event.request.method !== 'GET') return; event.respondWith(caches.match(event.request).then((cached) => { const fetched = fetch(event.request).then((r) => { if (r.ok) { const c = r.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(event.request, c)); } return r; }).catch(() => cached); return cached || fetched; })); });
