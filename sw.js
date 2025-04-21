const cacheName = "pwa";

const filesToCache = [
  "/",
  "manifest.json",
  "index.html",
  "index.js",
  "style.css",
  "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
  "./images/icon512_rounded.png",
  "./images/icon512_maskable.png",
  "./images/application-16.png",
  "./images/application-48.png",
  "./images/application-64.png",
  "./images/application-72.png",
  "./images/application-96.png",
  "./images/application-128.png",
  "./images/application-144.png",
  "./images/application-152.png",
  "./images/application-180.png",
  "./images/application-192.png",
  "./images/application-256.png",
  "./images/application-512.png",
  './wasmfunctions/pkg/wasm_grayscale.js',
  './wasmfunctions/pkg/wasm_grayscale_bg.wasm'
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
    // Handle WASM files with correct MIME type
    if (event.request.url.endsWith('.wasm')) {
      event.respondWith(
        fetch(event.request, { 
          headers: { 'Content-Type': 'application/wasm' }
        }).catch(() => caches.match(event.request))
      );
      return;
    }

    // Default cache-first strategy for other files
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)})
      .catch((error) => {
        console.error("Error fetching files:", error);
      })
    );

});
  
