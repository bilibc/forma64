/* Forma64 · service worker: app instalada + offline + avisos push */
const CACHE = 'forma64-v4';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './qrcode.min.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

/* mensajes de motivación (los mismos que en la app) */
const MSG = [
  [ // mañana
    'Hoy no es ensayo, Mario: es el día. Dos comidas limpias y 8 mil pasos y el plan va solo.',
    'Levántate antes de que la cabeza te convenza de lo contrario. La ropa ya está lista.',
    'La báscula del lunes manda. Lo que hagas esta mañana decide cómo suena.',
    'No tienes que ser perfecto hoy. Solo dos comidas y salir a andar.',
    'El 64 no se consigue en un día: se consigue en días como hoy.',
    'Antes de las 7 nadie te lo pone difícil. Aprovecha la mañana en silencio.',
    'Un vaso de agua nada más levantarte. Pequeño, pero suma.',
    'Hoy toca comida y cena decentes. El resto, a paseo.',
    'Tu yo de dentro de dos meses te está mirando. No le falles hoy.',
    'Empieza el día con diez minutos de paseo y ya llevas la mitad de los pasos.',
    'No esperes a tener ganas. Las ganas llegan después de empezar.',
    'Una decisión buena tras otra. Eso es todo el plan, Mario.',
    'Mírate en el espejo: esto es el «antes». Empieza a cambiarlo hoy.',
    'Descansa bien esta noche. Hoy vuelve el plan y tú también.',
    'Sin desayuno ni penas: tu primera comida del día ya está decidida por ti.'
  ],
  [ // tarde
    'Bien hecho, Mario: la comida ya está. Ahora solo falta no estropearlo esta tarde.',
    'El antojo de las 6 es el enemigo. Agua, un café solo y se pasa.',
    'Mitad del día ganada. La segunda mitad se gana andando.',
    'Recuerda por qué empezaste: para no mirarte fofo en el espejo.',
    'Si hoy te pasas en la cena, no pasa nada. Lo que cuenta es la semana.',
    'Diez minutos de paseo después de comer y el plan sigue rodando.',
    'No estás a dieta: estás construyendo el cuerpo del próximo año.',
    'El hambre que sientes ahora es la grasa quejándose. Déjala.',
    'Sigue así y el sábado te ganas la cena libre.',
    'No compares tu semana con la de nadie. Compara el 72 con el 64.',
    'Tarde perfecta para escaleras en vez de ascensor. Rápido y gratis.',
    'La constancia pesa más que la intensidad. Y hoy ya has sido constante.',
    'Pronto podrás ponerte esa camiseta. Esa es la recompensa.',
    'Si te entra el bajón, recuerda: 4 kg solo era el primer mes. Esto baja.',
    'Una comida limpia más en el casillero. Así se gana esto.'
  ],
  [ // noche
    'Bien hecho, Mario. Sigue así mañana. A las 23:00, a la cama.',
    'Comida marcada, cena marcada. Día resuelto. Buenas noches.',
    'Has hecho hoy lo que tocaba. Eso es todo lo que se pedía. Descansa.',
    'Cierra los ojos sabiendo que ganaste el día. Mañana, otra vez.',
    'El cuerpo cambia de noche, durmiendo. Ocho horas y despierta nuevo.',
    'Nada de pantallas media hora antes. El plan no termina con la cena.',
    'Buen trabajo hoy, Mario. Mañana hay más: dos comidas y pasos.',
    'La constancia de esta noche es la báscula del lunes. A dormir.',
    'Menos peso cada lunes, más fuerza cada semana. Buenas noches, campeón.',
    'Hoy has elegido bien. Mañana también. Prometido.',
    'Apaga todo y descansa: dormir también es parte de la dieta.',
    'Bien hecho, sigue así. El 64 está a dos meses de noches como esta.',
    'Hasta mañana, Mario. La nevera estará esperando con lo tuyo.',
    'Día completo, día ganado. No hay mejor forma de cerrarlo. A dormir.',
    'La cama a las 23:00 no es fruta: es táctica. Buenas noches, Mario.'
  ]
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit =>
      hit || fetch(e.request).then(res => {
        const copy = res.clone();
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
    ).catch(() => caches.match('./index.html'))
  );
});

/* ---------- avisos push (llegan con la pantalla bloqueada) ---------- */
function slotNow() { const h = new Date().getHours(); return h < 14 ? 0 : h < 21 ? 1 : 2; }
function msgFor(slot) {
  const dayN = Math.floor(Date.now() / 864e5);
  return MSG[slot][(dayN * 3 + slot) % MSG[slot].length];
}

self.addEventListener('push', e => {
  const slot = slotNow();
  const title = slot === 0 ? 'Buenos días, Mario' : slot === 1 ? 'Sigue así, Mario' : 'Buenas noches, Mario';
  e.waitUntil(
    self.registration.showNotification(title, {
      body: msgFor(slot),
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag: 'f64-push-' + slot + '-' + Math.floor(Date.now() / 864e5),
      data: { url: './' }
    })
  );
});

self.addEventListener('pushsubscriptionchange', e => {
  // si la suscripción caduca, la app la renueva la próxima vez que se abre
  e.waitUntil(Promise.resolve());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if ('focus' in c) { c.navigate(url); return c.focus(); }
      }
      return clients.openWindow(url);
    })
  );
});