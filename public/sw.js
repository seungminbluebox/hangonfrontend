// Service Worker for PWA
const CACHE_NAME = "hangon-cache-v1";
const ASSETS_TO_CACHE = ["/icon-192.png", "/icon-512.png", "/badge-72x72.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

// Push Notification Event
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push Received.");
  if (!event.data) return;

  try {
    const data = event.data.json();
    console.log("[Service Worker] Push Data:", data);

    const iconUrl = new URL("/icon-192.png", self.location.origin).href;
    const badgeUrl = new URL("/badge-72x72.png", self.location.origin).href;

    const options = {
      body: data.body || "새로운 소식이 도착했습니다!",
      icon: iconUrl,
      badge: badgeUrl,
      data: {
        url: data.url || "/",
      },
      vibrate: [100, 50, 100],
      requireInteraction: true,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "Hang on!", options),
    );
  } catch (error) {
    console.error("[Service Worker] Push Error:", error);
  }
});

// Notification Click Event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
