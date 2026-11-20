/* OmniQuest offline support.
   - Opens instantly from the saved copy, then quietly updates it in the background.
   - Never waits more than 3 seconds for a slow connection.
   - Also saves the fonts and the human body picture so they work offline.
   AI features (Verity, lessons, tests) still need the internet. */
const CACHE = "omniquest-v4";
const BODY_IMG = "https://upload.wikimedia.org/wikipedia/commons/0/00/202403_human_anatomy_organs.svg";
const FILES = ["/", "/style.css", "/script.js", "/atom-lab.js", "/verity-voice.js", "/omniquest.js", "/maths.html", "/science.html", "/manifest.json", "/icon.svg"];
const OUTSIDE = ["fonts.googleapis.com", "fonts.gstatic.com", "upload.wikimedia.org"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => Promise.all([
    ...FILES.map(f => cache.add(f).catch(() => null)),
    fetch(new Request(BODY_IMG, { mode: "no-cors" })).then(res => cache.put(BODY_IMG, res)).catch(() => null)
  ])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// fetch, but give up after `ms` milliseconds
function fetchWithin(req, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("slow")), ms);
    fetch(req).then(res => { clearTimeout(timer); resolve(res); }, err => { clearTimeout(timer); reject(err); });
  });
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // fonts and the body picture: use the saved copy if we have one
  if (OUTSIDE.includes(url.hostname)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(req, { ignoreSearch: url.hostname === "upload.wikimedia.org" }).then(hit => hit || fetchWithin(req, 3000).then(res => {
      if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
      return res;
    }).catch(() => new Response("", { status: 504 })))));
    return;
  }

  if (url.origin !== location.origin || url.pathname.startsWith("/api/") || url.pathname.includes("/.netlify/")) return;

  // our own files: get the newest version, but never wait more than 3 seconds; use the saved copy if offline or slow
  event.respondWith(caches.open(CACHE).then(cache => fetchWithin(req, 3000).then(res => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => cache.match(req, { ignoreSearch: true }).then(hit => hit || (req.mode === "navigate" ? cache.match("/") : fetch(req))))));
});
