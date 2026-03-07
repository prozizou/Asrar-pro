const CACHE_NAME = 'mon-app-cache-v1';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './data.json'
];

// Installation du Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

// Stratégie de cache : Réseau d'abord, sinon Cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
