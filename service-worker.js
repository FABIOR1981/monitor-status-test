// service-worker.js - Service Worker para PWA
const CACHE_NAME = 'monitor-status-v1.0.0';
const RUNTIME_CACHE = 'monitor-runtime-v1.0.0';

// Archivos a cachear durante la instalación
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/leyenda.html',
  '/css/styles_base.css',
  '/css/styles_def.css',
  '/css/leyenda_base.css',
  '/css/leyenda_def.css',
  '/css/mejoras.css',
  '/js/config.js',
  '/js/i18n.js',
  '/js/modules/storage.js',
  '/js/modules/monitor.js',
  '/js/modules/ui.js',
  '/js/modules/analytics.js',
  '/lang/i18n_es.js',
  '/lang/i18n_en.js',
  '/manifest.json',
];

// Instalación: cachear archivos estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando archivos estáticos');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activación: limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Eliminando caché antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch: estrategia Network First para datos dinámicos, Cache First para estáticos
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones a Netlify functions (siempre ir a la red)
  if (url.pathname.includes('/.netlify/functions/')) {
    return;
  }

  // Ignorar peticiones POST/PUT/DELETE
  if (request.method !== 'GET') {
    return;
  }

  // Estrategia para data/webs.json: Network First con fallback a cache
  if (url.pathname.includes('/data/webs.json')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Estrategia para archivos estáticos: Cache First con actualización en background
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Por defecto: Network First
  event.respondWith(networkFirstStrategy(request));
});

// Network First: intenta red primero, fallback a caché
async function networkFirstStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const networkResponse = await fetch(request);

    // Solo cachear respuestas exitosas
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Red no disponible, usando caché:', request.url);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Si no hay caché, retornar página offline básica
    return new Response(
      JSON.stringify({
        error: 'Sin conexión',
        offline: true,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Cache First: usa caché si existe, actualiza en background
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Actualizar en background
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse);
        }
      })
      .catch(() => {
        // Ignorar errores de red en background update
      });

    return cachedResponse;
  }

  // Si no está en caché, ir a la red
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Error al obtener recurso:', request.url);
    throw error;
  }
}

// Determina si es un archivo estático
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.css',
    '.js',
    '.html',
    '.png',
    '.jpg',
    '.svg',
    '.woff',
    '.woff2',
  ];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

// Mensajes desde el cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => {
        event.ports[0].postMessage({ success: true });
      });
  }
});

// Background Sync para reintentar peticiones fallidas
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-monitor-data') {
    event.waitUntil(syncMonitorData());
  }
});

async function syncMonitorData() {
  console.log('[SW] Sincronizando datos del monitor...');

  // Aquí podrías implementar lógica para reintentar peticiones fallidas
  // Por ahora solo registramos el evento

  return Promise.resolve();
}

// Notificaciones push (placeholder para implementación futura)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'Nuevo evento del monitor',
    icon: '/assets/icon-192.png',
    badge: '/assets/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Monitor Status', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data.url));
});
