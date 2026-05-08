# Yakero Frontend Docker Deploy

Guia de despliegue productivo para el frontend React/Vite servido con nginx.

## Estrategia

Vite embebe las variables `VITE_*` durante el build. Por eso `VITE_API_BASE_URL` debe definirse como build arg al construir la imagen, no solo como variable runtime del contenedor.

El contenedor final usa `nginx:1.27-alpine` y sirve `dist/` en el puerto `80`.

## Variables

Variables publicas soportadas:

| Variable                      | Uso                                   | Ejemplo                        |
| ----------------------------- | ------------------------------------- | ------------------------------ |
| `VITE_API_BASE_URL`           | URL publica del backend FastAPI       | `https://api.yakero.cl/api/v1` |
| `VITE_APP_ENV`                | Etiqueta de ambiente                  | `production`                   |
| `VITE_MP_CHECKOUT_URL`        | Override opcional para Checkout Pro   | vacio normalmente              |
| `VITE_MERCADOPAGO_PUBLIC_KEY` | Public key si se necesita SDK browser | vacio actualmente              |
| `FRONTEND_PORT`               | Puerto host para compose              | `8080`                         |
| `YAKERO_FRONTEND_TAG`         | Tag de imagen compose                 | `latest`                       |

No incluir access tokens, webhook secrets, credenciales de base de datos ni claves privadas en este frontend.

## Build Manual

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.yakero.cl/api/v1 \
  --build-arg VITE_APP_ENV=production \
  -t yakero-frontend:latest .
```

## Run Manual

```bash
docker run -d \
  --name yakero-frontend \
  --restart unless-stopped \
  -p 8080:80 \
  yakero-frontend:latest
```

## Docker Compose

Crear un `.env` de despliegue en el VPS o configurar variables desde Portainer:

```env
VITE_API_BASE_URL=https://api.yakero.cl/api/v1
VITE_APP_ENV=production
FRONTEND_PORT=8080
YAKERO_FRONTEND_TAG=latest
```

Levantar:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## nginx

`nginx.conf` incluye:

- fallback SPA con `try_files $uri $uri/ /index.html`
- soporte para rutas React como `/payment/status/:externalReference`
- gzip basico
- cache largo para `/assets/`
- `index.html` sin cache para publicar nuevas versiones sin quedar pegado al HTML anterior

## Conexion Con Backend

`VITE_API_BASE_URL` debe apuntar a la URL publica alcanzable desde el navegador del cliente, por ejemplo:

```env
VITE_API_BASE_URL=https://api.yakero.cl/api/v1
```

Si frontend y backend viven detras de un reverse proxy del VPS:

- frontend: `https://yakero.cl`
- backend: `https://api.yakero.cl/api/v1`
- Mercado Pago webhook: debe apuntar al backend publico, no al frontend

## Checklist Produccion

- `VITE_API_BASE_URL` usa HTTPS y dominio publico.
- Backend permite CORS desde el dominio frontend.
- Mercado Pago tiene back URLs y webhook apuntando a dominios publicos correctos.
- `docker build` termina correctamente.
- `docker run` o Portainer expone el puerto esperado.
- Rutas SPA funcionan al recargar: `/checkout/success`, `/checkout/pending`, `/payment/status/<ref>`.
- `index.html` no queda cacheado por proxy/CDN.
- No se copian `.env` ni secretos reales a la imagen.
- El backend sigue siendo quien crea pedidos via webhook approved.
