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

| Dependencia                         | Versión         | Clasificación / necesidad                                                     |
| ----------------------------------- | --------------- | ----------------------------------------------------------------------------- |
| express                             | 5.3.0           | Producción; HTTP                                                              |
| @prisma/client / @prisma/adapter-pg | 7.10.0          | Producción; cliente y adaptador requeridos por Prisma 7                       |
| pg                                  | 8.23.1          | Producción; driver PostgreSQL del adaptador                                   |
| zod / dotenv                        | 4.6.5 / 18.0.7  | Producción; validación y carga del entorno privado                            |
| cors / helmet                       | 2.8.6 / 8.3.0   | Producción; política de orígenes y cabeceras                                  |
| pino / pino-http                    | 10.4.0 / 11.0.0 | Producción; logs estructurados de proceso y HTTP                              |
| prisma                              | 7.10.0          | Desarrollo; CLI de esquema, generación y migraciones                          |
| esbuild                             | 0.25.12         | Desarrollo; compilar salida TypeScript del generador oficial a JavaScript ESM |
| supertest                           | 7.3.1           | Desarrollo; pruebas HTTP con node:test integrado en Node                      |

No se agregaron Redux, microservicios, Docker, colas, autenticación ni bibliotecas del MVP.
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
- [MediaPipe Web](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js).
- [Checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node),
  [pnpm action-setup](https://github.com/pnpm/action-setup).

Las versiones exactas instaladas se pueden inspeccionar con `pnpm list -r --depth 0`.
