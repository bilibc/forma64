/* FORJA · service worker: app instalada + offline + avisos push */
importScripts('mensajes.js');
const CACHE = 'forja-v1';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './mensajes.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* red primero (se actualiza sola); sin red, lo guardado */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.ok && new URL(e.request.url).origin === location.origin) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
  );
});

/* avisos: el relay de Cloudflare manda un push vacío a las 10:30, 15:00 y 23:00 */
self.addEventListener('push', e => {
  const now = new Date();
  const slot = forjaSlot(now.getHours());
  const dia = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 864e5);
  e.waitUntil(self.registration.showNotification(FORJA_TITULOS[slot], {
    body: forjaMsg(slot, dia), icon: 'icon-192.png', badge: 'icon-192.png',
    tag: 'forja-' + slot + '-' + dia, data: { url: './' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if ('focus' in c) return c.focus();
    return clients.openWindow('./');
  }));
});
