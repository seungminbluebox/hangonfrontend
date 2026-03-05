// Service Worker for PWA
const CACHE_NAME = "hangon-cache-v7";
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

  // HTML 문서(페이지 방문) 요청은 무조건 네트워크 먼저 시도 (Network-First)
  // 이렇게 해야 사용자가 / 접속 시 최신 버전의 페이지(서버 캐시 등)를 받아볼 수 있습니다.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request)),
    );
    return;
  }

  // 그 외 정적 파일(이미지 등)은 캐시 먼저 확인 (Cache-First)
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
