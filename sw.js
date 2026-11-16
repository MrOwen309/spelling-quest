// Spelling Quest offline support: always try the internet first (so word-list
// changes on GitHub show up), and fall back to the saved copy when offline.
const CACHE = "spelling-quest-v3";
const FILES = ["./", "./index.html", "./words.txt", "./manifest.webmanifest",
               "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const key = req.url.split("?")[0];
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
      return res;
    }).catch(() => caches.match(key, { ignoreSearch: true }).then(r => r || caches.match("./index.html")))
  );
});
