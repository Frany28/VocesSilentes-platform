# Cuentas, dashboard y reportes conectados — 23 de octubre de 2026

Esta actualización completa las acciones existentes de las pantallas autenticadas. Se conservan
componentes, estilos, tokens, temas y rutas de navegación. No se desarrolla ni rediseña el contenido
de lecciones, el reconocimiento LSV, OAuth, recuperación de acceso ni envío de correo.

## Acciones disponibles

| Función              | Implementación                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Desactivar/reactivar | Diálogo original → PATCH ADMIN; estado, revocación y auditoría en transacción                |
| Dashboard ADMIN      | Recuentos globales de cuentas y reportes, más tres pendientes recientes                      |
| Detalle de cuenta    | Identidad, seguridad y actividad ya persistida; sin métricas inventadas                      |
| Perfil USER          | Edición propia de nombre, apellido, correo y username; no admite rol ni otro ID              |
| Perfil ADMIN         | Conserva el formulario y PATCH administrativo existente                                      |
| Contraseña           | Verifica actual, guarda Argon2id y revoca las demás sesiones; conserva la actual             |
| Foto                 | Selección/zoom originales, saneamiento/recorte en servidor, almacenamiento privado y borrado |
| Reportes             | Creación idempotente, adjunto validado, visor autorizado, resolución, reapertura y bitácora  |

Reactivar una cuenta no restaura sesiones revocadas: exige un login nuevo. El último ADMIN activo
no se puede desactivar ni eliminar. Las cuentas eliminadas no se restauran mediante reactivación.
La operación repetida con el mismo estado no añade otro evento. Se revalida al actor bajo bloqueo
con el advisory lock compartido por las demás operaciones administrativas.

Los datos del dashboard se leen en RepeatableRead y no se deducen de una página del listado.
Última actividad usa la fecha máxima entre sesiones y eventos existentes. Los contadores educativos
solo consultan registros actuales; esta tarea no crea ni evalúa lecciones.

## API y protección

Todas las rutas requieren sesión vigente, transporte autorizado y respuestas `no-store`.
Todas las escrituras requieren CSRF; Zod rechaza campos adicionales. Las operaciones de cuenta
obtienen el ID de la sesión. El backend comprueba permisos, independientemente del frontend.

| Método / ruta                        | Entrada / resultado                                                                |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| GET `/api/admin/summary`             | ADMIN; users, activeUsers, inactiveUsers, pendingReports, resolvedReports, reports |
| PATCH `/api/admin/users/:id/state`   | ADMIN; `{isActive: boolean}` → `{data:{user}}`                                     |
| PATCH `/api/account/profile`         | firstName, lastName opcional/nullable, username, email → usuario público           |
| PUT `/api/account/password`          | currentPassword, newPassword → 204; diez intentos/usuario/10 min/proceso           |
| PUT `/api/account/photo?zoom=100`    | JPEG/PNG/WEBP binario hasta 5 MiB, zoom entero 100–135 → usuario público           |
| DELETE `/api/account/photo`          | Borra foto y referencia → usuario público                                          |
| GET `/api/account/photos/:id/image`  | Bytes WEBP; exclusivamente titular o ADMIN                                         |
| GET `/api/account/photos/:id/access` | Enlace temporal de 120 s; mismos permisos                                          |

Nueva contraseña: 15–128 puntos Unicode, máximo 512 bytes, distinta de la actual. No se recorta
ni normaliza. La política de alta administrativa existente permanece en ocho caracteres por la
decisión previa del usuario. Cambiar el correo restablece emailVerified=false; no simula verificación.
Perfil, contraseña, estado y foto usan USER_UPDATED en AuditLog sin guardar valores sensibles.
Errores específicos: CURRENT_PASSWORD_INVALID (400), CREDENTIALS_CHANGED (409),
PHOTO_STORAGE_UNAVAILABLE (503), PHOTO_NOT_FOUND (404), además de permisos/conflictos existentes.
El límite devuelve ACCOUNT_RATE_LIMIT (429) en el mismo envelope JSON; las cuotas de foto y
contraseña son independientes y no se comparten entre usuarios.

## Fotos y almacenamiento real

`Backend/storage/002_profile_photos.sql` crea `profile-photos` privado con política restrictiva.
Se aplicó al Supabase de desarrollo autorizado; no modifica usuarios ni los objetos de reportes.
Usa las mismas credenciales S3 privadas existentes y no introduce variables públicas ni dependencias.
La imagen se valida por contenido, dimensiones y formato mediante el saneador existente. El servidor
guarda WEBP de 512×512 sin metadatos, con el recorte central/zoom que representa la vista previa.
Las claves se generan en servidor; el cliente no elige usuario, bucket ni ruta.

La carga precede a la referencia SQL. Si falla la transacción/auditoría se intenta retirar el objeto
nuevo. Después de guardar un reemplazo se retira la foto anterior; un fallo de esa limpieza no revierte
la foto nueva. SQL y S3 no comparten transacción: una caída del proceso o del proveedor puede dejar
objetos sin referencia y requiere reconciliación operativa. No se promete atomicidad distribuida.
Al quitar una foto se conserva temporalmente su contenido en memoria para compensar un fallo de
confirmación SQL; un fallo de auditoría no retira el objeto ni confirma el borrado.
El límite del host sigue aplicando: Vercel admite menos de los 5 MiB del servidor Express; ver
[límites de carga existentes](report-evidence.md). No se implementa una cuarentena de subida directa.

## Conexiones y comprobación

`pnpm verify` final terminó con código **0**: **109 frontend + 44 backend + 65 SQL/auth = 218 pruebas
aprobadas**, lint sin advertencias, formato, esquema Prisma y build correctos.

Runtime y CLI fuerzan `verify-full` en Supabase, con CA pública versionada en `Backend/certs/`.
Se comprobó TLS activo y certificado autorizado para DATABASE_URL y DIRECT_URL. Las URLs y secretos
existentes no se imprimen ni sobrescriben. Prisma conserva diez segundos de espera de conexión
transaccional y quince de transacción, para admitir la negociación TLS en un arranque frío remoto.
`pnpm db:status` confirmó cuatro migraciones al día. No fue necesaria una migración de aplicación.

Comprobación real sobre Supabase/S3: alta administrativa, login, edición propia, foto recortada,
lectura privada/borrado, reporte con PNG, visor firmado, resolución, dashboard, desactivación,
revocación, reactivación y cambio de contraseña. Se retiraron únicamente los UUID y objetos creados
por esa ejecución; se conservaron los datos preexistentes. Resultado en `.local/live-functional-results.json`.

Chrome aislado comprobó las nuevas acciones de cuenta y persistencia tras recarga, con 16
combinaciones de perfil/seguridad, dos temas y cuatro anchos sin desbordamiento ni errores JS.
`pnpm academic:verify` comprobó cinco reportes con cinco imágenes en fixture local, visor,
resolución/reapertura, 24 eventos y 40 combinaciones de vistas. Esa prueba usa PostgreSQL WASM y
Storage de prueba, diferenciados de la comprobación remota anterior. No se ejecutaron despliegues
ni GitHub Actions. Los artefactos de entrega antiguos conservan su código de aquella versión.
