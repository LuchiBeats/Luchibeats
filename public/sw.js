const CACHE = "luchibeats-v3";
const STATIC = ["/", "/beats", "/about", "/artists", "/contact", "/mixing", "/drum-kits", "/merch", "/logo.png", "/icons/icon-192x192.png", "/icons/icon-512x512.png"];

// Never store private or per-buyer responses on the device: admin data, API responses,
// order pages (they contain download links) and the cart.
const NO_CACHE = ["/admin", "/api/", "/checkout", "/cart"];

function cacheable(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  return !NO_CACHE.some((p) => url.pathname === p || url.pathname.startsWith(p));
}

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)));
  self.skipWaiting();
});

// Activating v3 deletes older caches, which may hold admin or order data saved by the previous worker
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || !cacheable(e.request)) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener("push", (e) => {
  if (!e.data) return;
  let data = { title: "LuchiBeats", body: "You have a new notification.", url: "/" };
  try { data = { ...data, ...e.data.json() }; } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      data: { url: data.url },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const url = e.notification.data?.url ?? "/";
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
