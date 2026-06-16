/* SafeView Service Worker — PWA offline support */
var CACHE_NAME = 'sv-cache-v1';
var PRECACHE = [
  'index.html',
  'assets/style.css',
  'assets/app.js',
  'favicon.svg',
  'compare.html',
  'cart.html',
  'blog.html',
  'faq.html',
  'about.html',
  'contact.html'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE);
    }).then(function() { self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  // Shopify CDN + external fonts: network-first, no cache
  if (url.hostname !== self.location.hostname) {
    return e.respondWith(fetch(e.request).catch(function() { return new Response('', {status: 503}); }));
  }
  // Local assets: cache-first
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(res) {
        if (res.ok) {
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, clone); });
        }
        return res;
      }).catch(function() {
        return caches.match('index.html');
      });
    })
  );
});
