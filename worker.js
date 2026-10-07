// Forma64 · relay de avisos (Cloudflare Worker)
// - Guarda la suscripción push del móvil en KV (PUSH_SUBS)
// - Cada 30 min revisa la hora local de cada suscriptor y envía los avisos
//   de las 9:00 / 14:30 / 21:00
// - Envío VAPID sin cuerpo: el service worker de la app elige el mensaje
//   según la hora local, así no se repiten casi nunca.
//
// Necesita en el worker:
// - KV namespace  -> binding  PUSH_SUBS
// - Variable      -> VAPID_PUBLIC_KEY   (clave pública VAPID, base64url)
// - Secreto       -> VAPID_PRIVATE_KEY  (clave privada VAPID, base64url)
// - Cron trigger  -> cada 30 minutos (en el panel: */30 * * * *), en su
//   propia línea con // para no cerrar este comentario
// Ver PUSH-ACTIVACION.md

const B64U = {
  enc: s => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  dec: b64u => {
    const add = '='.repeat((4 - (b64u.length % 4)) % 4);
    const bin = atob(b64u.replace(/-/g, '+').replace(/_/g, '/') + add);
    return Uint8Array.from(bin, c => c.charCodeAt(0));
  },
};

function cors(res) {
  const r = new Response(res.body, res);
  r.headers.set('Access-Control-Allow-Origin', '*');
  r.headers.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  r.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return r;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return cors(new Response('ok'));

    if (request.method === 'POST' && url.pathname === '/subscribe') {
      try {
        const body = await request.json();
        if (!body || !body.subscription || !body.subscription.endpoint || !body.subscription.keys) {
          return cors(new Response('bad payload', { status: 400 }));
        }
        const tz = typeof body.tz === 'string' && body.tz.length < 64 ? body.tz : 'Europe/Madrid';
        await env.PUSH_SUBS.put(
          body.subscription.endpoint,
          JSON.stringify({ subscription: body.subscription, tz }),
          { expirationTtl: 1209600 } // 14 días; se renueva cada vez que abres la app
        );
        return cors(new Response('ok'));
      } catch (e) {
        return cors(new Response('bad', { status: 400 }));
      }
    }

    if (request.method === 'DELETE' && url.pathname === '/subscribe') {
      try {
        const body = await request.json();
        if (body.endpoint) await env.PUSH_SUBS.delete(body.endpoint);
        return cors(new Response('ok'));
      } catch (e) {
        return cors(new Response('bad', { status: 400 }));
      }
    }

    return cors(new Response('Forma64 push relay'));
  },

  async scheduled(event, env) {
    const list = await env.PUSH_SUBS.list({ limit: 1000 });
    const now = new Date();
    const jobs = [];
    for (const { name } of list.keys) {
      const rec = await env.PUSH_SUBS.get(name, 'json');
      if (!rec || !rec.subscription || !rec.subscription.endpoint) {
        await env.PUSH_SUBS.delete(name);
        continue;
      }
      const hm = now.toLocaleTimeString('en-GB', {
        timeZone: rec.tz || 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      if (hm === '09:00' || hm === '14:30' || hm === '21:00') {
        jobs.push(sendPush(env, rec.subscription, name));
      }
    }
    await Promise.allSettled(jobs);
  },
};

async function sendPush(env, sub, key) {
  try {
    const aud = new URL(sub.endpoint).origin;
    const header = await vapidHeader(env, aud);
    const res = await fetch(sub.endpoint, {
      method: 'POST',
      headers: { 'Authorization': 'vapid ' + header, 'TTL': '3600', 'Content-Type': 'application/octet-stream' },
      body: null,
    });
    if (res.status === 404 || res.status === 410) {
      await env.PUSH_SUBS.delete(key); // suscripción muerta, la limpiamos
    } else if (!res.ok) {
      console.log('push fail', res.status, sub.endpoint.slice(0, 60));
    }
    return res;
  } catch (e) {
    console.log('push err', String(e));
    return null;
  }
}

async function vapidHeader(env, audience) {
  const pub = B64U.dec(env.VAPID_PUBLIC_KEY); // punto no comprimido (65 bytes)
  const x = B64U.enc(String.fromCharCode.apply(null, pub.subarray(1, 33)));
  const y = B64U.enc(String.fromCharCode.apply(null, pub.subarray(33, 65)));
  const key = await crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', x, y, d: env.VAPID_PRIVATE_KEY },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  const header = B64U.enc(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const payload = B64U.enc(JSON.stringify({
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: 'mailto:aviso@forma64.app',
  }));
  const input = header + '.' + payload;
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(input));
  return 't=' + input + '.' + B64U.enc(String.fromCharCode.apply(null, new Uint8Array(sig))) + ', k=' + env.VAPID_PUBLIC_KEY;
}