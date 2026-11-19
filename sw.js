/* OmniQuest offline support: keeps the website working without internet.
   AI features (Verity, lessons, tests) still need the internet. */
const CACHE = "omniquest-v1";
const FILES = ["/", "/style.css", "/script.js", "/atom-lab.js", "/verity-voice.js", "/omniquest.js", "/maths.html", "/science.html", "/manifest.json", "/icon.svg"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => Promise.all(FILES.map(f => cache.add(f).catch(() => null)))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/") || url.pathname.includes("/.netlify/")) return;
  // Try the internet first (so updates show up), fall back to the saved copy when offline
  event.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || (req.mode === "navigate" ? caches.match("/") : undefined)))
  );
});
