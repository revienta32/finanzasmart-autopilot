const CACHE_NAME = "pureai-studio-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./clean-ai-studio.html",
  "./styles.css",
  "./telemetria-soporte.js",
  "./privacy-policy.html",
  "./terms.html",
  "./manifest.webmanifest",
  "./pureai-icon-128x128.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const reqUrl = new URL(e.request.url);
  if (reqUrl.origin !== self.location.origin) return;

  // Navigation requests: Network-first with automatic cache update and offline fallback to clean-ai-studio.html
  if (e.request.mode === "navigate" || (e.request.headers.get("accept") || "").includes("text/html")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(e.request, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches.match(e.request).then((cached) => cached || caches.match("./clean-ai-studio.html") || caches.match("./index.html"))
        )
    );
    return;
  }

  // Static assets: Cache-first with background revalidation (Stale-While-Revalidate)
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const networkFetch = fetch(e.request)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(e.request, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
