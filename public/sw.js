// Service worker do Enraizar: deixa o app instalável e abre a casca mesmo sem rede.
// Regras: /api nunca passa pelo cache (dados sempre do servidor); a página vem da rede primeiro,
// para um deploy novo valer na hora; os arquivos de /assets têm nome com hash e podem ficar guardados.
const CACHE = 'enraizar-v1';
const CASCA = ['/', '/manifest.webmanifest', '/icones/icone-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CASCA)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  // navegação: rede primeiro; sem rede, a casca guardada
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((r) => {
        if (r.ok && url.pathname === '/') { const copia = r.clone(); caches.open(CACHE).then((c) => c.put('/', copia)); }
        return r;
      }).catch(() => caches.match('/'))
    );
    return;
  }

  // arquivos com hash e imagens: cache primeiro, rede se faltar
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icones/') || url.pathname.startsWith('/enraizar/')) {
    e.respondWith(
      caches.match(req).then((guardado) => guardado || fetch(req).then((r) => {
        if (r.ok) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
        return r;
      }))
    );
  }
});
