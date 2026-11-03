// Service worker E-RHK: aplikasi bisa di-install dan tetap terbuka tanpa sinyal.
// Halaman selalu diambil terbaru dari internet; salinan lama hanya dipakai saat offline.
const CACHE = 'erhk-v14';
const FILE = ['./', './index.html', './admin.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
              './icon-maskable-512.png', './apple-touch-icon.png', './favicon.png', './pdf-lib.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILE.map(f => c.add(f).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;   // data ke server tidak disimpan
  if (new URL(req.url).pathname.indexOf('/media/') > -1) return;   // video/foto login: biarkan browser (pemutaran video butuh potongan/range)
  e.respondWith(
    fetch(req).then(r => { const salin = r.clone(); caches.open(CACHE).then(c => c.put(req, salin)); return r; })
              .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
