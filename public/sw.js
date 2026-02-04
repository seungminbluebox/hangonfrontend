// Service Worker for PWA
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});

// Push Notification Event
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push Received.");
  if (!event.data) return;

  try {
    const data = event.data.json();
    console.log("[Service Worker] Push Data:", data);

    const options = {
      body: data.body || "새로운 소식이 도착했습니다!",
      icon: "/icon-192.png",
      badge: "/badge-72x72.png",
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
