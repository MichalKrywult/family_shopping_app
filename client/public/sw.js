const CACHE_VERSION = 'v3';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/', // index.html
  '/public/assets/icon.png',
  '/public/assets/favicon.ico',
  '/src/app.js',
  '/src/core/api.js',
  '/src/shared/dom.js',
  '/src/shared/responsive.js',
  '/src/shared/toast.js',
  '/src/css/global.css',
  '/src/css/layout.css',
  '/src/css/shopping.css',
  '/src/css/style.css',
];

// INSTALL — precache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ACTIVATE — cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH — static: cache-first, API: network-first
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API calls → network-first
  if (url.pathname.startsWith('/api')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Static files → cache-first
  event.respondWith(cacheFirst(event.request));
});

// STRATEGIES
async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached || fetch(request);
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    return caches.match(request);
  }
}
