# VocesSilentes

Base de desarrollo de una aplicación educativa de Lengua de Señas Venezolana (LSV).
Incluye dos aplicaciones en un workspace pnpm, JavaScript ESM y JSDoc, y los datos de la primera fase.
Todavía no implementa los flujos del MVP.

## Requisitos

- Node.js **22.23.1 LTS**, fijado en `.nvmrc`, `.node-version` y CI. La rama 22 sigue en LTS;
  cumple los mínimos de Vite, Vitest y Prisma. [Política oficial](https://nodejs.org/en/about/previous-releases).
- pnpm **10.18.2**, declarado en `packageManager`; instalarlo con `npm install --global pnpm@10.18.2`
  si no está disponible. No mezclar npm/yarn para instalar dependencias de este workspace.
- Windows: PowerShell, VS Code y Node desde la [distribución oficial](https://nodejs.org/dist/v22.23.1/).
  Un gestor existente como nvm-windows puede usar `nvm install 22.23.1` y `nvm use 22.23.1`.
- PostgreSQL **17.x actualizado** solo para persistencia. La base HTTP, tests y build no lo necesitan.
  Instalar PostgreSQL local o usar una base de desarrollo autorizada; esta etapa no incluye Docker.

## Instalación e inicio (PowerShell, desde la raíz)

```powershell
node --version
pnpm --version
pnpm install --frozen-lockfile
Copy-Item Frontend/.env.example Frontend/.env
Copy-Item Backend/.env.example Backend/.env
pnpm dev
```

Copiar los ejemplos solamente en la primera instalación; no sobrescribir `.env` existentes.
Frontend: <http://localhost:5173>. API: <http://localhost:3000/api/health>.
En este equipo se prepararon `.env` locales con frontend en <http://localhost:5174> y su origen CORS,
porque 5173 estaba ocupado. Cambiar FRONTEND_PORT y CORS_ORIGINS si se necesita otro puerto.
Si ya hay un Vite de este workspace ejecutándose, puede arrancarse solo la API con `pnpm dev:backend`.
Para iniciar ambas aplicaciones en otro puerto sin detenerlo:

```powershell
$env:FRONTEND_PORT = '5175'
$env:CORS_ORIGINS = 'http://localhost:5175,http://localhost:4173'
pnpm dev
```

Estas variables temporales tienen prioridad sobre `.env`; el frontend de ese comando usa 5175.
`Ctrl+C` detiene desarrollo; el backend drena HTTP y desconecta Prisma con límite de 10 segundos.
Sin DATABASE_URL arranca en modo HTTP sin persistencia. Al configurarla, generar primero el cliente.

## Comandos de la raíz

| Comando                                           | Función                                                                |
| ------------------------------------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`                                        | Frontend y backend simultáneos                                         |
| `pnpm dev:frontend` / `pnpm dev:backend`          | Una aplicación                                                         |
| `pnpm lint`                                       | ESLint, incluyendo advertencias de tamaño y JSDoc                      |
| `pnpm format` / `pnpm format:check`               | Aplicar / comprobar Prettier                                           |
| `pnpm test`                                       | Vitest + Testing Library y node:test + Supertest                       |
| `pnpm build`                                      | Bundle frontend, sintaxis backend y generación/compilación de Prisma   |
| `pnpm db:validate`                                | Validación del esquema sin conectar a PostgreSQL                       |
| `pnpm db:generate`                                | Prisma Client y compilación de su salida a JavaScript ESM              |
| `pnpm verify`                                     | Controles y SQL en memoria, sin servidor PostgreSQL                    |
| `pnpm db:check`                                   | Conectar y ejecutar SELECT 1; requiere DATABASE_URL y cliente generado |
| `pnpm db:inspect` / `pnpm db:status`              | Tablas e historial en lectura / estado de migraciones                  |
| `pnpm db:migrate`                                 | Aplicar SQL revisado con DIRECT_URL Session/direct, sin shadow         |
| `pnpm db:migrate:dev --name nombre --create-only` | Generar migración de desarrollo con shadow independiente               |
| `pnpm db:test`                                    | Integración SQL aislada en PostgreSQL WASM en memoria                  |

El backend es JavaScript ejecutado por Node; no necesita un bundle de código propio.
El generador oficial `prisma-client` produce TypeScript: esbuild compila **solo esa salida** a ESM.
`pnpm --filter @vocessilentes/backend start` arranca la API; `pnpm --filter @vocessilentes/frontend preview`
sirve el bundle en <http://localhost:4173> para inspección local. Preview no es un servidor de producción.

## Configuración y datos privados

`Frontend/.env`: `VITE_API_URL`, pública y embebida durante el build; FRONTEND_PORT solo configura
el servidor de desarrollo y no se expone al navegador. Nunca poner secretos en VITE_*.
`Backend/.env`: NODE_ENV, HOST, PORT, CORS_ORIGINS, LOG_LEVEL, DATABASE_URL, DIRECT_URL y
SHADOW_DATABASE_URL opcional; exclusivas del servidor y las herramientas de migración.
Los valores del proceso prevalecen sobre `.env`. Reiniciar Vite al cambiar configuración; reconstruir
el bundle para cambiar variables públicas en producción. Producción exige CORS_ORIGINS explícito.

Para PostgreSQL, configurar una URL privada en Backend/.env y ejecutar:

```powershell
pnpm db:generate
pnpm db:check
```

La primera migración crea nueve entidades en el esquema privado `vocessilentes`, con restricciones
SQL y RLS sin acceso público. Fue aplicada en la base Supabase de desarrollo confirmada por el usuario.
DATABASE_URL puede usar Transaction 6543; migraciones usan DIRECT_URL Session 5432/direct compatible.
Revisar [modelo de datos](docs/data-model.md) y [migraciones](docs/migrations.md) antes de aplicar
cambios posteriores. Health no comprueba disponibilidad de PostgreSQL.

## Estructura

```text
Frontend/
  src/app/                  Entrada, router y proveedor de tema
  src/features/system/      Pantalla mínima de la base técnica
  src/components/ui/        Control de tema
  src/components/layout/    Estructura compartida
  src/hooks/                Hook del tema
  src/lib/                  Configuración pública, cliente HTTP y errores
  src/styles/               Estilos globales y tokens semánticos provisionales
  src/test/                 Configuración y pruebas
Backend/
  src/app.js                Express sin puerto
  src/server.js             Arranque, señales y cierre
  src/config/               Carga y validación de configuración
  src/modules/health/       Comprobación de vida HTTP
  src/middlewares/          Errores y rutas desconocidas
  src/lib/                  Prisma, logger y cierre de recursos
  src/errors/               Errores públicos controlados
  prisma/                   Esquema por dominio y migraciones versionadas
  scripts/                  Generación, sintaxis y comprobación de PostgreSQL
  tests/                    Pruebas HTTP y SQL aislado en memoria
docs/                       Arquitectura, desarrollo, diseño, MediaPipe y versiones
.github/workflows/          Verificación sin despliegue ni secretos de producción
```

Las carpetas de assets y funcionalidades futuras se crean cuando tengan contenido útil.
`Backend/generated/`, `Frontend/dist/`, dependencias, cachés y `.env` son artefactos locales ignorados.

## Estado real y documentación

Funciona la pantalla mínima, router, tema claro/oscuro, cliente HTTP, health, seguridad HTTP,
logs JSON, errores y validación de configuración. MediaPipe está instalado y no activa la cámara.
Existen modelos de usuarios, sesiones, contenido compartido, progreso y reportes, y conexión real
con PostgreSQL 17.11 en Supabase. Las tablas de aplicación están vacías; no hay datos ficticios.
No hay flujos de autenticación, usuarios o reportes ni reconocimiento LSV. Faltan Figma y
entrenamiento/validación de un modelo específico.

La preparación inicial partió de una carpeta sin código ni historial. Esta tarea no crea commits,
PR ni publicaciones. Los controles de esta entrega son locales; no se afirma ejecución de GitHub Actions.

- [Arquitectura](docs/architecture.md) y [desarrollo en Windows](docs/development.md).
- [Diseño y temas](docs/design-system.md) y [MediaPipe](docs/mediapipe.md).
- [Versiones y fuentes oficiales](docs/dependencies.md).
- [Modelo de datos](docs/data-model.md) y [migraciones](docs/migrations.md).
- [Resultados reales de verificación](docs/verification.md).
