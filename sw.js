/* Service worker: HTML = network-first, assets = cache-first */
const CACHE_NAME = "ab-campo-v4"; // <-- sube a v5/v6 en futuras actualizaciones

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // 1) Para navegación (HTML): primero internet, si falla usa caché
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        const copy1 = res.clone();
        const copy2 = res.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(req, copy1);
        await cache.put("./index.html", copy2);
        return res;
      } catch (e) {
        const cached = await caches.match(req);
        return cached || (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  // 2) Para assets: caché primero, si no existe -> internet y guarda
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (req.method === "GET") {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});

