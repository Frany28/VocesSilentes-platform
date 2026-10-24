# VocesSilentes

Base de desarrollo de una aplicación educativa de Lengua de Señas Venezolana (LSV).
Incluye dos aplicaciones en un workspace pnpm, JavaScript ESM y JSDoc, los datos de la primera fase
y autenticación local con sesiones persistidas. Las funciones educativas del MVP siguen pendientes.
La entrega del Módulo II conecta reportes, resolución/reapertura, bitácora visual y progreso manual
con PostgreSQL. [Auditoría y resultados](docs/module-ii/final-delivery.md),
[paquete para el profesor](modulo-ii-franciely%20vivas/README.md).
El frontend usa Tailwind CSS 4 con el plugin oficial de Vite, tokens existentes y capas de estilos;
véase [criterios de uso y mantenimiento](docs/tailwind.md).

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
Sin DATABASE_URL arranca en modo HTTP sin persistencia; auth devuelve 503. Al configurarla,
generar primero el cliente. `/register` y `/login` permiten probar autenticación con PostgreSQL.

## Comandos de la raíz

Para la entrega aislada: `pnpm academic:prepare` regenera SQL/hashes; `pnpm academic:demo` abre
la aplicación con PostgreSQL WASM y datos académicos, `pnpm academic:verify` prueba los formularios
en Chrome sobre otra base sin seed y `pnpm academic:package` genera el ZIP inferior a 10 MB.
No usan Supabase compartido. La demostración de imágenes usa un sustituto local explícito, no S3.

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

Para publicar el frontend en Netlify, `netlify.toml` construye desde la raíz y publica `Frontend/dist`.
`/` abre el login; `_redirects` permite abrir y recargar rutas de React.
Ver [build, variables y nuevo despliegue](docs/netlify.md).

Para publicar la API en Vercel, usar **Root Directory: Backend** y **Node.js 22.x**.
La entrada Express, el build Prisma y la CLI local están preparados;
seguir [configuración, variables y despliegue](docs/vercel.md). Esto no implica una publicación remota.

`Frontend/.env`: `VITE_API_URL` y `VITE_STUDENT_DEMO`, públicas y embebidas durante el build;
la demo acepta `true`/`false` y exige sesión real. FRONTEND_PORT solo configura
el servidor de desarrollo y no se expone al navegador. Nunca poner secretos en VITE_*.
`Backend/.env`: configuración HTTP/DB y políticas de auth; exclusivas del servidor y las herramientas
de migración. [Variables y valores iniciales](docs/development.md#variables).
Los valores del proceso prevalecen sobre `.env`. Reiniciar Vite al cambiar configuración; reconstruir
el bundle para cambiar variables públicas en producción. Producción exige orígenes HTTPS explícitos,
CSRF_SECRET privado persistente y transporte HTTPS. No ampliar trust proxy sin conocer la topología.

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
  src/app/                  Entrada, router y proveedores de tema/auth
  src/features/auth/        Formularios, cliente CSRF, sesión y guards
  src/features/admin/       Admin moderno, usuarios/perfil reales y dependencias de reportes explícitas
  src/features/student/     Cinco vistas Student, datos demo identificados y perfil de sesión real
  src/features/system/      Pantalla mínima de la base técnica
  src/components/ui/        Componentes generales de Figma y control de tema
  src/components/layout/    Estructura compartida
  src/hooks/                Hook del tema
  src/lib/                  Configuración pública, cliente HTTP y errores
  src/styles/               Estilos globales, tokens Figma y estilos de componentes
  src/assets/               Fuentes y SVG originales locales
  src/dev/                  Galería independiente de desarrollo (/ui.html)
  src/test/                 Configuración y pruebas
Backend/
  src/app.js                Express sin puerto
  src/server.js             Arranque, señales y cierre
  src/config/               Carga y validación de configuración
  src/modules/health/       Comprobación de vida HTTP
  src/modules/auth/         Rutas, controllers, negocio, repositorio y protecciones
  src/modules/admin/        CRUD de usuarios y bitácora persistente protegidos por ADMIN
  src/middlewares/          Errores y rutas desconocidas
  src/lib/                  Prisma, logger y cierre de recursos
  src/errors/               Errores públicos controlados
  prisma/                   Esquema por dominio y migraciones versionadas
  scripts/                  Generación, sintaxis y comprobación de PostgreSQL
  tests/                    Pruebas HTTP y SQL aislado en memoria
docs/                       Arquitectura, desarrollo, diseño, MediaPipe y versiones
.github/workflows/          Verificación sin despliegue ni secretos de producción
```

Las carpetas de funcionalidades futuras se crean cuando tengan contenido útil.
`Backend/generated/`, `Frontend/dist/`, dependencias, cachés y `.env` son artefactos locales ignorados.

## Estado real y documentación

El flujo de evidencias añade reportes generales reales, selección/preview y carga privada validada
en servidor, más listado y visor Admin con acceso temporal autorizado. La migración y el bucket
ya se aplicaron en Supabase de desarrollo; las credenciales S3 existentes permiten carga/lectura real
comprobada con objetos temporales eliminados. Resolución/reapertura, dashboard, estado de cuentas,
perfil propio, contraseña y fotos privadas ya están conectados; ver [acciones y pruebas](docs/account-functionality.md).
Para estado y configuración actuales
consultar [evidencias de reportes](docs/report-evidence.md); las descripciones históricas de reportes
sin backend en los párrafos siguientes corresponden a la etapa anterior.

Funciona la pantalla mínima, router, tema claro/oscuro, cliente HTTP, health, seguridad HTTP,
logs JSON, errores y validación de configuración. MediaPipe está instalado y no activa la cámara.
Existen modelos de usuarios, sesiones, contenido compartido, progreso y reportes, y conexión real
con PostgreSQL 17.11 en Supabase. Registro/login/me/logout usan User/Session existentes, Argon2id,
cookies HttpOnly, CSRF firmado y límites de intentos. `/account` exige sesión; `/admin` exige ADMIN,
con destinos de sesión. `/admin` reproduce el rediseño moderno, con temas y navegación adaptable;
usuarios, creación/edición modal y datos personales del administrador usan servicios reales.
El Día 1 del Módulo II añade listado paginado, eliminación lógica y bitácora
persistente; requiere la nueva migración versionada antes de usarlo en una base de desarrollo
autorizada. Admin usa servicios reales de usuarios, reportes y bitácora; Student consulta catálogo
y progreso manual. Los agregados globales, cambio de isActive, contraseña y fotos persistidas usan
servicios reales, permisos en backend y bitácora. Ver [alcance y funcionamiento de Admin](docs/admin.md).
El 23 de octubre, por solicitud expresa del usuario, se importaron los 50 registros académicos
en Supabase de desarrollo, conservando las cuentas anteriores y desactivando las cuentas de
contraseña pública. Ver [datos importados y verificación remota](docs/module-ii/supabase-import.md).
Student dispone de Inicio, Mis módulos, Practicar, Mi progreso y Mi perfil; solo USER puede acceder.
Contenido y progreso usan la API real por defecto; la demostración exige `VITE_STUDENT_DEMO=true`.
Practicar registra lectura y actividad manual sin cámara ni evaluación; Perfil permite editar identidad,
foto y contraseña propias. Las lecciones no se amplían en esta actualización.
Ver [primera fase académica](docs/phase-one-prototype.md) y [matriz de Figma](docs/student-design-audit.md).
Hay backend de catálogo/progreso declarado y reportes, sin reconocimiento LSV. Hay componentes del UI Kit de Figma
y una galería de desarrollo en `/ui.html`; véase [sistema visual](docs/design-system.md).
La pantalla `/login` reproduce Auth en ambos temas y tres composiciones adaptables, con el flujo
existente de sesión y sus errores; véase [implementación y límites](docs/login.md).
Login, Registro, Student, Admin y cuenta ajustan espacios, columnas y paneles al ancho y altura
disponibles; véase [adaptación de pantallas](docs/responsive.md).
Faltan la integración educativa y entrenamiento/validación de un modelo específico;
tampoco hay OAuth, recuperación ni envío de correo.

La preparación inicial partió de una carpeta sin código ni historial. Esta tarea no crea commits,
PR ni publicaciones. Los controles de esta entrega son locales; no se afirma ejecución de GitHub Actions.

- [Arquitectura](docs/architecture.md) y [desarrollo en Windows](docs/development.md).
- [Diseño y temas](docs/design-system.md) y [MediaPipe](docs/mediapipe.md).
- [Versiones y fuentes oficiales](docs/dependencies.md).
- [Modelo de datos](docs/data-model.md) y [migraciones](docs/migrations.md).
- [Contratos API](docs/api.md) y [autenticación, seguridad y primer administrador](docs/authentication.md).
- [Resultados reales de verificación](docs/verification.md).
- [Módulo II: alcance, SQL, implementación y pruebas del Día 1](docs/module-ii/README.md).
