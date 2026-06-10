// SafeView Service Worker — קאשינג בסיסי לתמיכה אופליין חלקית
const CACHE_VERSION = 'safeview-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './assets/style.css',
  './assets/app.js',
  './favicon.svg',
  './manifest.json',
  './404.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // רק GET, ורק origin שלנו
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // למעבר ראשון נוצרת בקשת fetch — Network-first עם נפילה ל-cache (HTML)
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match('./404.html')))
    );
    return;
  }

  // נכסים סטטיים — Cache-first
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      }))
    );
    return;
  }

  // CDN חיצוני (Shopify images, Google Fonts) — Stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
