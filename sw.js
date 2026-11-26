const CACHE_NAME = 'mistletoe-photobooth-v6';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './css/tokens.css?v=6',
  './css/layout.css?v=6',
  './css/components.css?v=6',
  './js/state.js',
  './js/themes.js',
  './js/theme-renderer.js',
  './js/fairy-lights.js',
  './js/film-fx.js',
  './js/audio.js',
  './js/camera.js',
  './js/filters.js',
  './js/sticker-packs.js',
  './js/stickers.js',
  './js/renderer.js',
  './js/print-animation.js',
  './js/editor.js',
  './js/share.js',
  './js/ui.js?v=6',
  './assets/custom/manifest.json',
  './assets/custom/grinch-1.png',
  './assets/custom/spiderman-1.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
      );
    })
  );
});
