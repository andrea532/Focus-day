// public/pwabuilder-sw.js
// Service worker avanzato per Progressive Web App con supporto offline completo

const CACHE_NAME = 'budget-app-cache-v2';
const OFFLINE_URL = '/offline.html';

// Lista di risorse da pre-cachare
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/styles/globals.css'
];

// Installa il service worker e pre-cacha le risorse
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching static resources');
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );
  // Forza l'attivazione immediata
  self.skipWaiting();
});

// Attiva il service worker e pulisci le vecchie cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
  // Prendi il controllo di tutte le pagine immediatamente
  self.clients.claim();
});

// Strategia di caching per le richieste
self.addEventListener('fetch', event => {
  // Ignora le richieste non-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignora le richieste chrome-extension
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  // Strategia per risorse HTML (Network First)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Se la risposta è valida, la cachiamo
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(async () => {
          // Se offline, prova prima la cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Altrimenti, mostra la pagina offline
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Strategia per JS/CSS (Cache First con Network Fallback)
  if (request.url.includes('.js') || request.url.includes('.css')) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          // Aggiorna la cache in background
          fetch(request).then(response => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, response);
              });
            }
          });
          return cachedResponse;
        }
        
        return fetch(request).then(response => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Strategia per immagini e font (Cache First)
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        return cachedResponse || fetch(request).then(response => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        }).catch(() => {
          // Ritorna un placeholder per le immagini se offline
          if (request.destination === 'image') {
            return new Response(
              '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Offline</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
        });
      })
    );
    return;
  }

  // Default: Network First per altre richieste
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Gestione dei messaggi dal client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Pulizia cache su richiesta
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

// Background sync per sincronizzare i dati quando torna la connessione
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Qui puoi implementare la logica per sincronizzare i dati
  // quando la connessione torna disponibile
  console.log('Sincronizzazione dati in background...');
}