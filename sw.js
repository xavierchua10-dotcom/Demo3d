// Minimal service worker for the Demo3d sandbox.
//
// Deliberately does NOT cache anything. Its only job is to exist and
// register, since that's one of the installability criteria browsers
// check before offering "Add to Home Screen" / allowing standalone
// (full-screen, no address bar) launch. A real caching strategy would
// actively work against how this sandbox is used right now — it's
// edited and pushed constantly, and every fetch should just go to the
// network so testing always reflects the latest version, no stale
// cache, no "why isn't my change showing up" debugging.
//
// If this sandbox ever stabilizes and stops changing every few
// minutes, revisit this to add real offline caching (see IronLedger's
// own service worker for that pattern) — until then, passthrough only.

self.addEventListener('install', function(event){
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event){
  event.respondWith(fetch(event.request));
});
