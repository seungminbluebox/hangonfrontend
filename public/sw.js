// Service Worker for PWA
const CACHE_NAME = "hangon-cache-v2";
const ASSETS_TO_CACHE = [
  "/icon-192.png",
  "/icon-512.png",
  "/badge-72x72.png",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  // Pass through for non-GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

// Push Notification Event
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push Received.");

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error("[Service Worker] Push Data is not JSON:", e);
      data = {
        title: "Hang on!",
        body: event.data.text() || "새로운 소식이 도착했습니다!",
      };
    }
  }

  const iconUrl = new URL("/icon-192.png", self.location.origin).href;
  const badgeUrl = new URL("/badge-72x72.png", self.location.origin).href;

  const options = {
    body: data.body || "새로운 소식이 도착했습니다!",
    icon: iconUrl,
    badge: badgeUrl,
    tag: "hangon-push-notification", // Consistent tag to overwrite older notifications
    renotify: true, // Vibrate/ring even if tag is same
    data: {
      url: data.url || "/",
    },
    vibrate: [100, 50, 100],
    requireInteraction: true,
    // Android spec: Badge must be a transparent alpha-mask icon
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Hang on!", options),
  );
});

// Notification Click Event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
