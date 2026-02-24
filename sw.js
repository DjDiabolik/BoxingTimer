const CACHE_NAME = 'boxing-timer-stable';
const assets = ['./', './index.html', './manifest.json', './icon.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => {
        // Cancella eventuali vecchie cache con i numeri, ma IGNORA la beta
        if (key !== CACHE_NAME && !key.includes('beta')) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// LOGICA "SMART NETWORK-FIRST": Scarica da internet e aggiorna la cache in automatico!
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(response => {
      // Se c'è internet, salva la copia più recente in cache per quando sarai offline
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, responseClone));
      return response;
    }).catch(() => {
      // Se sei in palestra senza rete, pesca dalla cache
      return caches.match(e.request);
    })
  );
});
