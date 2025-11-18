const CACHE_NAME = 'hisobot-cache-v4';

// Файлы, которые мы знаем точно и хотим закэшировать сразу при установке
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/types.ts',
  '/constants.ts',
  '/logger.ts',
  '/App.tsx',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Кэширование основных файлов приложения');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
             console.log('Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Игнорируем запросы к API (пусть идут прямо на сервер) и не GET запросы (POST нельзя кэшировать)
  if (event.request.url.includes('/api/') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return networkResponse;
        });
      })
  );
});