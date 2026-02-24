// /BoxingTimer/sw.js
const CACHE_NAME = 'boxing-timer-stable';
const assets = [
  '/BoxingTimer/',
  '/BoxingTimer/index.html',
  '/BoxingTimer/manifest.json',
  '/BoxingTimer/icon.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME && !key.includes('beta')) {
          return caches.delete(key);
        }
      })
    ))
  );
  // NOTA: non chiamiamo self.clients.claim() qui per evitare takeover immediato di /new/
});

self.addEventListener('fetch', e => {
  try {
    const url = new URL(e.request.url);
    // Interveniamo solo per richieste dentro /BoxingTimer/ ma NON per /BoxingTimer/new/
    if (url.pathname.startsWith('/BoxingTimer/') && !url.pathname.startsWith('/BoxingTimer/new/')) {
      e.respondWith(
        fetch(e.request).then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, responseClone));
          return response;
        }).catch(() => caches.match(e.request))
      );
    }
    // Altrimenti non facciamo nulla: lascia che la richiesta sia gestita dal browser o da un altro SW
  } catch (err) {
    // Se qualcosa va storto, non interferire
  }
});

