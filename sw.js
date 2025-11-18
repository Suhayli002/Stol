const CACHE_NAME = 'hisobot-cache-v3';

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
  // Стратегия: Stale-While-Revalidate для большинства запросов
  // или Cache First, falling back to Network
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Если в кэше нет, делаем запрос в сеть
        return fetch(event.request).then((networkResponse) => {
          // Проверяем, что ответ валидный
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
            return networkResponse;
          }

          // Клонируем ответ, так как поток можно читать только один раз
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              // Динамически кэшируем новые ресурсы (например, библиотеки с CDN)
              cache.put(event.request, responseToCache);
            });

          return networkResponse;
        });
      })
  );
});