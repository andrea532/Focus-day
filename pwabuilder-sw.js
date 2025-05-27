// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

const CACHE = "pwa-offline-v2";
const QUEUE_NAME = "bgSyncQueue";

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// Incrementa questa versione quando vuoi forzare un aggiornamento del service worker
const SW_VERSION = '1.0.1';

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin(QUEUE_NAME, {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});

workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE,
    plugins: [
      bgSyncPlugin,
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 giorni
        // Purge entries if quota errors
        purgeOnQuotaError: true,
      }),
    ]
  })
);

// Cache per le risorse statiche importanti
workbox.precaching.precacheAndRoute([
  { url: '/', revision: SW_VERSION },
  { url: '/index.html', revision: SW_VERSION },
]);

// Gestione speciale per le risorse dell'app
workbox.routing.registerRoute(
  /\.(js|css|png|jpg|jpeg|svg|gif|ico)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'static-resources',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 giorni
      }),
    ],
  })
);

// Gestione delle richieste API con Network First strategy
workbox.routing.registerRoute(
  /api\//,
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minuti
      }),
    ],
  })
);

// Gestione offline
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
  }
});

// Notifica all'app quando c'è un aggiornamento
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // Pulisci le vecchie cache
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE && !cacheName.includes('workbox')) {
            return caches.delete(cacheName);
          }
        })
      );
      
      // Prendi il controllo di tutti i client
      await self.clients.claim();
      
      // Notifica i client del nuovo giorno se necessario
      const clients = await self.clients.matchAll({ type: 'window' });
      const today = new Date().toDateString();
      
      clients.forEach(client => {
        client.postMessage({
          type: 'NEW_DAY_CHECK',
          date: today
        });
      });
    })()
  );
});

// Controlla periodicamente se è un nuovo giorno
setInterval(async () => {
  const clients = await self.clients.matchAll({ type: 'window' });
  const today = new Date().toDateString();
  
  clients.forEach(client => {
    client.postMessage({
      type: 'NEW_DAY_CHECK',
      date: today
    });
  });
}, 60000); // Ogni minuto