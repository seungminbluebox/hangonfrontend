// Service Worker for PWA
const CACHE_NAME = "hangon-cache-v4";
const ASSETS_TO_CACHE = [
  "/",
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

  const iconUrl = "/icon-192.png";
  const badgeUrl = "/badge-72x72.png";

  const options = {
    body: data.body || "새로운 소식이 도착했습니다!",
    icon: iconUrl,
    badge: badgeUrl,
    image: data.image || undefined, // 알림 내 대형 이미지 지원 (있을 경우)
    data: {
      url: data.url || "/",
    },
    vibrate: [200, 100, 200],
    tag: data.tag || `hangon-notification-${Date.now()}`, // 알림 스태킹 보장
    renotify: true, // 태그가 같더라도 다시 알림 (필요 시)
    requireInteraction: true,
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
