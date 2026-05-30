const CACHE_NAME = 'shopping-v1';
const ASSETS = [
  '../index.html',
  '../src/core/api.js',
  '../src/shopping/shopping.js',
  './assets/icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('127.0.0.1:8000')) return;
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => cachedResponse || fetch(e.request))
  );
});