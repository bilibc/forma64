# Forma64 · activar los avisos con la pantalla bloqueada

Para que los mensajes de motivación te lleguen como **globo en la pantalla bloqueada y con la app cerrada**, hace falta un pequeño servidor que los envíe. Es **gratis** (plan gratuito de Cloudflare, sin tarjeta) y solo hay que pegar unos valores en un formulario.

## 1. Cuenta de Cloudflare (si no tienes)

Entra en <https://dash.cloudflare.com/sign-up>. Solo correo y contraseña, no pide tarjeta.

## 2. Crear la base de datos de suscripciones

1. En el menú izquierdo, **Storage & Databases → KV** (o busca "KV" en el buscador de arriba).
2. **Create namespace**.
3. Nombre: `PUSH_SUBS` → **Add**.

## 3. Crear el worker

1. **Workers & Pages → Create application → Create Worker**.
2. Nombre: `forma64-push` → **Deploy** (escribe lo que quieras en la descripción; el código de ejemplo se sustituye después).
3. En la página del worker, **Edit code**.
4. **Borra todo** y pega el contenido completo de **`worker.js`** (está en este repo).
5. **Deploy** (arriba a la derecha).

## 4. Vincular la base de datos al worker

En tu worker → **Settings → Bindings → Add → KV namespace**:

- **Variable name:** `PUSH_SUBS`
- **KV namespace:** el `PUSH_SUBS` que creaste en el paso 2

→ **Save**.

## 5. Poner las claves VAPID

En **Settings → Variables and Secrets → Add** (dos veces):

| Tipo | Name | Value |
|---|---|---|
| **Secret** | `VAPID_PRIVATE_KEY` | la clave privada que te he pasado por chat |
| **Plain text** | `VAPID_PUBLIC_KEY` | `BMg2VZ_iggrZ1e2Dd7ddu3VRZuE8o3jN70sY_bnsU4wm21D8V4B9YmnD3oRUGPbhyl2WBedD6nEtXTBDYfsbgTg` |

**Save**.

## 6. Horario de los avisos

En **Settings → Triggers → Cron Triggers → Add** escribe:

```
*/30 * * * *
```

→ **Add cron trigger**. El worker solo envía a las **9:00, 14:30 y 21:00** de tu hora local (calcula tu zona sola).

## 7. Copiar la URL del worker

Arriba verás la URL que le ha quedado, algo así:

```
https://forma64-push.tu-usuario.workers.dev
```

Cópiala (con el `https://`).

## 8. Decírsela a la app

1. En este repo → **`app.js`** → **✏️ Edit**.
2. Busca la línea que empieza por `const PUSH_WORKER_URL` y reemplázala entera por la de tu worker:

```js
const PUSH_WORKER_URL = 'https://forma64-push.tu-usuario.workers.dev';
```

3. **Commit changes**. GitHub Pages reconstruye la app sola en 1–2 minutos.

## 9. Activarlo en el móvil

1. Abre la **app instalada** (no la versión del navegador).
2. Pestaña **HOY** → toca la **campanita** de arriba a la derecha del mensaje del día.
3. Acepta **Permitir**.
4. Listo: a las 9:00, 14:30 y 21:00 te llega el globo con la pantalla bloqueada.

- **Android (Chrome):** funciona instalado o en el navegador.
- **iPhone:** requiere tenerla instalada en la pantalla de inicio (iOS 16.4 o posterior). Desde la pestaña de Safari no se puede.

Si te sale un aviso y no llega con el móvil bloqueado, dímelo: revisamos que el paso 8 se hiciera con la URL correcta.
