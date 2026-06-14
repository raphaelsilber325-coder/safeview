// SafeView Service Worker — קאשינג בסיסי לתמיכה אופליין חלקית
// גרסה: עלייה בערך הזה תגרום ל-SW חדש להתקין ולמחוק caches ישנים
const CACHE_VERSION = 'safeview-v5';
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
  // הפעלה מיידית של גרסה חדשה, בלי להמתין ש-tabs ייסגרו
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // HTML (ניווט) — Network-first עם נפילה ל-cache
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match('./404.html')))
    );
    return;
  }

  // נכסים מקומיים (CSS/JS/SVG) — Stale-while-revalidate: מגיש מהמטמון ועדכן ברקע
  // כך שינויי קוד מגיעים בטעינה הבאה, בלי צורך בהורדה מחדש של SW
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // CDN חיצוני (Shopify images, Google Fonts) — Stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
