# Backend en Vercel

El proyecto usa la integración nativa de Express en Node.js, con **Root Directory: Backend**.
`Backend/app.js` exporta la app; Vercel gestiona HTTP. `src/server.js` sigue siendo la entrada local
con puerto, señales y cierre de Prisma. Las rutas conservan `/api`, sin rewrites ni carpeta api.

## Importar el repositorio

1. En Vercel, importar el repositorio Git y crear un proyecto para el backend.
2. Elegir **Root Directory: Backend**, **Framework Preset: Express** y **Node.js: 22.x**.
3. Permitir archivos fuera del Root Directory para acceder al workspace y al único pnpm-lock.yaml.
4. Conservar `Backend/vercel.json`: instalación `pnpm install --frozen-lockfile`, build `pnpm run build`.
   El build comprueba sintaxis y genera/compila Prisma; no conecta ni ejecuta migraciones.
   No configurar un Output Directory de frontend; Express no genera dist.
5. Configurar las variables privadas siguientes antes del despliegue. Separar Production y Preview;
   no usar la base de producción en previews de ramas.
6. Desplegar y comprobar `https://<dominio-api>/api/health`. Respuesta esperada:
   `{ "data": { "status": "ok", "service": "vocessilentes-api" } }`.
   Esto comprueba HTTP; probar login/me/logout después para comprobar persistencia y cookies.

`GET /` devuelve 404 `NOT_FOUND` porque la API no publica una página de inicio; no indica por sí
solo un fallo del despliegue. Comprobar `/api/health` y el preflight de auth con el Origin real.
Para el frontend usar el dominio estable `https://voces-silentes-platform.vercel.app/api`;
las URLs de despliegues individuales pueden exigir autenticación de Vercel y devolver un redirect
al proveedor antes de llegar a Express. No usarlas como VITE_API_URL.

Vercel administra parches de Node 22. El workspace requiere al menos 22.23.1 y fija esa versión
localmente; si el build informa un Node menor, comprobar la versión del runtime en Vercel.

## Variables en Settings → Environment Variables

| Variable            | Valor / requisito                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `NODE_ENV`          | `production`, también en Preview para emitir cookies Secure                                  |
| `DATABASE_URL`      | URL PostgreSQL privada; en Supabase se puede usar pool Transaction 6543 con TLS              |
| `CORS_ORIGINS`      | Origen HTTPS exacto del frontend, sin barra final ni `/api`; varios separados por coma       |
| `CSRF_SECRET`       | 64 caracteres hexadecimales aleatorios privados, persistentes y compartidos entre instancias |
| `SESSION_SAME_SITE` | `lax` si frontend/API comparten sitio; `none` si son sitios diferentes                       |
| `LOG_LEVEL`         | `info` o el nivel autorizado                                                                 |

`VERCEL=1` la establece la plataforma; no añadirla al entorno del servidor local.
`HOST`, `PORT` y `TRUST_PROXY_IPS` no necesitan configurarse en Vercel. Esta entrada confía en
**un salto** exclusivamente cuando el entorno privado indica Vercel; así Express interpreta HTTPS
y la IP proporcionados por su proxy. No se habilita por headers de una solicitud. Si se añade otro
proxy delante de Vercel, revisar esa topología antes de cambiar confianza o limitación.

No copiar `.env` al repositorio ni subirlo con la CLI. `.vercelignore` excluye secretos y artefactos
locales; Prisma se reconstruye en Vercel. `DIRECT_URL` y `SHADOW_DATABASE_URL` son para herramientas
de migración, no requisitos del runtime ni del build. Aplicar SQL aprobado desde un entorno privado
siguiendo [migrations.md](migrations.md), sin automatizar migraciones en cada despliegue.

Guardar/generar CSRF_SECRET en un gestor de secretos y copiarlo solo al entorno privado de Vercel.
Un cambio de ese secreto invalida tokens CSRF existentes; no exponerlo en VITE_* o logs.

## Conectar el frontend

Configurar la variable pública `VITE_API_URL=https://<dominio-api>/api` en el frontend y reconstruirlo.
Configurar `CORS_ORIGINS` con el dominio real del frontend, incluidas únicamente previews autorizadas.
No usar comodines. El cliente existente ya envía cookies y X-CSRF-Token.

Los subdominios independientes de `vercel.app` son sitios distintos: requieren `SESSION_SAME_SITE=none`.
Algunos navegadores bloquean cookies de terceros aun con None/Secure; para autenticación consistente,
usar dominios del mismo sitio, por ejemplo `app.<dominio-propio>` y `api.<dominio-propio>`, con `lax`.

## CLI instalada en el workspace

La CLI está fijada como dependencia de desarrollo, sin instalación global. Desde la raíz:

```powershell
pnpm vercel --version
pnpm vercel login
pnpm vercel link
pnpm vercel pull --environment=preview
pnpm vercel build
pnpm vercel deploy --prebuilt
```

Vincular el proyecto importado con Root Directory Backend. `pull` guarda configuración/variables
de Preview en `.vercel/`, ignorada por Git, ESLint y Prettier. `build` requiere proyecto vinculado
y acceso a Vercel; el build local del backend puede comprobarse sin cuenta mediante
`pnpm --filter @vocessilentes/backend build`. Para producción, usar pull/build con entorno de producción
y `deploy --prebuilt --prod` solo al decidir publicar.

## Conexiones y límites reales

Se reutiliza un Prisma Client por instancia, sin abrir conexión durante la inicialización de health.
En Vercel, PrismaPg usa un pool pg de hasta cinco conexiones, espera de conexión de cinco segundos
y liberación ociosa a los cinco segundos. `attachDatabasePool` libera conexiones ociosas antes de
suspender Fluid compute; Prisma conserva `$disconnect()` como cierre del pool externo.
No se desconecta Prisma después de cada solicitud, para permitir reutilización y concurrencia.

Los límites de auth actuales usan MemoryStore por instancia; no son cuotas globales entre réplicas.
Para producción con tráfico, configurar protección de intentos en el borde o acordar un almacén
compartido, como explica [authentication.md](authentication.md#intentos-y-limitación).
La preparación local no verifica un despliegue remoto, sus variables, TLS ni permisos PostgreSQL.

Fuentes oficiales: [Express en Vercel](https://vercel.com/docs/frameworks/backend/express),
[headers del proxy](https://vercel.com/docs/headers/request-headers),
[Node.js](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions),
[Prisma con Fluid compute](https://www.prisma.io/docs/orm/v7/prisma-client/deployment/serverless/deploy-to-vercel).
