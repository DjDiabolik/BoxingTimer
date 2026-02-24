const CACHE_NAME = 'boxing-timer-beta';
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
        // Cancella tutto ciò che non è se stesso o la stabile
        if (key !== CACHE_NAME && !key.includes('stable')) {
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
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, responseClone));
      return response;
    }).catch(() => {
      return caches.match(e.request);
    })
  );
});
