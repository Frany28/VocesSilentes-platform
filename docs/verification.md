# Verificación

## Entrega final del Módulo II — 23 de octubre de 2026

`pnpm verify` completo terminó con código **0**: lint sin errores ni advertencias, formato correcto,
**107 pruebas frontend, 43 backend y 56 SQL/auth: 206 aprobadas**, Prisma válido y build correcto.
Se conservaron las pruebas existentes y se añadieron persistencia de estado de reportes, avance
propio, auditoría atómica y autenticación desde los SQL reconstruidos. La prueba histórica de
eliminación ahora comprueba tanto USER_REGISTERED como USER_DELETED y sus actores correctos.

`pnpm academic:verify` terminó con código **0**, usando Chrome, Express, PrismaPg/pg y PostgreSQL
WASM/TCP efímero en una base sin seed: cinco usuarios creados por modal, listado paginado, edición,
borrado lógico, cinco reportes con cinco PNG reales, visor, resolución/reapertura, recarga y progreso
manual. Admin consultó **24 eventos en cinco páginas**. Pasaron **40 combinaciones** de cinco vistas,
cuatro viewports y ambos temas; sin desbordamiento horizontal, llamadas a cámara ni errores JavaScript.
Se guardaron once capturas y un manifiesto de resultados. Las imágenes usan un sustituto explícito
local de Storage; esta prueba no acredita un proveedor S3 remoto.

Los SQL crean **50 filas en diez tablas**, con ReportEvidence = **0** como excepción documentada;
no se inventan objetos S3. ExternalIdentity usa identificadores de fixture explícitos, sin OAuth.
La reconstrucción y las credenciales académicas se comprobaron en otra base nueva independiente.
El paquete inferior a 10 MB omite configuración privada, dependencias y generados, e incluye los
tres SQL, fuentes, README, TXT y pruebas. Ver [informe final](module-ii/final-delivery.md) y
[guía del paquete](../entrega-modulo-ii/README.md).

Las lecturas de reportes se agruparon secuencialmente para corregir el aviso de Client.query de pg,
sin desactivar avisos ni cambiar versiones. La ejecución final no presenta ese aviso.
No se aplicó la nueva migración a Supabase compartido ni se ejecutaron despliegues o GitHub Actions.
No se probó PostgreSQL 17 nativo ni concurrencia multiworker; esos límites se mantienen explícitos.

## Integración de Tailwind CSS — 23 de octubre de 2026

Se conserva Tailwind CSS 4.3.3 y su plugin oficial de Vite, sin dependencias nuevas ni cambios
al lockfile. Se ordenan las capas de todas las entradas CSS, se delimitan las fuentes de clases
y se centralizan los alias de tokens en `tailwind-theme.css`. Los componentes compartidos,
Auth, Student, cuenta y reportes eliminan utilidades forzadas o duplicaciones con CSS; las
animaciones, los recursos originales y la geometría fluida conservan sus reglas específicas.
Las convenciones de mantenimiento están en [tailwind.md](tailwind.md).

`pnpm verify` terminó con código **0**: lint sin errores ni advertencias, formato correcto,
**107 pruebas frontend, 43 backend y 51 SQL/auth: 201 aprobadas**, validación Prisma y build
correctos. Las pruebas SQL usan PostgreSQL WASM efímero; no requieren una base externa.

Chrome headless comparó **88 combinaciones**: login, registro, siete pantallas Student y dos
Admin, en ambos temas y viewports **1440×960, 834×1100, 390×920 y 320×620**. Se registraron
propiedades CSS calculadas y rectángulos de los elementos antes y después de la migración:
sin diferencias detectadas en las propiedades comparadas ni en la geometría, con tolerancia
de 0,1 px. Ninguna combinación presentó desbordamiento horizontal.

Además pasaron nueve comprobaciones en navegador: borde de error del textarea, foco de teclado
de 2 px, estado deshabilitado desde fieldset, encaje del diálogo de foto en móvil, selector de
archivo oculto, retorno del foco con Escape, modal de creación Admin, precedencia de `w-full`
sobre el ancho del botón con tema oscuro local, y reducción de movimiento. Se inspeccionaron
capturas locales de formularios y diálogos; no es una comparación automática de píxeles.
Las sesiones usan usuarios sintéticos en SQL efímero, sin acceder a Supabase ni guardar fotos.

Evidencia local ignorada: `.local/tailwind-baseline.json`, `.local/tailwind-final.json`,
`.local/tailwind-comparison-final.json`, `.local/tailwind-state-checks.json` y
`.local/tailwind-review/`. No se ejecutaron GitHub Actions ni despliegues. La revisión de Chrome
no acredita una matriz completa de navegadores ni dispositivos físicos.

## Alineación del sidebar Student con Admin — 22 de octubre de 2026

Student adopta el sidebar de 232/76 px, padding 20/16 px y opciones compactas de 44 px de Admin.
Se elimina el espacio del marcador del UI Kit que desplazaba iconos y texto; ayuda/cuenta queda
al pie con separador. La tipografía compacta se limita al sidebar. En tablet se oculta también
el contenedor de texto para que no deje un gap vacío y los iconos queden centrados.

Chrome comprobó **34 combinaciones** de área, viewport y tema, con **22 capturas**: Admin y Student
a 1440, 1200, 1199, 834, 600, 599, 390 y 320 px en ambos temas, más Student a 1440/834 × 360 px.
Se verificaron coordenadas/ancho/altura de sidebar, alineación de iconos, posición del grupo de
cuenta, centrado en tablet y ausencia de desbordamiento horizontal. Con scroll vertical se comprueba
el centro del ancho útil. «Reportar un error» permanece en una línea, habilitado y navega al formulario.
Sin excepciones JavaScript. Sesiones reales en PostgreSQL WASM efímero; sin acceso a Supabase.
Evidencia local ignorada: `.local/student-sidebar-review/results.json` y sus capturas PNG.

`pnpm verify` completo terminó con código **0**, sin advertencias: **104 frontend, 43 backend y
51 SQL/auth**, **198 pruebas aprobadas**, formato, validación Prisma y build correctos.
La comprobación es local en Chrome; no acredita otros navegadores ni una ejecución remota de CI.

## Activación de Supabase S3 — 21 de octubre de 2026

El adaptador consume las credenciales S3 existentes, S3_ENDPOINT y S3_REGION del backend;
se verificó que endpoint y URLs PostgreSQL pertenecen al mismo proyecto de desarrollo.
Se aplicaron `20261020000100_admin_audit` y `20261021000100_report_evidence` con Prisma deploy,
y `Backend/storage/001_report_evidence.sql`. Inspección posterior: tres migraciones terminadas,
bucket privado, 5 MiB, tres MIME, RLS activo y política restrictiva exacta para PUBLIC.

`evidence:check` pasó con HeadBucket S3 real más inspección SQL. `evidence:probe` subió y leyó
JPEG/PNG/WEBP con igualdad de bytes; rechazó reemplazo mediante HEAD, acceso/listado anónimo
y firma SigV4 vencida. La fecha de emisión de esa firma era 125 s anterior con TTL 120 s;
el proveedor negó la lectura y aceptó una firma nueva. Los tres objetos se eliminaron y el
catálogo posterior confirmó **0 objetos y 0 relaciones de evidencia**. No se insertaron cuentas
ni reportes de prueba en la base compartida. El registro temporal local también se retiró.

`pnpm verify` completo terminó con código **0**: **104 frontend, 43 backend, 51 SQL/auth**,
**198 pruebas aprobadas**, lint sin advertencias, formato, Prisma y build correctos.
La prueba de transporte S3 usa HTTP loopback real y credenciales sintéticas inmutables; comprueba
que el SDK puede anotar su copia de identidad sin modificar la configuración validada.
`pnpm db:check` volvió a responder a SELECT 1. No se ejecutaron GitHub Actions, despliegue
de aplicación ni scheduler remoto. La UI desplegada con cuentas propias y concurrencia
multiworker siguen sin verificarse. [Procedimiento reproducible y límites](report-evidence.md).

## Evidencias de reportes: preparación inicial — 21 de octubre de 2026

`pnpm verify` completo terminó con código **0**, sin advertencias de lint: **104 pruebas frontend**
en 38 archivos, **39 backend** y **51 SQL/auth**; **194 aprobadas**, sin fallos ni omisiones.
Incluye formato, validación Prisma, generación del cliente y build de ambas aplicaciones.
Se usa Sharp 0.35.5 con decodificación real en Windows y PostgreSQL WASM efímero para permisos,
propiedad, reservas, compensación y SQL restrictivo de Storage. El adaptador Storage se sustituye
explícitamente en integración y su transporte REST se comprueba con respuestas controladas.
Renovación/expiración del visor usa reloj controlado; no prueba firma criptográfica remota.

La conexión real `pnpm db:check` respondió a SELECT 1. Inspección privada de solo lectura encontró
únicamente `20261009000100_phase_one` terminada en el historial remoto; AuditLog y evidencia están
pendientes. `evidence:check` falló por ausencia de SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY locales.
No se ejecutó configure/migrate/cleanup contra Supabase, no se subieron imágenes remotas ni fixtures
y no se verificó GitHub Actions. El primer intento de verify se detuvo por formato de documentación;
se corrigió y la ejecución completa posterior pasó. [Configuración y límites reales](report-evidence.md).

## Marca compartida de Admin y Student — 21 de octubre de 2026

Se sustituyeron la composición propia de Admin y su icono de tablet por `Brand`, compartido con
Auth/Student. Se conservan los recursos claro/oscuro, recortes, tipografía y variante compacta.
La barra móvil admite salto de fila para alojar la marca completa sin reducirla ni recortarla.
`pnpm verify` terminó con código **0**, sin advertencias: **99 pruebas frontend, 34 backend y
43 SQL/auth**, validación Prisma y build. Formato y `git diff --check` correctos tras documentar.

Chrome revisó **42 capturas**: usuarios/perfil de Admin e inicio Student, ambos temas, a 1440,
1199, 834, 600, 599, 390 y 320 px. Se compararon los recursos y las medidas de las partes visibles
del logo, incluidos texto y color, con igualdad entre áreas. Sin desbordamientos horizontales ni
excepciones JavaScript. Perfil móvil conserva su barra sin marca según su composición existente.
Login y lecturas reales sobre base efímera; sin acceso a Supabase. Evidencia local ignorada:
`.local/admin-brand-verify.log`, `.local/admin-brand-browser.log` y
`.local/admin-brand-review/results.json` con capturas. No se verificó ejecución remota de CI.

## Admin · Rediseño moderno — 21 de octubre de 2026

En Windows con Node **22.23.1** y pnpm **10.18.2**, `pnpm verify` completo terminó con código **0**:
lint sin advertencias, formato correcto, **99 pruebas frontend** en 36 archivos, **34 backend**,
validación Prisma, build de ambas aplicaciones y **43 pruebas SQL/auth aisladas**. Total:
**176 pruebas aprobadas**, sin fallos ni omisiones. Después se actualizó únicamente documentación
y se repitieron formato y `git diff --check`.

La implementación usa la página `286:50` de Figma. Se inventariaron sus 170 frames y se consultaron
contextos, componentes y renders de pantallas, estados, modales, perfil, foto y evidencia en ambos
temas. Referencias y capacidades reales en [admin.md](admin.md). La comparación visual fue manual
sobre capturas representativas; no se afirma igualdad automática de píxeles.

Chrome local produjo **185 capturas** de rutas/recorridos y **35 capturas** de comprobación final:

- Resumen, usuarios, cuenta, creación/edición modal, reportes sin integración, perfil y seguridad
  en 1440, 834, 390 y 320 px, temas claro/oscuro. También anchos 599, 600, 768, 1024, 1199 y
  1200 px, con alturas reducidas de 420/500 px para comprobar transiciones y diálogos con scroll.
- Cero desbordamientos horizontales o excepciones JavaScript. Campos de 44 px, tracks/alineación
  de tabla comprobados mediante geometría, recursos SVG presentes con dimensiones originales,
  hover/foco, estados deshabilitados y recuperación de una página fuera de rango.
- Login ADMIN real, creación 201, edición 200, lectura tras recarga y edición propia confirmadas
  mediante Prisma en una base efímera. Express, Prisma y Argon2id reales sobre PostgreSQL WASM
  aislado; sin usar credenciales ni modificar datos de Supabase.
- Escape, Tab/Shift+Tab, restauración de foco y scroll en modales/confirmaciones, selección local
  de foto, encuadre y cierre del visor. Se corrigieron el foco del visor de un único botón, el
  scroll de diálogos anidados y la sincronización del borrador tras cargar el perfil.
- Logout y login USER, cinco destinos Student sin estilos Admin ni desbordamientos, y rechazo
  del acceso USER a Admin. Las pruebas existentes de autenticación también se conservan.

Reportes, revisión y evidencia se cotejaron además con una entrada exclusiva de desarrollo
`Frontend/admin-review.html`, que identifica visiblemente sus datos sintéticos. No se importa en
las rutas de la aplicación ni forma parte del build de producción. Incluye carga, error, vacío,
lista, evidencia ausente/adjunta/fallida y visor en 1440/834/390 px y ambos temas. Las pruebas de
resolución comprueban un callback controlado y sus fallos; **no prueban persistencia de reportes**.
La foto local tampoco se guarda ni se presenta como actualización de la cuenta.

Artefactos locales ignorados: `.local/admin-modern-verify.log`,
`.local/admin-modern-review/results.json`, `.local/admin-modern-states-review/results.json`
y sus capturas. No se añadieron dependencias, configuración, endpoints ni migraciones.
No se ejecutaron `db:check`, migraciones compartidas, publicación ni GitHub Actions en esta tarea.
La emulación de Chrome no acredita Safari/Firefox ni dispositivos físicos. Los servicios pendientes
de reportes/resolución/adjuntos, cambio de estado, contraseña, foto y métricas siguen explícitos en
la interfaz y [admin.md](admin.md); no se atribuye integración a sus estados de presentación.

## Módulo II, Día 1 — 20 de octubre de 2026

En Windows con Node **22.23.1** y pnpm **10.18.2**, `pnpm verify` completo terminó con código **0**:
lint sin advertencias, formato correcto, **89 pruebas frontend** en 29 archivos, **34 backend**,
validación Prisma, build de ambas aplicaciones y **43 pruebas SQL/auth aisladas**. Total:
**166 pruebas aprobadas**. Incluye reconstrucción del SQL académico, seed, CRUD, permisos,
eliminación lógica, protección del último ADMIN y rollback de auditoría/revocación.

`pnpm db:check` terminó con código **0**, SELECT 1 real de solo lectura. No comprueba el esquema
actual ni aplica la nueva migración a Supabase. `git diff --check` correcto. Después de registrar
estos resultados se repiten formato y diff, se retira un BOM de AdminUsers.jsx y se añaden aserciones
de body vacío en creación/edición. Se repite la prueba ADMIN de validación con estas aserciones;
no hay cambios posteriores de comportamiento de la aplicación.

Se corrigieron fallos iniciales de pruebas y soporte de query sin omitir controles. El sandbox
bloqueó node:test/esbuild inicialmente con EPERM; las ejecuciones autorizadas completaron los controles.
No hay migración remota, fixtures compartidos, publicación ni ejecución comprobada de GitHub Actions.
PGlite usa PostgreSQL 18.3 con una conexión; no acredita concurrencia multiworker de PostgreSQL 17.
El seed cumple cinco filas en nueve tablas y documenta ExternalIdentity=0 por ausencia de vinculación
verificable con proveedores. [Resultados, cobertura y límites](module-ii/day-01-testing.md).

## Auditoría estructural — 9 de octubre de 2026

Antes de los cambios, `pnpm verify` terminó con código 0: ESLint sin advertencias, formato correcto,
83 pruebas frontend, 34 backend, validación de Prisma, build y 35 pruebas SQL.
Después: código 0 con 85 pruebas frontend; el resto, sin cambios. La nueva prueba de un 404 en una
cuenta recordada falla con el proveedor anterior y pasa con `use-known-users.js`.
No se cambiaron estilos, endpoints, esquema, migraciones ni permisos. No hubo revisión visual
en navegador porque no cambió CSS ni marcado. No se ejecutaron `db:check` ni GitHub Actions.

## Primera fase académica y Student desde Figma — 9 de octubre de 2026

`pnpm verify` terminó con código **0**: lint sin errores ni advertencias, formato correcto,
**83 pruebas frontend** en 26 archivos, **34 unitarias backend**, validación/generación Prisma,
build de ambos paquetes y **35 pruebas SQL**. Total: **152 pruebas aprobadas**, sin fallos.
El comando ejecutó `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm db:validate`,
`pnpm build` y `pnpm db:test` en ese orden. Tras actualizar esta documentación se repitió
solo la comprobación de formato y `git diff --check`; no hubo más cambios de comportamiento.

Pruebas frontend nuevas verifican las cinco rutas, rechazo de ADMIN/rol desconocido, sesión
inválida, cuenta compartida, reintento de red, cambio de rol al refrescar me, configuración demo
en producción y cancelación del adaptador. Comprueban perfil de sesión real, navegación móvil,
ocho estados de práctica elegidos manualmente, ausencia de cámara/peticiones educativas,
instrucciones, foco/restauración y conservación del progreso demo.

SQL aislado conserva permisos 401/403, CSRF, último administrador activo y cambios concurrentes,
validación de contraseña/correo/rol/estado, unicidad, edición excluyendo la propia cuenta,
correo cambiado pendiente de verificación, Argon2id real, sesiones y revocación. No se alteraron
los endpoints ni las pruebas existentes de persistencia.

Chrome revisó una **compilación de producción local**, con `VITE_STUDENT_DEMO=true`, contra
Express y Prisma/PrismaPg conectados por TCP a PostgreSQL WASM efímero. Sin mocks de auth,
hashing o persistencia y sin usar la base compartida. Resultado:

- **119 combinaciones**: cinco páginas × cinco tamaños × dos temas (50), ocho estados de práctica
  × cuatro tamaños × dos temas (64), y cinco estados de Progreso (5).
- Tamaños de página: 1440×960, 834×1100, 390×844, 320×640 y 1920×1080. Los estados de práctica
  se revisaron en los primeros cuatro tamaños. **72 capturas**, medidas de documento/controles,
  máximo Student 1044 px, cero desbordamientos horizontales, controles recortados o iconos sin recurso.
- Login real USER/ADMIN, contraseña incorrecta rechazada, acceso sin sesión a login,
  USER rechazado en Admin y ADMIN rechazado en Student, sin mostrar los layouts no autorizados.
- Cinco enlaces móviles navegables; diálogo de instrucciones dentro de 844×390, foco en regreso,
  Escape y restauración de foco. Se corrigieron el foco inicial y las etiquetas móviles partidas.
- Perfil de sesión real, logout USER y `/auth/me` posterior 401. Admin creó y editó una cuenta
  real en la base aislada; Prisma confirmó valores y el detalle mostró la edición tras recargar.
- **Cero excepciones JavaScript** en la última ejecución completa. El arnés se ajustó al retorno
  autorizado de login y a selectores válidos antes de esta ejecución.

Figma se consultó mediante el plugin y los skills de diseño a código/lectura. Se inventariaron
120 frames y sus instancias/Auto Layout. Se obtuvo contexto detallado y captura de 80 variantes:
30 Inicio, 36 Mis módulos, 14 Practicar/instrucciones. El límite Education impidió cargar otras
40 de práctica, que permanecen pendientes de cotejo detallado. Progreso y Perfil no tienen frames
propios en las páginas consultadas. Las capturas locales representativas se cotejaron con los
contextos disponibles; no se afirma comparación automática de píxeles ni inspección completa
de las variantes inaccesibles. Recursos originales, matriz y diferencias en
[student-design-audit.md](student-design-audit.md).

Artefactos locales ignorados: `.local/student-phase-verify.log`,
`.local/student-phase-review/results.json` y sus capturas. Documentación de requisitos 4.1–4.8,
configuración y alcance real/demo en [phase-one-prototype.md](phase-one-prototype.md).
Sin dependencias, migraciones ni cambios de backend nuevos. Sin fixtures en producción,
commit, push, deploy ni ejecución remota de GitHub Actions en esta tarea.
La emulación local no sustituye cámara física, Safari/Firefox, cookies de terceros o validación
de un modelo LSV; estos últimos no se implementaron. Los dominios publicados siguen siendo
configuración existente y evidencia histórica, sin comprobar un despliegue de estos cambios.

## Adaptación de todas las áreas — 9 de octubre de 2026

Se revisaron Login, Registro, cuenta, Student/inicio y módulos, y las siete pantallas Admin.
Se sustituyeron alturas mínimas rígidas por altura de viewport y crecimiento por contenido;
espacios, títulos, ilustraciones, columnas y diálogos responden al espacio disponible.
Alcance y límites en [responsive.md](responsive.md).

`pnpm verify` terminó con código 0: lint sin advertencias, formato, 73 pruebas frontend,
34 unitarias backend, validación/generación Prisma, build de ambos paquetes y 35 pruebas SQL.
Total: **142 pruebas aprobadas**. La salida informativa de Prisma hacia stderr aparece como
NativeCommandError en el log de PowerShell; validación y comando completo terminaron con éxito.

Chrome local comprobó **288 combinaciones**: 12 rutas × 12 tamaños × ambos temas, con
144 capturas y medidas de documento/controles, sin desbordamiento horizontal ni controles
recortados. Tamaños: 1920×1080, 1440×900, 1366×768, 1280×600, 1024×600, 834×1112,
390×844, 360×640, 320×568, 844×390, 720×450 y 390×400. Los dos últimos incluyen
espacio CSS reducido equivalente a zoom/teclado; no son pruebas de teclado físico.

Login completo sin scroll vertical en los escritorios comprobados de al menos 1200×600;
formulario y footer visibles en móviles comprobados de 360×640 y 390×844.
Registro completo en los escritorios comprobados de al menos 1200×768. Un diálogo de cierre
de sesión permanece dentro de 844×390 y permite desplazamiento interno cuando lo necesita.
Páginas largas, errores y móviles de menor altura conservan scroll natural.

Otras siete comprobaciones verificaron errores obligatorios y foco en Login/Registro,
inputs de 16 px con emulación táctil, acceso al botón al desplazar, nombres/apellidos de
100 caracteres sin espacios en detalle/edición a 1366 y 320 px, y cambio real de tema.
La cuenta de texto largo se creó y se leyó mediante API/Prisma en PostgreSQL WASM aislado.
Las animaciones originales activas se comprobaron en 48 muestras de Login/Registro:
tres tamaños, dos temas y cuatro momentos, sin desbordamiento ni controles recortados.
Ninguna revisión produjo excepciones JavaScript.

Evidencia ignorada por Git: `.local/responsive-review/` y `.local/responsive-verify.log`.
La aplicación revisada usa Vite y sesión real contra una base local efímera, sin leer `.env`
ni escribir en producción. Las demos mantienen sus avisos. Sin dependencias, contratos API
ni migraciones nuevas. No se desplegó el frontend ni se ejecutó GitHub Actions; Chrome local
no representa una matriz de Safari/Firefox ni una comparación automática píxel por píxel.

## Composición de contraseña y duplicados en Admin — 9 de octubre de 2026

Crear usuario exige 8–128 caracteres, una mayúscula Unicode y un carácter de puntuación/símbolo;
los espacios no cuentan como especial. Frontend muestra ayuda y errores por campo y el servidor
repite esas reglas. La autenticación de cuentas existentes y el registro público se conservan.
PostgreSQL comprueba correo/username únicos al crear y editar; los errores ADMIN distinguen
EMAIL_IN_USE, USERNAME_IN_USE y ACCOUNT_IDENTIFIERS_IN_USE, excluyendo la cuenta editada.
El formulario muestra solo los campos duplicados y conserva los datos para corregirlos.

La primera ejecución conjunta falló esperando la cabecera de detalle en una prueba de edición;
las diez pruebas de formularios aisladas pasaron. Después del ajuste del fallback genérico,
la repetición completa de `pnpm verify` terminó con código 0: lint sin advertencias, formato,
73 pruebas frontend, 34 unitarias backend, Prisma, build y 35 SQL (142 en total).
SQL comprobó siete/129 caracteres rechazados, ocho/128 aceptados, ausencia de mayúscula/símbolo,
espacio insuficiente, mayúscula Unicode, persistencia, login, duplicados canónicos y propia cuenta.
Sin base de producción, migraciones nuevas, dependencias, despliegue ni GitHub Actions.
Log local: `.local/admin-validation-verify.log`.

## Mínimo de contraseña en Crear usuario — 9 de octubre de 2026

Por solicitud del usuario, creación administrativa cambió de 15 a 8 caracteres mínimos,
tanto en frontend como en Zod del servidor; máximo 128 caracteres Unicode/512 bytes.
El registro público conserva 15 y el login existente acepta las cuentas creadas por Admin.
La prueba React rechaza siete sin enviar y permite ocho; la integración SQL crea con ocho,
comprueba hash Argon2id, lectura persistida y login. También rechaza siete y más de 128.
`pnpm verify` terminó con código 0: lint sin advertencias, formato, 67 pruebas frontend,
34 unitarias backend, Prisma, build y 35 SQL (136 en total). Sin acceso a la DB de producción,
migraciones, dependencias nuevas, despliegue ni ejecución de GitHub Actions.

## Administración — 9 de octubre de 2026

Se inspeccionaron mediante el plugin Figma y `figma-design-to-code` las siete pantallas,
sus versiones desktop/tablet/mobile, ambos temas, confirmaciones y estados. El alcance,
contratos reales y demostraciones se detallan en [admin.md](admin.md).

`pnpm verify` terminó con código 0: ESLint sin errores ni advertencias, formato correcto,
67 pruebas frontend, 34 pruebas unitarias backend, validación de Prisma, build de ambos
paquetes y 35 pruebas SQL. Total: 136 pruebas. Login, Registro y Student conservan sus pruebas.
Las nuevas pruebas administrativas cubren sesión/rol, CSRF, whitelist, formato, longitud
de contraseña, duplicados, unicidad al editar, correo pendiente y último administrador activo.
Dos intentos de degradación concurrentes dejan un administrador; el pool de pruebas tiene
una conexión, por lo que esto no se presenta como una prueba de estrés entre instancias.

La base de pruebas es PostgreSQL WASM efímero con migraciones existentes, PrismaPg y Argon2
reales. No se leyó `.env` ni se escribieron fixtures en Supabase. Creación y edición se
comprobaron con lectura posterior independiente; no hubo cambios de esquema ni migraciones nuevas.
Las pruebas React con fetch controlado verifican UI/contratos, no persistencia.

Chrome aislado ejecutó la aplicación contra esa API y base de pruebas, con autenticación real.
Se creó una cuenta, se recargó, se editaron nombre/correo y se volvió a recargar; lecturas
directas de Prisma confirmaron los cambios y emailVerified=false. Se comprobaron foco inicial,
Tab, Escape, restauración de foco y logout real en el diálogo nativo. Sin excepciones de JavaScript.
Las 42 capturas corresponden a siete vistas × tres anchos (1440/834/390) × dos temas;
ninguna presenta desbordamiento horizontal. Se revisaron también dimensiones de los SVG
renderizados y recursos locales. Evidencia local sin secretos: `.local/admin-review/`.

La inspección visual cubre esos anchos y Chrome; no equivale a una comparación automática
pixel a pixel ni a una matriz completa de navegadores. No se ejecutó GitHub Actions,
no se desplegó este Admin y no se modificó la base de producción.
Resumen, reportes, comentarios, progreso y cambios de estado mantienen avisos de demostración
o integración pendiente; el listado no afirma representar todos los usuarios de la DB.

## Diagnóstico del GET / y conexión de Netlify — 9 de octubre de 2026

El dominio estable de la API devuelve 404 JSON `NOT_FOUND` en `/` y 200 `ok` en `/api/health`.
Con Origin `https://vocessilentes.netlify.app`, health, me, csrf y el preflight de login devuelven
403 `ORIGIN_NOT_ALLOWED`, sin cabecera de permiso CORS. Sin Origin, csrf responde 200 y sus
cookies son HttpOnly, SameSite=Lax y sin Secure. No se enviaron credenciales ni se crearon sesiones.

La URL individual `voces-silentes-platform-23u4q3nk3-frany28s-projects.vercel.app` redirige con 302
a vercel.com antes de llegar a la API. El bundle publicado de Netlify `index-DJeme1ZB.js` contiene
la URL estable correcta, además del fallback de desarrollo del código; no se atribuye su uso
al fallback. Evidencia local sin secretos: `.local/deployment-connectivity.json`.

El usuario completó la autenticación oficial de Vercel. Se confirmó Root Directory Backend,
Express y Node 24.x; existía CORS_ORIGIN en singular y faltaban las variables esperadas.
La revisión automática de permisos interrumpió inicialmente la operación por un límite de uso;
no hubo cambios en ese intento. Se reanudó la revisión correctamente después de la petición de continuar.

Se configuraron para Production NODE_ENV=production, CORS_ORIGINS con el origen exacto Netlify,
SESSION_SAME_SITE=none y un CSRF_SECRET sensible aleatorio generado en memoria. NODE_ENV de
Preview se conservó separando los destinos; no se alteraron DATABASE_URL ni DIRECT_URL.
El proyecto pasó a Node 22.x y se redesplegó la misma versión del backend, con alias estable.
Nuevo despliegue: `voces-silentes-platform-3yb92k4u4-frany28s-projects.vercel.app`, Ready.

Comprobación posterior real con Origin Netlify: health 200, csrf 200, preflight login 204 y me
anónimo 401, con Allow-Origin exacto y Allow-Credentials=true. Cookies HttpOnly, Secure,
SameSite=None. Ambas cuentas completaron login 200, me 200, logout 204 y me posterior 401
con un cliente HTTP y cookies en memoria. Esto sí comprueba persistencia y verificación Argon2
del backend desplegado, además de HTTP; las sesiones creadas para comprobarlo se revocaron.

Revisión adicional desde Chrome aislado, sin dobles, en Netlify: ADMIN entró a `/admin` y USER a
`/student`; recarga y consulta me mantuvieron ambas sesiones, y logout devolvió 204. No hubo
errores CORS ni cookies bloqueadas en ese perfil. No garantiza la política de otros navegadores.
Evidencia sin secretos: `.local/vercel-production-fix.json`, `.local/live-auth-check.json` y
`.local/live-browser-check.json`. Se eliminó el archivo temporal privado de credenciales.
Formato y diff correctos; no hubo cambios de código, migraciones ni repetición de pruebas locales.
No se ejecutó GitHub Actions ni se redesplegó el frontend, que ya apuntaba a la API correcta.

## Dos cuentas de acceso solicitadas — 9 de octubre de 2026

Por solicitud expresa del usuario se crearon dos cuentas en la base real configurada en Backend/.env:
una ADMIN y otra USER, el rol de estudiante. `pnpm db:check` confirmó SELECT 1 antes de escribir.
Se validaron los datos con registrationSchema, se generaron contraseñas independientes con
node:crypto y se almacenaron únicamente hashes Argon2id mediante la implementación existente.

La creación de ambas cuentas y la promoción del UUID nuevo a ADMIN se ejecutaron en una única
transacción, sin modificar usuarios existentes. Se comprobaron hashes, roles, actividad y estado
no eliminado antes de confirmar; una lectura posterior confirmó las dos filas persistidas.
Ambas conservan emailVerified=false. No se crearon sesiones ni se probaron accesos HTTP remotos.
Credenciales entregadas de forma privada al usuario, excluidas de código, documentación y commits.
No cambiaron esquema, migraciones, dependencias ni configuración; no corresponde repetir el build.

## Radio estándar de los campos — 9 de octubre de 2026

Se retiró el override de 8 px de PasswordInput plain. Todos los campos heredan ahora
`--radius-lg` (12 px) de `.vs-input-shell`; el estándar por tipo de elemento está en
[design-system.md](design-system.md#estándar-de-radios). No cambiaron tokens ni lógica de formularios.

Revisión local en Brave/Chromium: 40 muestras de login/registro, ambos temas, escritorio de
1440 px y móvil de 390 px; normal, foco, error, contraseña visible y disabled aplicado al DOM.
Los cuatro radios de todos los campos fueron 12 px; los 18 campos de la galería también,
incluidas sus variantes predeterminadas y controles deshabilitados reales. Evidencia ignorada:
`.local/radius-review.json` y `.local/radius-login-dark.png`. Auth/me usa un doble 401 local;
no se enviaron credenciales ni se hicieron escrituras en la base compartida.

Lint, formato, build frontend y `git diff --check` correctos. No se añadieron ni repitieron
pruebas unitarias para este ajuste CSS; los resultados de 125 pruebas de la entrega anterior
son históricos. No se ejecutó GitHub Actions ni se publicó un nuevo despliegue.

## Registro alineado con User y estilos de login — 9 de octubre de 2026

Se cotejaron los cinco campos con `registrationSchema`, User y el servicio de registro.
La presentación comparte AuthLayout/AuthForm con login, con textos, ayudas y campos propios.
Se añadió validación local antes del envío, omisión del apellido vacío o con espacios,
errores accesibles, mensajes controlados y estados de carga/reintento.
No cambiaron esquema, migraciones, dependencias ni configuración remota.

Revisión local en Brave/Chromium: 16 muestras, ambos temas a 1440, 834, 390 y 320 px,
estados inicial/error y movimiento reducido. Sin desbordamiento horizontal ni superposición
de cabecera, tarjeta y pie; cinco campos presentes, cuatro obligatorios inválidos en vacío,
foco en el nombre y órbitas sin contornos cuadrados. Capturas y medidas ignoradas en
`.local/register-*.png` y `.local/registration-review.json`; `/auth/me` usa un doble 401 local.
No se enviaron registros a la API pública ni se crearon cuentas en PostgreSQL compartido.

Las pruebas nuevas comparan los límites directamente con el esquema Zod del backend y cubren
la carga, el envío único, el conflicto genérico y la corrección de errores. Detectaron la diferencia
entre unidades UTF-16 del input y puntos de código Unicode de Zod, corregida en los nombres.
El payload de la prueba de navegación se valida también con el esquema real del backend.

`pnpm verify` terminó con **código 0**: lint y formato, **61 pruebas frontend**, **34 backend**
y **30 de integración SQL aislada** (125 en total), validación Prisma y ambos builds correctos.
No se ejecutó GitHub Actions ni se publicó en Netlify/Vercel.

## Órbitas del login sin contornos cuadrados — 9 de octubre de 2026

Se añadió border-style: none a `.login-orbit`: Preflight de Tailwind hacía visibles las cajas
rectangulares cuando los keyframes originales animaban border-width. Los SVG circulares conservan
sus recursos y las animaciones de escala/opacidad; no se modificaron las muestras de Figma.

Revisión local en Chromium a 1440 px, ambos temas y cinco momentos del ciclo de 8 segundos,
más movimiento reducido (12 muestras, dos órbitas por muestra). Antes aparecía borde solid de 1 px;
después todas las muestras tienen none/0 px. Los SVG siguen cargados, las tres animaciones de cada
órbita siguen presentes con movimiento normal y se desactivan con movimiento reducido.
Capturas y mediciones locales ignoradas en `.local/orbit-after-*.png` y `.local/orbit-after.json`.
Formato, diff y build frontend correctos. No se añadieron pruebas ni dependencias para este ajuste CSS.
No se ejecutó GitHub Actions ni se publicó en Netlify.

## URL pública de API y comprobación de Vercel — 9 de octubre de 2026

El usuario confirmó `https://voces-silentes-platform.vercel.app/`. Se añadió la variable pública
`VITE_API_URL=https://voces-silentes-platform.vercel.app/api` a netlify.toml y se reconstruyó
Frontend/dist con ese valor. El build terminó con **código 0**; el bundle incluye la URL confirmada
y conserva `_redirects`. Formato y `git diff --check` correctos. No cambiaron código ni dependencias;
la ejecución completa de 121 pruebas de la corrección anterior sigue siendo aplicable.

Comprobación pública: health sin Origin **200** con el contrato esperado; health, preflight login
y me con Origin Netlify **403**. Sin Origin, me devuelve **401 UNAUTHENTICATED** y csrf **200**
con cookies HttpOnly, SameSite=Lax y sin Secure. Se registraron únicamente estados y atributos,
nunca valores de cookies/tokens. No se enviaron credenciales ni se hicieron escrituras PostgreSQL.

`pnpm vercel whoami` indicó sesión cerrada; no hay proyecto local vinculado ni token de entorno.
No se modificó configuración remota ni se publicó un deploy. Quedan pendientes CORS_ORIGINS,
NODE_ENV=production, SESSION_SAME_SITE=none y un CSRF_SECRET privado válido en Vercel, con nuevo
deploy backend; después publicar el frontend actualizado. Los pasos están en [netlify.md](netlify.md).

## Inicio público y rutas de Netlify — 9 de octubre de 2026

La revisión pública de `https://vocessilentes.netlify.app/` obtuvo HTML 200 y el bundle
`index-mgXqYp4N.js`, que contiene la pantalla técnica y las rutas login/student. Las solicitudes
directas `/login` y `/student` devolvieron **404** de Netlify. El entorno público compilado no incluye
VITE_API_URL y conserva el fallback localhost:3000/api. No se consultaron credenciales ni datos privados.

Se cambió `/` para redirigir a `/login`, se actualizaron las pruebas existentes de inicio/tema
y se añadió `Frontend/public/_redirects`, copiado correctamente a `Frontend/dist/_redirects`.
`netlify.toml` fija el build del frontend desde la raíz y la carpeta publicada Frontend/dist.
`pnpm verify` terminó con **código 0**: lint/formato, **57 pruebas frontend**, **34 backend**,
**30 de integración SQL aislada** (121 en total), Prisma validate y ambos builds correctos.

No se publicó un nuevo deploy ni se modificaron ajustes de la cuenta Netlify. El sitio remoto
conservará el comportamiento anterior hasta publicar estos cambios. La URL pública real del backend
debe configurarse como VITE_API_URL durante el build; ver [netlify.md](netlify.md).
No se ejecutó GitHub Actions ni db:check remoto para esta corrección de frontend.

## Preparación del backend para Vercel — 9 de octubre de 2026

Windows, Node **22.23.1**, pnpm **10.18.2**. `pnpm verify` terminó con **código 0**:
lint sin errores/advertencias, formato, **57 pruebas frontend**, **34 backend** y
**30 de integración SQL aislada** (121 en total), Prisma validate y ambos builds correctos.
El primer intento dentro del sandbox terminó en `spawn EPERM` al iniciar pruebas; la ejecución
con permisos de procesos completó todos los controles. No fue un fallo de la aplicación.

La CLI instalada responde como **63.1.2**. El detector oficial `@vercel/express` seleccionó
`Backend/app.js`, y el análisis local `@vercel/nft` incluye `generated/client.js` y el binding Argon2
de Windows, sin archivos `.env`. El análisis informa cinco referencias opcionales/no aplicables a
Node (`pg-native`, `supports-color`, `cloudflare:sockets`, `bufferutil`, `utf-8-validate`);
no se añadieron dependencias que la aplicación no usa. El build Linux del binding sigue pendiente.

Dos pruebas nuevas ejecutan la entrada real aislada: rutas, CORS/preflight, errores, cookies Secure
y SameSite=None detrás del proxy Vercel; fuera de Vercel, headers arbitrarios no permiten auth HTTP.
Otra prueba usa PostgreSQL WASM por TCP para comprobar la consulta y cierre del pool externo Vercel.
`pnpm db:check` completó SELECT 1 contra la conexión privada existente, sin cambios de datos.

No se vincularon cuentas/proyectos ni se publicaron despliegues. No se ejecutaron `vercel build`
vinculado ni GitHub Actions; configuración remota, TLS, cookies reales y permisos de producción
deben comprobarse al seguir [vercel.md](vercel.md). Se conservaron los cambios existentes del frontend.

## Migración del login a Tailwind — 9 de octubre de 2026

Verificación local: `pnpm lint`, `pnpm format:check`, las **45 pruebas frontend** y
`pnpm --filter @vocessilentes/frontend build` terminaron con código 0.
Esta revisión modifica presentación y aliases visuales; no cambia autenticación ni dependencias.
No se repitieron los controles backend/SQL/Prisma de la entrega anterior ni GitHub Actions.

Se volvieron a capturar ambos temas a **1440/834/390/320 px**. Las posiciones y dimensiones
de cabecera, tarjeta, campos, footer, panel, emblema e icono de contraseña coinciden con las
mediciones anteriores a Tailwind en las ocho composiciones iniciales.
Se revisaron nuevamente los **48 casos** de errores/carga/429: sin overflow horizontal
ni textos recortados; el texto largo a 320 px conserva el crecimiento de la tarjeta.
Se comprobaron recursos originales y fuentes, las ocho capas de movimiento reducido y
el foco visible por teclado. Evidencia local ignorada en `.local/login-*.png` y JSON,
con mediciones previas en `login-geometry-before-tailwind.json` y `login-states-before-tailwind.json`.

## Inicio de sesión de Figma — 9 de octubre de 2026

Windows, Node **22.23.1**, pnpm **10.18.2**. `pnpm verify` terminó con **código 0**:
lint sin errores/advertencias, formato, **45 pruebas frontend**, **32 backend** y
**29 de integración SQL aislada** (106 en total), Prisma validate y build correctos.
Se añadieron 12 casos frontend relevantes y se ajustaron los selectores existentes al texto de Figma.
No se alteraron backend, modelos, migraciones, dependencias ni lockfile; no se ejecutó db:check remoto.
Tras el último ajuste accesible se volvió a comprobar frontend/lint; los cambios finales de documentación
pasaron format:check. Los controles remotos de GitHub Actions no se ejecutaron.

Se compararon capturas de la pantalla contra Figma en ambos temas a **1440, 834 y 390 px**.
Escritorio inicial: tarjeta 480 × 630 en (168,154), panel 600 × 912 en (816,24).
Tablet: tarjeta 480 × 630 en (177,157), franja 770 × 110.
Móvil: tarjeta 342 × 592, con padding exterior de 24 px; el tema oscuro conserva su marca de 36 px.
Se corrigieron la precedencia del borde de error, la cabecera móvil, el tamaño del isotipo oscuro,
la sombra de la vista previa y el ancho de 148 px del título de alerta.

Se revisaron **48 combinaciones** de seis estados (vacíos, correo inválido, credenciales, conexión,
carga y 429), dos temas y cuatro anchos (**1440/834/390/320**): sin desbordamientos horizontales
ni texto recortado. Los errores se capturaron a la altura de sus frames originales para evitar que
la barra de desplazamiento de Windows redujera el área de comparación. Texto largo a 320 × 568
permitió crecimiento de la tarjeta a 1138 px y de la página a 1392 px sin overflow horizontal.

Auditoría de **46 slots visibles** en las composiciones iniciales: recursos con contenido,
imágenes decodificadas y geometría comprobada, fuentes Manrope/Inter cargadas.
Se verificaron el control Eye normal y sus estados disabled en las capturas de carga.
Movimiento normal: gradientes, órbitas, emblema y etiquetas en ciclos de 8 s; entrada de tarjeta
una sola vez. Movimiento reducido: ninguna animación activa en las ocho capas inspeccionadas.
Tab enfocó el selector de tema con contorno sólido visible.

Evidencia local ignorada: `.local/login-*.png`, `login-geometry.json`, `login-states.json`,
`login-assets.json` y `login-motion.json`. Los estados de API en capturas y pruebas frontend
usan dobles explícitos; no prueban una sesión de navegador contra Supabase. La integración
SQL existente sí ejecutó Express, Argon2 y Prisma sobre PostgreSQL WASM aislado.
No se crearon cuentas ni sesiones de prueba en la base compartida.

Los límites de CORS/Retry-After y de la exportación del grosor de órbitas, el selector móvil añadido
y las diferencias tipográficas están documentados en [login.md](login.md).
La primera ejecución de Vite/Vitest encontró EPERM del sandbox; la ejecución autorizada pasó.
Se usaron Vite en 5181 con caché aislada y Brave headless con perfil independiente,
conservando los procesos de desarrollo que ya existían. No hubo publicación ni despliegue.

## Componentes generales de Figma — 9 de octubre de 2026

Verificación local en Windows con Node **22.23.1** y pnpm **10.18.2**.
`pnpm verify` terminó con **código 0**: lint sin errores/advertencias, formato correcto,
**33 pruebas frontend**, **32 backend** y **29 de integración SQL aislada** (94 en total),
Prisma validate, build frontend, sintaxis backend y generación/compilación Prisma correctos.
No se modificaron contratos API, lógica backend, dependencias ni el lockfile. No se ejecutaron
db:check ni migraciones ni pruebas contra PostgreSQL remoto para esta tarea de UI.

Galería en `/ui.html`, servida en localhost:5180 para esta revisión, sin proveedores de auth ni API.
El build solo contiene index.html: no se incluyeron la entrada, componentes ni rutas de galería.
Se comprobaron diez component sets frente a capturas originales de Figma, ambos temas, con
viewport 1776 px y escala 1, esperando fuentes Manrope/Inter y recursos. Dimensiones de todas
las variantes coinciden con la referencia; se corrigieron precedencia de estilos de Button,
altura de Input y anchura del track de Progress. A 375 px, documento y controles sin desbordamientos.
Los 36 SVG locales originales tienen contenido y dimensiones nativas correctas en sus slots;
el navegador renderizó 64 slots de iconos. prefers-reduced-motion produce transition-duration:0s.

Evidencia local ignorada: `.local/figma-0.png` a `figma-9.png`, `gallery-0.png` a `gallery-9.png`,
`gallery-mobile.png`, `ui-geometry.json`, `ui-mobile.json` y `ui-assets.json`.
Las capturas se revisaron visualmente, sin afirmar identidad píxel por píxel. Persisten diferencias
de rasterización tipográfica entre Figma y Windows/Chromium; el foco añadido al botón secundario
y la extensión PasswordInput están documentados en [design-system.md](design-system.md).
Figma permite consultar diseño/variables, pero Code Connect está bloqueado por el plan educativo;
se documentó una correspondencia manual, sin afirmar que no existan conexiones previas.

La primera ejecución de Vite/Vitest falló por EPERM del sandbox de Windows; los mismos comandos
completaron correctamente con ejecución autorizada de subprocesos, sin cambiar configuración para
ocultar el fallo. Se usó Brave headless con perfil temporal independiente para las capturas.
GitHub Actions no se ejecutó ni comprobó remotamente; no hay commits ni publicación en esta entrega.

## Autenticación — 9 de octubre de 2026

Ejecutada localmente en Windows, Node **22.23.1** y pnpm **10.18.2**. No se modificó el esquema,
se aplicaron migraciones nuevas ni se insertaron fixtures/administradores en Supabase.
`pnpm verify` completo terminó con **código 0**, sin errores ni advertencias de lint.

| Control                               | Resultado observado                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Lint                                  | Correcto, sin errores ni advertencias                                                                |
| Backend (`test`)                      | 32 pruebas aprobadas: incluye configuración auth y HTTPS/proxies/cookies de producción               |
| Frontend (`test`)                     | 23 pruebas aprobadas en 7 archivos: formularios, guards, red, logout, CSRF y respuestas tardías      |
| Integración aislada (`db:test`)       | 29 pruebas aprobadas: 13 SQL existentes + 16 auth HTTP/PrismaPg/Argon2id reales                      |
| PostgreSQL remoto (`db:check`)        | SELECT 1 correcto con la conexión runtime privada                                                    |
| Historial (`db:status`, `db:inspect`) | Una migración finalizada: 20261009000100_phase_one; schema up to date; nueve tablas en vocessilentes |
| Lectura Prisma remota                 | Transacción READ ONLY: User y Session con cero filas                                                 |
| Arranque HTTP con DB real             | Servicio auth inicializado; health 200, me sin cookie 401, csrf 200; sin escrituras                  |

Formato, Prisma validate, generación/compilación del cliente 7.10.0, sintaxis del backend y build
frontend correctos. `pnpm install --frozen-lockfile --offline` terminó con código 0, sin cambios
del lockfile. `git diff --check` correcto. Total: **84 pruebas aprobadas**. La verificación agregada
detectó primero formato en un test de formulario; se aplicó Prettier y el control final completo pasó.

Las pruebas aisladas ejecutan las migraciones versionadas en PGlite **0.5.8 / PostgreSQL 18.3**,
exponen protocolo PostgreSQL por TCP loopback y usan **Prisma 7.10.0, PrismaPg/pg y Argon2 nativo**.
Registro válido/concurrente, duplicados, campos privilegiados, contraseña exacta/Unicode, login y
estados de cuenta, intentos concurrentes, cookies y hash de sesión, expiración/revocación/logout,
401/403/ADMIN, cambio de rol/estado después de login, CSRF anónimo/rotación/cookies obsoletas,
CORS con credenciales, límites IP/IP+correo y ausencia de campos sensibles están cubiertos.
La ruta administrativa de prueba y sus cuentas existen exclusivamente en la base efímera.

Frontend usa fetch controlado en jsdom, no conexiones remotas ni cookies reales de navegador.
Prueba ocultación durante me, 401 frente a 403/red, retornos internos, formularios y AbortSignal,
logout fallido/satisfactorio y descarte de me/401 tardíos después de cancelación/autenticación.
Las pruebas de configuración/transporte de producción simulan un proxy permitido por loopback;
no son una validación del TLS/proxy de un despliegue real.

La base compartida **PostgreSQL 17.11** se comprobó solo con lectura y arranque del servicio.
No se probó registro/login de una persona real en Supabase ni se afirma una sesión remota real.
Una comprobación inicial de lectura no finalizó; la repetición con timeout de transacción de
15 segundos completó ambas consultas y el arranque HTTP. No se imprimieron errores internos.
Los subprocesos Vite inicialmente bloqueados por EPERM completaron la ejecución autorizada.

Producción pendiente: HTTPS y proxy real, CSRF_SECRET privado persistente/compartido, CORS HTTPS
exacto y SameSite según sitio; medir capacidad Argon2 y acordar limitación compartida antes de
varias réplicas. MemoryStore es por proceso; no hay bloqueo automático global, MFA, filtro de
contraseñas filtradas, correo/recuperación ni purga de sesiones. PGlite es una conexión y versión
18.3; no valida concurrencia multiworker de PostgreSQL 17, TLS ni navegador real. No se ejecutó
GitHub Actions remotamente ni se publicó la aplicación. Procedimiento del primer administrador
documentado y no ejecutado: [authentication.md](authentication.md).

## Histórico: fase 1 de datos — 9 de octubre de 2026

Ejecutada localmente en Windows con Node **22.23.1** y pnpm **10.18.2**.
`pnpm verify` completo terminó con **código 0**, sin errores ni advertencias de lint.

| Control                      | Resultado observado                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Lint / formato               | Correctos                                                                                                                 |
| Backend                      | 28 pruebas aprobadas: 25 existentes y 3 de configuración de migraciones                                                   |
| Frontend                     | 11 pruebas aprobadas en 2 archivos                                                                                        |
| SQL aislado (`db:test`)      | 13 pruebas aprobadas; PGlite 0.5.8 / PostgreSQL 18.3 WASM en memoria                                                      |
| Prisma validate              | Válidos los cuatro dominios del esquema con nueve entidades                                                               |
| Prisma generate              | Cliente 7.10.0 generado y compilado a JavaScript ESM                                                                      |
| Build                        | Frontend, sintaxis backend y generación/compilación Prisma correctos                                                      |
| PostgreSQL real (`db:check`) | SELECT 1 correcto con PrismaPg y DATABASE_URL Transaction 6543                                                            |
| Inspección previa            | PostgreSQL 17.11; sin tablas de aplicación ni historial Prisma; lectura sin modificaciones                                |
| Identificación del destino   | DIRECT_URL Session 5432 coincide en host, usuario y base con runtime; usuario confirmó desarrollo del proyecto            |
| Aplicación                   | `20261009000100_phase_one` aplicada mediante Prisma migrate deploy, sin shadow                                            |
| Historial real               | Una migración finalizada, sin rollback; `_prisma_migrations` en vocessilentes                                             |
| Estado Prisma                | `db:status`: schema is up to date                                                                                         |
| Catálogo real                | Nueve tablas de aplicación, 27 CHECK, 13 FK; todas las FK RESTRICT/CASCADE                                                |
| Seguridad real               | RLS en las nueve tablas, cero políticas; anon/authenticated/service_role sin USAGE/CREATE de esquema ni permisos de tabla |
| Lectura real con Prisma      | count() de las nueve entidades mediante PrismaPg/Transaction: todas con cero filas                                        |
| Revisión Git                 | `git diff --check` correcto; sin commits ni publicación                                                                   |

La migración se generó con `migrate diff --from-empty --to-schema prisma --script --output ...`,
se revisó y se probó antes de deploy. Es aditiva y no insertó usuarios, administradores ni contenido.
Las verificaciones de catálogo y count() se ejecutaron dentro de transacciones READ ONLY.
Las pruebas de restricciones y permisos ejecutan el SQL versionado exclusivamente en memoria:
unicidad, normalización, FK, estados con NULL, fechas, contexto de reportes, reapertura, persistencia
del progreso ante eliminación lógica, RESTRICT y denegación para roles equivalentes de Data API.

El sandbox bloqueó inicialmente subprocesos con EPERM; la ejecución autorizada completó Prisma,
pruebas y builds. La instalación de PGlite necesitó descarga porque no estaba en la caché offline.
Se corrigieron parámetros SQL de fixtures con tipos explícitos y el SQLSTATE esperado para RESTRICT
del motor aislado antes de ejecutar la verificación final. No se modificaron controles para ocultar fallos.

Límites pendientes:

- El PDF mencionado no estaba accesible; se implementaron las decisiones explícitas del texto adjunto.
- No se obtuvo la lista de esquemas expuestos de Data API desde SQL; pgrst.db_schemas estaba ausente.
  Sí se verificaron revocaciones reales y RLS, sin políticas de acceso público.
- PGlite usa PostgreSQL 18.3 y la base remota usa 17.11. Las pruebas de escrituras son aisladas;
  el catálogo y las lecturas Prisma se comprobaron realmente en remoto, sin escrituras de fixtures.
- GitHub Actions no se ejecutó ni se comprobó remotamente en esta tarea.
- No hay endpoints nuevos, autenticación completa, reglas de bloqueo, OAuth ni reconocimiento LSV.

Reproducir controles con `pnpm verify`; conectividad y lectura de historial requieren entorno privado:
`pnpm db:check`, `pnpm db:inspect`, `pnpm db:status`. Ver [migraciones](migrations.md).

## Histórico: preparación de la base inicial

Ejecutada localmente en Windows el **9 de octubre de 2026**, Node **22.23.1** y pnpm **10.18.2**.

| Control                                 | Resultado observado                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| Instalación pnpm                        | Correcta, dependencias fijadas sin conflictos forzados                                |
| Instalación frozen-lockfile desde caché | Correcta, sin modificar el único lockfile                                             |
| Lint                                    | Correcto, sin errores ni advertencias                                                 |
| Prettier                                | Formato aplicado y format:check correcto                                              |
| Backend                                 | 25 pruebas aprobadas con node:test y Supertest, sin PostgreSQL                        |
| Frontend                                | 11 pruebas aprobadas en 2 archivos con Vitest y Testing Library                       |
| Prisma validate                         | Esquema válido, sin entidades ni conexión a PostgreSQL                                |
| Prisma generate                         | Cliente 7.10.0 generado con esquema sin entidades y compilado a JavaScript ESM        |
| Cliente generado                        | Importado e instanciado con PrismaPg; desconectado sin abrir conexión                 |
| Build                                   | Frontend compilado; sintaxis backend y generación Prisma correctas                    |
| Arranque conjunto                       | pnpm dev inicia API en 3000 y Vite en 5175 con variables temporales                   |
| Comprobación HTTP real                  | Frontend 200, health 200, CORS exacto 5175 y ruta desconocida 404                     |
| Cierre                                  | Ctrl+C produjo log de cierre del backend; pruebas verifican cierre HTTP y desconexión |

Los puertos 5173 y después 5174 estaban ocupados por un Vite existente de este mismo workspace.
Se conservó ese proceso. Se agregó FRONTEND_PORT configurable y se usó 5175 solo para la comprobación
conjunta, con CORS_ORIGINS temporal correspondiente. Los `.env` locales, ignorados por Git, usan 5174;
los ejemplos usan 5173. El proceso iniciado para comprobar 5175 se detuvo al terminar.

El sandbox de Windows bloqueó inicialmente subprocesos de Vite con EPERM. Tests y build se ejecutaron
con acceso autorizado a esos procesos, sin cambiar reglas de lint ni forzar dependencias.
Las pruebas detectaron una URL inválida que escapaba de safeParse; se corrigió la validación
y los controles posteriores pasaron.

### No comprobado en la preparación inicial

- PostgreSQL: no hay DATABASE_URL de desarrollo configurada ni psql disponible en PATH.
  No se conectó a una base real ni se ejecutaron migraciones. Generación/instanciación no prueban conexión.
- Migraciones: no existen modelos aprobados ni SQL. El comando está preparado para una etapa posterior.
- MediaPipe: paquete instalado; no se descargaron modelos, activó cámara ni ejecutó inferencia.
  No existe reconocimiento LSV ni un modelo específico validado.
- Figma: sin referencia accesible; los estilos siguen siendo provisionales del navegador.
- GitHub Actions: workflow creado para Linux/Windows, sin despliegue. No se ejecutó remotamente.
  La carpeta inicial no contenía `.git`; no se creó historial, commit, PR ni publicación.
- Comprobación visual en navegador: cubierta funcionalmente con jsdom y HTTP; no se realizó
  validación de píxeles, contraste de un diseño aprobado ni cámara física.

`pnpm verify` completo terminó correctamente con código de salida 0.
Reproducción sin PostgreSQL: `pnpm install --frozen-lockfile` y `pnpm verify`.
Con una base de desarrollo configurada: `pnpm db:generate` y `pnpm db:check`.
