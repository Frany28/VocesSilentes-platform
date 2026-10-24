# Desarrollo en Windows y VS Code

Las acciones de cuenta y el dashboard ya están conectados; ver [contratos y pruebas](account-functionality.md).

`pnpm academic:package` reconstruye la carpeta de Franciely y su ZIP con una selección de archivos,
documentación actual y accesos de demo consistentes. Conserva los datos personales y una copia de
la entrega anterior bajo `.local/`. [Criterios y verificación del paquete](module-ii/package-delivery.md).
Supabase utiliza el certificado público incluido en `Backend/certs/` para TLS verificado, también
en herramientas Prisma. El backend normaliza las URLs sin modificar `.env`; las bases loopback
de pruebas conservan su configuración. La foto privada requiere aplicar, en el destino autorizado,
`Backend/storage/002_profile_photos.sql`; ya se aplicó en Supabase de desarrollo.

## Preparación

Instalar Node 22.23.4 y pnpm 10.18.2 como describe README. Verificar versiones después de abrir una
terminal nueva. Abrir la raíz del workspace en VS Code; `.vscode/extensions.json` recomienda ESLint,
Prettier y Tailwind IntelliSense. Los scripts son JavaScript o comandos pnpm, sin dependencia de Bash.

El parche de seguridad 22.23.4 se publicó el 21 de octubre de 2026. En este equipo se instaló el ZIP
oficial x64, comprobado con su SHA-256 publicado, en el perfil de usuario y se actualizó su PATH.
WinGet no ofrecía un instalador aplicable al alcance portátil existente. Corepack conserva pnpm
10.18.2. Reiniciar VS Code y sus terminales para que hereden el PATH nuevo; los procesos Node ya
abiertos deben reiniciarse. Los archivos `.nvmrc` y `.node-version` fijan el parche y engines declara
la versión mínima admitida dentro de la rama 22. Esto no actualiza despliegues remotos existentes.
`.editorconfig`, `.gitattributes` y Prettier mantienen UTF-8, espacios y LF.
Tailwind CSS 4 se configura en CSS y ya usa el plugin oficial de Vite; seguir
[las convenciones de capas, tokens y utilidades](tailwind.md). Las entradas de cada funcionalidad
declaran el mismo orden de capas antes de importar estilos. No añadir CSS sin capa ni `!important`
para corregir precedencia; comprobar que una utilidad fija no sustituya una medida fluida existente.

Si PowerShell impide ejecutar un shim `.ps1`, usar `pnpm.cmd` en lugar de cambiar globalmente las
políticas de ejecución. Si Corepack está disponible, puede gestionar la versión packageManager;
no es requisito y no hay que reemplazar una instalación funcional del equipo.

La CLI de Vercel está instalada en el workspace: `pnpm vercel --version` comprueba la herramienta.
El backend se despliega con Root Directory Backend, entrada `Backend/app.js` y build Prisma;
ver [vercel.md](vercel.md) para variables privadas, cookies, proxy y pasos de publicación.
`.vercel/` contiene configuración/entorno privado de la CLI y se excluye de Git y controles de código.

Para Netlify, el build del frontend se ejecuta desde la raíz y publica `Frontend/dist`.
`Frontend/public/_redirects` se copia al build para las rutas directas y recargas;
ver [netlify.md](netlify.md). La ruta inicial muestra login, sin la antigua pantalla técnica.

`pnpm install --frozen-lockfile` reproduce las dependencias. Para añadir una dependencia justificada,
usar `pnpm --filter @vocessilentes/frontend add paquete@version` o el filtro backend, y `add -D`
para herramientas. Los scripts de instalación permitidos se restringen en pnpm-workspace.yaml a
Prisma, esbuild y Argon2. Argon2 requiere el binding nativo oficial para hash/verificación; en este
Windows se comprobó el binario precompilado. Revisar nuevos scripts antes de autorizarlos, sin usar
--force para resolver conflictos.

## Trabajo diario

La [entrega académica](module-ii/final-delivery.md) añade scripts `academic:prepare`, `academic:demo`,
`academic:verify` y `academic:package`. No leen Backend/.env ni escriben en Supabase; el primero
genera artefactos, demo/revisión abren PostgreSQL WASM efímero y el empaquetador PowerShell copia
fuentes permitidas a un staging nuevo en `.local/`. Chrome usa un perfil propio de prueba.
Las imágenes de ese entorno usan un sustituto local explícito de Storage, nunca el adaptador productivo.
`VITE_STUDENT_DEMO` ahora es false por defecto también en desarrollo; las pruebas históricas de
presentación eligen true explícitamente en Vitest. No se añaden dependencias ni excepciones de tamaño.

1. Leer AGENTS.md y la documentación relacionada; revisar el estado existente.
2. Iniciar `pnpm dev`; cada app admite ejecución independiente.
3. Implementar solo la tarea acordada y actualizar contratos/documentación cuando corresponda.
4. Aplicar `pnpm format`; ejecutar `pnpm verify` antes de entregar.
5. Si se toca persistencia, comprobar también PostgreSQL con `pnpm db:check`.

Vite usa localhost:5173 y strictPort: true: si está ocupado, cambiar FRONTEND_PORT en Frontend/.env
y sus orígenes CORS en Backend/.env. No detener procesos ajenos. Preview usa 4173.
Express usa HOST/PORT del entorno. En el equipo de preparación, los `.env` locales usan 5174
porque 5173 ya estaba ocupado; los ejemplos conservan el valor habitual de 5173.
`Ctrl+C` cierra desarrollo. El servidor espera peticiones activas y libera Prisma al recibir señales.

## Variables

Evidencia reutiliza `s3_access_key_id` y `s3_secret_access_key` existentes y añade `S3_ENDPOINT`
y `S3_REGION`, exclusivamente en backend. Mantiene DATABASE_URL/DIRECT_URL. No copiar el secreto
a VITE_* ni imprimirla. Preparación de bucket, migración y mantenimiento en
[evidencias](report-evidence.md#configuración-y-aplicación-deliberada).

| Variable                  | Dónde                    | Valor inicial / significado                                                                          |
| ------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| VITE_API_URL              | Frontend, pública        | http://localhost:3000/api; HTTP(S) sin credenciales/query/hash                                       |
| FRONTEND_PORT             | Frontend, solo tooling   | 5173; puerto de desarrollo Vite, no incluido en el bundle                                            |
| NODE_ENV                  | Backend, privada         | development; también test o production                                                               |
| HOST                      | Backend, privada         | localhost; interfaz para escuchar                                                                    |
| PORT                      | Backend, privada         | 3000; entero entre 1 y 65535                                                                         |
| CORS_ORIGINS              | Backend, privada         | Orígenes HTTP(S) exactos separados por coma, sin ruta                                                |
| LOG_LEVEL                 | Backend, privada         | info; niveles estándar Pino o silent                                                                 |
| DATABASE_URL              | Backend, privada         | Vacía desactiva DB; postgres:// o postgresql:// para persistencia                                    |
| DIRECT_URL                | Backend, tooling privado | Session/direct para migraciones; sin fallback a Transaction                                          |
| S3_ENDPOINT               | Backend, privada         | Endpoint Supabase HTTPS `/storage/v1/s3` del mismo proyecto                                          |
| S3_REGION                 | Backend, privada         | Región de Storage → S3 Configuration                                                                 |
| s3_access_key_id          | Backend, privada         | Identificador S3 existente, nunca credenciales del usuario de la aplicación                          |
| s3_secret_access_key      | Backend, secreta         | Secreto S3 existente; no registrar ni enviar al frontend                                             |
| S3_BUCKET_NAME            | Backend, privada         | Bucket general anterior; las evidencias usan siempre report-evidence                                 |
| SHADOW_DATABASE_URL       | Backend, tooling privado | Opcional; base independiente y descartable para migrate dev                                          |
| CSRF_SECRET               | Backend, secreta         | 64 hex aleatorios; obligatorio/persistente/compartido en production; vacío genera uno efímero en dev |
| SESSION_DURATION_SECONDS  | Backend, privada         | 86400; duración absoluta, entero 1–604800                                                            |
| SESSION_SAME_SITE         | Backend, privada         | lax; strict o none (none solo en producción Secure)                                                  |
| AUTH_RATE_WINDOW_SECONDS  | Backend, privada         | 600; ventana fija, entero 1–3600                                                                     |
| LOGIN_IP_LIMIT            | Backend, privada         | 30 por IP/ventana, entero 1–1000                                                                     |
| LOGIN_IDENTIFIER_LIMIT    | Backend, privada         | 5 por IP+correo/ventana, entero 1–100                                                                |
| REGISTER_IP_LIMIT         | Backend, privada         | 5 por IP/ventana, entero 1–100                                                                       |
| REGISTER_IDENTIFIER_LIMIT | Backend, privada         | 3 por IP+correo/ventana, entero 1–100                                                                |
| TRUST_PROXY_IPS           | Backend, privada         | Vacío: false; solo IP literales de proxies conocidos, separadas por comas                            |

Los ejemplos no contienen credenciales reales. `.env` no se versiona. La configuración inválida
detiene el arranque antes de escuchar y comunica nombres de variables sin mostrar sus valores.
Producción exige CORS_ORIGINS explícito con HTTPS y CSRF_SECRET privado. Auth exige HTTPS en
producción; HTTP solo loopback de desarrollo. No usar trust proxy true ni confiar en cabeceras
arbitrarias. Configurar la topología real y SameSite según [authentication.md](authentication.md).
En Vite todos los VITE_* llegan al navegador; no incluir
DATABASE_URL ni secretos bajo ese prefijo. Reiniciar/reconstruir al cambiar valores públicos.

## Convenciones y controles

Evidencia utiliza Sharp 0.35.5 para decodificar y sanear imágenes no confiables en el servidor;
el adaptador usa los SDK oficiales `@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner` 3.1155.0
para protocolo S3 y firma SigV4. Los secretos solo residen en backend. Los binarios
opcionales de Sharp se instalan para cada plataforma; se comprobó decodificación real en Windows.
No se amplía la lista de scripts de instalación permitidos de pnpm: funciona con el binario
precompilado sin ejecutar el script de compilación ignorado. No se agregan excepciones de tamaño.

Usar JavaScript ESM y JSDoc en APIs exportadas, hooks, servicios y contratos. Tipar con typedef cuando
ayude. No comentar código evidente. Funciones/archivos tienen una responsabilidad coherente.
Los archivos propios mantienen el objetivo de 100 líneas útiles.
Los módulos de `features/admin/` y `modules/admin/` separan presentación, estado, HTTP, validación,
negocio y repositorio. Sus estilos se dividen por layout, superficies, campos, listas y diálogos;
no se añadieron dependencias, migraciones ni excepciones de tamaño para esa implementación.
El rediseño Admin del 21 de octubre mantiene archivos enfocados en presentación, hooks y perfil;
sus estilos compactos se limitan a `.admin-shell`. Se reutiliza el PATCH ADMIN para identidad propia.
No se añaden configuración ni excepciones de tamaño. `Frontend/admin-review.html` es una entrada
de pruebas visuales de desarrollo con fixtures identificados, excluida del build de producción.
Las capacidades sin backend no reciben cargas temporizadas ni callbacks de éxito simulados en las rutas.
El [Módulo II, Día 1](module-ii/README.md) añade posteriormente una migración AuditLog y listado/borrado
real, sin dependencias nuevas. `docs/module-ii/sql/01_schema.sql` es una excepción de tamaño:
snapshot generado del historial íntegro para reconstrucción académica, conservado completo para
comprobar su equivalencia exacta con las migraciones. La razón también figura junto al SQL.
Los ajustes de [adaptación de pantallas](responsive.md) separan geometría de Auth, ajustes
por altura, panel ilustrado, Student y cuenta técnica en hojas enfocadas de menos de 100
líneas útiles. Reutilizan tokens y controles existentes sin nuevas dependencias.
Student separa rutas, páginas y componentes de práctica de menos de 100 líneas útiles;
reutiliza el provider demo y el sistema visual. No añade excepciones de tamaño ni dependencias.
`VITE_STUDENT_DEMO` es una bandera pública validada, sin acceso privilegiado ni persistencia;
su configuración se documenta en [primera fase](phase-one-prototype.md).

La migración inicial
`Backend/prisma/migrations/20261009000100_phase_one/migration.sql` es una excepción: contiene
el DDL generado por Prisma para los cuatro dominios y las reglas SQL adicionales en una sola
transacción revisable. Dividirla artificialmente dificultaría aplicar y revisar el contrato completo.
La razón también se documenta al principio del SQL; no se desactivan reglas ESLint.
`Frontend/src/styles/button.css` conserva superficie y estados coordinados del botón. Su composición
simple pasó a utilidades en Button.jsx y ya no necesita la anterior excepción de tamaño.
ESLint advierte tamaño/largo/documentación y comprueba consistencia JSDoc, hooks y Fast Refresh.

`Frontend/src/features/auth/login/motion-desktop.css` (aproximadamente 1058 líneas útiles)
y `motion-tablet.css` (109) son excepciones por contener los keyframes CSS originales de Figma.
El exportador muestrea las etiquetas flotantes cada 1,25 % y repite ciclos de las órbitas.
Se conservan esas muestras para no reconstruir ni alterar el movimiento exportado; son una
responsabilidad coherente por composición y tienen su razón documentada junto al CSS.
Los componentes, hooks y estilos escritos a mano de login mantienen el objetivo de 100 líneas.

### Auditoría estructural — 9 de octubre de 2026

No hay dependencias circulares entre módulos locales de Frontend/src ni Backend/src.
`features/system/SystemPage.jsx` no tiene referencias desde que `/` redirige a `/login`;
es candidato a eliminación. `assets/Logos/` (unos 37 MB) no se importa en código ni CSS
y no entra en el bundle: sus 24 SVG exportados incrustan solo dos PNG distintos con recortes diferentes.
`SIZE=240PX (1).svg` es idéntico byte a byte a `SIZE=240PX.svg`. Se conservan como fuentes
de diseño hasta decidir qué variantes usar; la marca en ejecución usa `assets/auth/36e7e.png` (1,3 MB)
y `0ad79.png` (0,8 MB), candidatos a una exportación optimizada desde Figma.
Los breakpoints combinan `max-width: 599px` y `width < 600px`; se mantienen sin unificar
porque difieren en anchos fraccionarios y no se cambian breakpoints aprobados sin revisión visual.

Pruebas frontend: Vitest, jsdom y Testing Library; se prueban rutas, temas y contrato HTTP con fetch
controlado, formularios, guards y sesión. Backend: node:test y Supertest; configuración, salud,
errores, CORS, límites JSON, transporte de auth, logs y cierre. Los dobles de Prisma en cierre
comprueban ciclo de vida, no conectividad real.

`pnpm verify` no necesita `.env`, servidor PostgreSQL ni cámara. Ejecuta lint, formato, pruebas,
schema validate, build con generación de Prisma y `db:test` sobre PostgreSQL WASM en memoria.
Auth en db:test usa PrismaPg por TCP y Argon2 real, sin mocks de persistencia. El socket es solo
loopback efímero, una conexión, sin datos persistidos. Si se ejecuta db:test aislado en una instalación
nueva, ejecutar primero db:generate. No leer .env ni usar Supabase para fixtures.
El build backend comprueba sintaxis y genera el cliente; no afirma
que PostgreSQL funciona. `pnpm db:generate` también se puede ejecutar por separado.

Para persistencia, instalar PostgreSQL 17 con la revisión mantenida, crear base y usuario de desarrollo,
guardar URL privada, generar cliente y ejecutar `pnpm db:check`. Nunca copiar una URL real a logs o docs.
Los modelos de fase 1 ya están aprobados y la migración inicial aplicada en desarrollo.
`pnpm db:migrate` aplica SQL versionado con DIRECT_URL Session/direct y sin shadow; no genera SQL.
`db:migrate:dev --name nombre --create-only` permite generar con shadow independiente.
Leer [el procedimiento completo](migrations.md) y [el contrato](data-model.md) antes de modificar datos.
Las pruebas de integración no usan `.env` ni escriben en la base compartida; PGlite es solo desarrollo.

CI está preparado en `.github/workflows/verify.yml`, con Node/pnpm fijados y matriz Linux/Windows.
Usa frozen-lockfile, no base real, no despliegue y no secretos de producción. Subir archivos a un
repositorio GitHub y comprobar la ejecución remota es una tarea posterior.

## Componentes compartidos — actualización Student del 22 de octubre

features/account contiene la presentación de perfil y foto común a ambos roles. Las mutaciones
ADMIN permanecen en features/admin; Student conserva solo lectura hasta contar con endpoint propio.
Dialog/Select/Avatar/IconAction se trasladaron a components/ui y se comprobaron sus consumidores;
sus antiguos archivos de Admin se retiraron. El hook de diálogo vive en hooks/use-dialog.js.
Las reglas compactas están en styles/density.css, sin nuevas dependencias ni cambios de entorno.
Los escenarios de navegador usan cuentas y PostgreSQL WASM efímeros; Storage se sustituye explícitamente
en la prueba de integración visual. No se escribe en Supabase ni se modifica Backend/.env.
