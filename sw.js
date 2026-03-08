self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  // A basic pass-through fetch handler is required for PWA installation
  event.respondWith(fetch(event.request));
});


