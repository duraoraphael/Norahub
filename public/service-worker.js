// Bump cache version to force clients to fetch newest assets (avoid old JS using v1beta endpoint)
const CACHE_NAME = 'norahub-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/img/noraicon.png',
  '/img/NoraHub.png',
  '/img/Normatel Engenharia_PRETO.png',
  '/img/Normatel Engenharia_BRANCO.png'
];

// Instalar Service Worker e fazer cache dos recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Ativar Service Worker e limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia: Network First, fallback para Cache
self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não são GET (POST, PUT, DELETE, etc.)
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta for válida, clonar e salvar no cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Se falhar (offline), buscar do cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Se não estiver no cache, retornar página offline personalizada
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
