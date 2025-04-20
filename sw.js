const cacheName = "pwa";

const filesToCache = [
  "/",
  "manifest.json",
  "index.html",
  "index.js",
  "style.css",
  "/images/icon512_rounded.png",
  "/images/application-16.png",
  "/wasmfunctions/pkg/wasm_grayscale.js",
];

// Instalar el service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(filesToCache)
      .then(() => self.skipWaiting())
    }).catch((error) => {
      console.error("Error caching files:", error);
    })
  );
});

// Funcione sin conexión
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [cacheName];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (cacheWhitelist.indexOf(name) === -1) {
            return caches.delete(name);
          }
        })
      );
    })
    .then(() => self.clients.claim())
    .catch((error) => {
      console.error("Error during service worker activation:", error);
    })
  );
})

// Interceptar las solicitudes de red
// y servir los archivos desde la caché si están disponibles
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        return caches.open(cacheName).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
