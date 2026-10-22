# Dependencias y decisiones de versiones

Consulta realizada el 9 de octubre de 2026. Se verificaron documentación oficial, publicaciones de
npm y engines/peerDependencies. Se eligieron publicaciones estables explícitas, excluyendo rc y nightly
aunque un dist-tag pudiera apuntar a ellas (el latest de Prisma apuntaba a 8.0.0-rc.22).
El único pnpm-lock.yaml fija transitivas. pnpm exige engines y peers compatibles; no se usó --force.

## Herramientas

| Herramienta                 | Versión          | Razón                                                                                  |
| --------------------------- | ---------------- | -------------------------------------------------------------------------------------- |
| Node.js                     | 22.23.1 LTS      | Disponible y compatible con todos los engines; reproducido en CI y archivos de versión |
| pnpm                        | 10.18.2          | Disponible, workspaces y scripts de instalación controlados                            |
| ESLint / @eslint/js         | 10.12.0 / 10.0.1 | Configuración flat ESM                                                                 |
| Prettier                    | 3.9.9            | Formato común y LF                                                                     |
| eslint-config-prettier      | 10.1.8           | Evita conflictos de formato sin desactivar controles funcionales                       |
| eslint-plugin-jsdoc         | 65.2.2           | Contratos exportados y consistencia de anotaciones                                     |
| eslint-plugin-react-hooks   | 7.1.1            | Reglas de hooks                                                                        |
| eslint-plugin-react-refresh | 0.5.7            | Exportaciones compatibles con Fast Refresh                                             |
| globals                     | 17.13.0          | Entornos navegador y Node                                                              |
| vercel                      | 63.1.2           | CLI local de desarrollo para vincular, construir y publicar la API en Vercel           |

## Frontend

| Dependencia                     | Versión        | Clasificación / necesidad                                     |
| ------------------------------- | -------------- | ------------------------------------------------------------- |
| react / react-dom               | 19.3.0         | Producción; renderizado                                       |
| react-router                    | 8.4.0          | Producción; rutas declarativas                                |
| zod                             | 4.6.5          | Producción; configuración pública validada                    |
| @mediapipe/tasks-vision         | 1.1.0          | Producción; preparación solicitada, carga futura bajo demanda |
| vite / @vitejs/plugin-react     | 8.3.4 / 6.1.2  | Desarrollo; build y React Fast Refresh                        |
| tailwindcss / @tailwindcss/vite | 4.3.3          | Desarrollo; CSS compilado mediante plugin oficial             |
| vitest / jsdom                  | 5.0.3 / 30.1.2 | Desarrollo; pruebas en DOM                                    |
| @testing-library/react          | 16.3.3         | Desarrollo; pruebas de UI                                     |
| @testing-library/dom            | 10.4.1         | Desarrollo; peer explícito de Testing Library                 |
| @testing-library/jest-dom       | 7.0.1          | Desarrollo; aserciones DOM                                    |
| @testing-library/user-event     | 14.6.7         | Desarrollo; acciones del usuario                              |

## Backend

Ampliación del 21 de octubre: **sharp 0.35.5** en producción, versión estable publicada en
[releases oficiales](https://github.com/lovell/sharp/releases/tag/v0.35.5), para decodificar y
recodificar evidencias en el servidor con límites de píxeles/tiempo. Compatible con Node 22;
el lockfile fija los binarios opcionales por plataforma. Para reutilizar las credenciales S3
existentes se fijan `@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner` **3.1155.0**:
transporte S3 y firma SigV4 oficiales, sin implementar criptografía propia. No se instala el SDK
Supabase Auth; la conexión PostgreSQL y las sesiones propias se conservan.

| Dependencia                         | Versión         | Clasificación / necesidad                                                                      |
| ----------------------------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| express                             | 5.3.0           | Producción; HTTP                                                                               |
| @prisma/client / @prisma/adapter-pg | 7.10.0          | Producción; cliente y adaptador requeridos por Prisma 7                                        |
| pg                                  | 8.23.1          | Producción; driver PostgreSQL del adaptador                                                    |
| @vercel/functions                   | 3.9.11          | Producción; attachDatabasePool para liberar conexiones ociosas con Fluid compute               |
| zod / dotenv                        | 4.6.5 / 18.0.7  | Producción; validación y carga del entorno privado                                             |
| cors / helmet                       | 2.8.6 / 8.3.0   | Producción; política de orígenes y cabeceras                                                   |
| pino / pino-http                    | 10.4.0 / 11.0.0 | Producción; logs estructurados de proceso y HTTP                                               |
| prisma                              | 7.10.0          | Desarrollo; CLI de esquema, generación y migraciones                                           |
| esbuild                             | 0.25.12         | Desarrollo; compilar salida TypeScript del generador oficial a JavaScript ESM                  |
| supertest                           | 7.3.1           | Desarrollo; pruebas HTTP con node:test integrado en Node                                       |
| @electric-sql/pglite                | 0.5.8           | Desarrollo; PostgreSQL WASM en memoria para comprobar el SQL sin escribir fixtures en Supabase |
| argon2                              | 0.45.1          | Producción; Argon2id y binding nativo mantenido, salt aleatorio                                |
| cookie-parser                       | 1.4.7           | Producción; lectura centralizada de cookies HttpOnly para sesión/CSRF                          |
| csrf-csrf                           | 4.0.3           | Producción; double-submit firmado HMAC ligado a contexto/sesión                                |
| express-rate-limit                  | 8.7.1           | Producción; ventanas IP e IP+identificador, MemoryStore sin Redis                              |
| @electric-sql/pglite-socket         | 0.2.11          | Desarrollo; protocolo PostgreSQL TCP para integración PrismaPg real en base efímera            |

No se agregaron Redux, microservicios, Docker, colas, Redis, JWT ni otra solución de autenticación.

La CLI Vercel y @vercel/functions se comprobaron en npm: ambas requieren Node >=20, compatible
con Node 22.23.1. Se fijaron versiones estables y se mantuvo un único lockfile. La CLI no se incluye
como dependencia del runtime del backend. La integración sigue las guías oficiales de
[Express](https://vercel.com/docs/frameworks/backend/express) y
[Prisma/Fluid compute](https://www.prisma.io/docs/orm/v7/prisma-client/deployment/serverless/deploy-to-vercel).
Las dependencias de auth se justifican en [authentication.md](authentication.md); no se implementan
primitivas criptográficas CSRF ni hashing de contraseñas propios.
PGlite se añade únicamente a devDependencies para pruebas de restricciones y permisos reales de SQL;
no hay servidor PostgreSQL local disponible y la base compartida no se usa para pruebas destructivas.
PGliteSocketServer permite verificar Express → PrismaPg/pg → SQL por TCP; no se usa en runtime.
No sustituye pg, PrismaPg ni Supabase en runtime. Su motor 18.3 y los límites frente a PostgreSQL
17.11 remoto se documentan en [migraciones](migrations.md).
Prisma está emparejado exactamente con cliente y adaptador. El generador moderno requiere output
y genera TypeScript; el script de esbuild permite mantener código propio en JavaScript sin usar
prisma-client-js obsoleto ni flags experimentales del runtime.

## Fuentes oficiales

- [Node y LTS](https://nodejs.org/en/about/previous-releases), [pnpm](https://pnpm.io/installation).
- [Vite: requisitos Node](https://vite.dev/guide/), [React](https://react.dev/versions).
- [React Router declarativo](https://reactrouter.com/start/declarative/installation).
- [Tailwind y Vite](https://tailwindcss.com/docs/installation/using-vite).
- [Vitest: requisitos y configuración](https://vitest.dev/guide/).
- [Express: instalación](https://expressjs.com/en/starter/installing/).
- [Prisma: requisitos](https://www.prisma.io/docs/orm/v7/reference/system-requirements),
  [generadores](https://www.prisma.io/docs/orm/v7/prisma-schema/overview/generators),
  [configuración JS y URL opcional para generate](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference),
  [adaptadores](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/database-drivers).
- [PostgreSQL: ramas mantenidas](https://www.postgresql.org/support/versioning/).
- [PGlite: PostgreSQL en memoria](https://pglite.dev/docs/).
- [PGlite Socket](https://pglite.dev/docs/pglite-socket).
- [Argon2 oficial](https://github.com/ranisalt/node-argon2), [csrf-csrf](https://github.com/Psifi-Solutions/csrf-csrf),
  [express-rate-limit](https://express-rate-limit.mintlify.app/overview), [cookie-parser](https://github.com/expressjs/cookie-parser).
- [MediaPipe Web](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js).
- [Checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node),
  [pnpm action-setup](https://github.com/pnpm/action-setup).

Las versiones exactas instaladas se pueden inspeccionar con `pnpm list -r --depth 0`.
