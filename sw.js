/* Japan 2026 — offline service worker
   Caches the app shell and, at runtime, the Leaflet library and any
   map tiles you've already viewed, so the guide keeps working with no signal. */
const VERSION = "japan2026-v1";
const CORE = "core-" + VERSION;
const RUNTIME = "runtime-" + VERSION;

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CORE)
      // addAll fails the whole install if one cross-origin asset is unavailable;
      // add them individually and ignore failures so the core install still succeeds.
      .then(cache => Promise.allSettled(CORE_ASSETS.map(u => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CORE && k !== RUNTIME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function isTile(url){
  return /basemaps\.cartocdn\.com|tile\.openstreetmap\.org/.test(url) ||
         /unpkg\.com\/leaflet.*(png|svg)$/.test(url) ||
         /fonts\.gstatic\.com/.test(url);
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);

  // App shell / navigations: cache-first, fall back to cached index.html offline.
  if(req.mode === "navigate"){
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CORE).then(c => c.put("./index.html", copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Map tiles, fonts, leaflet images: cache-first, then network + store.
  if(isTile(url.href)){
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(RUNTIME).then(c => c.put(req, copy));
        return res;
      }).catch(() => hit))
    );
    return;
  }

  // Everything else: cache-first with network fallback.
  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if(res.ok && (url.origin === location.origin || /unpkg\.com|googleapis\.com/.test(url.href))){
        const copy = res.clone();
        caches.open(RUNTIME).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => hit))
  );
});
