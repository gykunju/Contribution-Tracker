const CACHE_NAME = "contribution-tracker-v1";
const urlsToCache = [
  "/Contribution-Tracker/",
  "/Contribution-Tracker/index.html",
  "/Contribution-Tracker/manifest.json",
  "/Contribution-Tracker/icons/manifest-icon-192.maskable.png",
  "/Contribution-Tracker/icons/manifest-icon-512.maskable.png",
  "/Contribution-Tracker/assets/login.webp"
];

// Install and cache required assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Network-first strategy for dynamic content
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});