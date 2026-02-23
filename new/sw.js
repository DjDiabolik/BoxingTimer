const CACHE_NAME = 'boxing-timer-v6.0-beta'; // Aggiornato per la 6.0 Beta
const assets = ['./', './index.html', './manifest.json', './icon.png'];

self.addEventListener('install', e => {
  self.skipWaiting(); // Forza l'attivazione immediata del nuovo SW
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

self.addEventListener('activate', e => {
  // Pulisce TUTTE le vecchie cache di questa cartella
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  self.clients.claim(); // Prende il controllo della pagina immediatamente
});

// LOGICA NETWORK-FIRST: Prova prima a scaricare dal server (Network), 
// se fallisce (offline) usa la cache.
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
