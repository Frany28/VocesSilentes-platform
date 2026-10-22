# Evidencias de reportes

Implementación del 21 de octubre de 2026. El flujo usa las sesiones opacas propias de
VocesSilentes (`User`/`Session`), **no Supabase Auth**. Reutiliza DATABASE_URL/Prisma,
requireSession, transporte HTTPS, CSRF firmado y el cliente HTTP compartido.
Las credenciales PostgreSQL existentes no son credenciales de la API Storage.

## Contrato y permisos

- Bucket **privado** `report-evidence`, separado de fotos de perfil. Una imagen opcional por reporte.
- Límite de entrada y objeto procesado: **5 MiB = 5 242 880 bytes**, mostrado como 5 MB en UI.
- Solo JPEG, PNG y WEBP estáticos. Sharp **0.35.5** comprueba firma, metadatos y decodificación
  completa; recodifica al formato detectado sin EXIF ni contenido añadido. El nombre original
  y Content-Type no autorizan un archivo: un documento llamado foto.jpg se rechaza; una imagen
  válida se almacena con su MIME real. SVG/GIF/PDF y APNG/WEBP animado se rechazan.
- Hasta **8192 px por lado y 16 000 000 píxeles**. Timeout de procesamiento 10 s, dos
  decodificaciones simultáneas por proceso; exceso devuelve 429. No se renderizan SVG/documentos.
- Solo el autor puede adjuntar, incluso si el solicitante es ADMIN. Autor o ADMIN pueden leer.
  requireSession consulta sesión y cuenta vigentes en la base antes de cada petición: rol, actividad,
  eliminación, bloqueo, revocación y expiración. Ni IDs/roles del body ni la UI conceden permisos.
- Listado filtrado por autor en USER y global en ADMIN. Detalle/acceso ajeno devuelve 404.
  No existe endpoint que liste objetos ni que acepte bucket, ruta, propietario o URL del navegador.
- La clave `service_role` omite RLS en Storage: la autorización de aplicación se hace explícitamente
  en Express antes de firmar o cargar. Nunca se expone esa clave en VITE_* ni en respuestas/logs.

`Backend/storage/001_report_evidence.sql` configura bucket, límite y MIME. Su política
**restrictiva** para PUBLIC niega SELECT/INSERT/UPDATE/DELETE en ese bucket a los roles sujetos
a RLS, incluso ante otra política permisiva global. Conserva el comportamiento de otros buckets.
No crea políticas basadas en auth.uid(): no identifica nuestras sesiones. Los enlaces firmados
permiten lectura como credencial temporal a quien los posea durante su vigencia de 120 segundos;
no son revocación instantánea si el propietario comparte el enlace o cambia el rol de un lector.

## Persistencia y recuperación

La migración `20261021000100_report_evidence` añade `Report.requestId` nullable para conservar
reportes anteriores, UNIQUE por autor/requestId y `ReportEvidence`. Esta última guarda bucket,
ruta interna `ownerUUID/reportUUID/evidenceUUID`, MIME detectado, bytes procesados, propietario,
SHA-256 del archivo recibido, estado y fecha. La FK compuesta exige que propietario = autor;
UNIQUE reportId impide dos evidencias. CHECK restringe bucket/ruta/MIME/tamaño/estados/digest.
RLS y REVOKE aíslan la tabla de Data API; no se persisten URLs firmadas ni nombres del usuario.

1. El formulario genera un requestId por borrador y crea el reporte idempotentemente. Repetir la
   misma entrada devuelve el mismo ID; reutilizar requestId con otro contenido devuelve 409.
2. Si hay selección, la API vuelve a autorizar propiedad y valida/decodifica. Persiste una reserva
   PENDING con UUID del servidor **antes** de contactar Storage.
3. Carga el archivo saneado con `x-upsert: false` y confirma READY. Solo READY permite lectura.
   Un reintento con el mismo digest READY devuelve 204 sin otra carga; otro archivo devuelve 409.
4. Ante fallo, reclama PENDING → DELETING, intenta eliminar por ruta exacta y retira la reserva
   solo tras confirmar el borrado. Un commit READY ambiguo no se elimina por compensación.
5. Si el proceso cae o falla el borrado, la reserva queda en DB. `evidence:cleanup` reclama PENDING
   de más de 15 minutos y reintenta DELETING, con lotes de 100. No elimina READY ni archivos de perfil.
   Ejecutar cada cinco minutos desde un scheduler privado con la misma configuración del backend;
   repetir cuando el lote alcance 100. El repositorio no instala un scheduler remoto.

La UI conserva archivo y requestId para reintentos dentro del formulario, impide doble clic y
confirma éxito solo tras persistir. Si falla la imagen, el reporte ya existe y se indica explícitamente;
un reporte sin archivo es válido. El texto queda fijo al iniciar el envío para conservar idempotencia.
Un rechazo definitivo de imagen permite quitarla/corregirla. La selección tiene preview y eliminación
previa al envío; sus object URLs se liberan al sustituir/salir. No se guarda un archivo en localStorage.
La recarga/cierre avisa sobre cambios; recargar pierde el borrador local y su clave idempotente.
No reenviar el mismo texto como reporte nuevo para recuperar una imagen: conservar el formulario
o adjuntar al ID ya guardado mediante el endpoint autorizado.

Admin reutiliza el visor de Figma implementado (`ReportEvidence`/`AdminDialog`): foco, Escape,
imagen contenida y carga/error/reintento. Sin evidencia no ofrece «Ver imagen»; una reserva pendiente
indica que no está confirmada. Los enlaces solo viven en memoria, se renuevan 15 s antes de vencer
y se vuelven a autorizar en cada renovación/reintento, también con el visor abierto.

## API

Todas las rutas requieren sesión y responden con Cache-Control: no-store y envelopes existentes.
Las mutaciones exigen X-CSRF-Token. Escrituras y firma comparten límite 20/minuto/usuario/proceso,
MemoryStore; para varias instancias se necesita una cuota compartida o protección en el borde.

| Ruta                                   | Entrada / resultado                                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| POST `/api/reports`                    | JSON estricto `{requestId: UUID, description: 1–4000, category: CONTENT/TECHNICAL/OTHER}`; 201 `{data:{report}}`   |
| GET `/api/reports`                     | `page` desde 1, `q` hasta 200, `status` vacío/PENDING/RESOLVED; `{data:{reports,total,page,pages}}`, 30 por página |
| GET `/api/reports/:id`                 | Detalle autorizado; estado/MIME/tamaño de evidencia, sin ruta ni credenciales                                      |
| PUT `/api/reports/:id/evidence`        | Bytes binarios (cliente usa application/octet-stream); 204 tras READY o reintento del mismo archivo                |
| GET `/api/reports/:id/evidence/access` | `{data:{src,expiresAt}}`, enlace de 120 segundos; solo propietario/ADMIN                                           |

Errores: 401 UNAUTHENTICATED; 403 CSRF_INVALID/transporte; 404 REPORT_NOT_FOUND/EVIDENCE_NOT_FOUND;
409 REPORT_REQUEST_CONFLICT/EVIDENCE_EXISTS; 413 PAYLOAD_TOO_LARGE/IMAGE_TOO_LARGE;
422 INVALID_IMAGE; 429 REPORT_RATE_LIMIT/IMAGE_PROCESSING_BUSY;
503 REPORTS_UNAVAILABLE/STORAGE_UNAVAILABLE/EVIDENCE_UPLOAD_FAILED. Sin configuración Storage,
reportes sin adjunto siguen disponibles cuando la migración de aplicación está aplicada.
La creación actual es de reportes generales; no implementa resolución/comentarios ni catálogo educativo.

## Configuración y aplicación deliberada

Variables exclusivas de Backend/.env o del gestor de secretos del servidor:

| Variable                  | Uso                                                                            |
| ------------------------- | ------------------------------------------------------------------------------ |
| DATABASE_URL              | Conexión Prisma runtime ya existente                                           |
| DIRECT_URL                | Conexión Session/direct del mismo proyecto para SQL versionado                 |
| SUPABASE_URL              | Origen HTTPS exacto de la API del **mismo proyecto**, sin slash final ni rutas |
| SUPABASE_SERVICE_ROLE_KEY | Clave privada service_role de ese proyecto; nunca frontend                     |

Ambas variables Storage vacías deshabilitan adjuntos con 503; configuración parcial/inválida impide
arrancar. No se modifica el .env privado existente ni se derivan secretos de DATABASE_URL.
Confirmar que DB, DIRECT_URL y SUPABASE_URL pertenecen al mismo proyecto de desarrollo antes de aplicar.
Revisar las dos migraciones pendientes: `db:migrate` aplica **todas**, incluida AuditLog previa.

Desde PowerShell, después de configurar secretos privadamente y revisar el destino autorizado:

```powershell
pnpm install --frozen-lockfile
pnpm verify
pnpm db:check
# Revisar SQL y destino antes de estas dos escrituras:
pnpm db:migrate
pnpm --filter @vocessilentes/backend evidence:configure
pnpm --filter @vocessilentes/backend evidence:check
# Operación periódica privada:
pnpm --filter @vocessilentes/backend evidence:cleanup
```

El procedimiento Storage es idempotente, no instala extensiones, no modifica fotos de perfil ni
reescribe migraciones aplicadas. Es independiente de Prisma porque storage es administrado por
Supabase y no existe en PostgreSQL genérico/PGlite. Requiere permisos para bucket y políticas;
no cambiar propietarios ni elevar permisos globales para evitar un error. `evidence:check` comprueba
la API, privacidad, tamaño y MIME; **no** certifica carga real, políticas remotas ni identidades.
El máximo global de Storage debe admitir al menos 5 MiB y la API/proxy debe permitir ese cuerpo.

**Vercel:** su límite de cuerpo es 4,5 MB, menor que el máximo de esta API. Para aceptar los 5 MiB
completos usar un host Express/proxy que lo permita. Esta entrega no incorpora subida directa
sin validar a Storage, ni afirma compatibilidad del máximo en Vercel; una futura subida por
cuarentena requiere diseño de validación confiable y promoción antes de ofrecer lectura.

## Evidencia de ejecución y límites

- Preparado: migración de aplicación y procedimiento Storage; no ejecutados en el proyecto remoto.
- Ejecutado localmente: pruebas Sharp, SQL/RLS en PGlite, Express/Prisma/sesiones efímeras y frontend.
  Storage se sustituye explícitamente en pruebas de integración; no equivale a una carga Supabase.
  `pnpm verify` completo: 194 pruebas aprobadas (104 frontend, 39 backend, 51 SQL/auth), lint sin
  advertencias, formato, validación Prisma y build correctos. Ver [verificación](verification.md).
- Comprobado en lectura remota: SELECT 1 correcto; historial contiene únicamente
  `20261009000100_phase_one`. AuditLog y evidencia pendientes. No se insertaron fixtures remotos.
- `evidence:check` falló: faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno local.
  No se afirma que exista el bucket ni que una imagen se haya cargado o abierto remotamente.
- No se ejecutó GitHub Actions, despliegue ni programación remota de limpieza.

Pruebas cubren anónimo, CSRF, otro propietario, ADMIN y degradación, aislamiento de listado,
MIME falso, SVG/GIF/documentos, corrupción, tamaño/dimensiones, idempotencia, compensación/purga,
política restrictiva frente a otra permisiva y renovación/reintento del visor con reloj controlado.
La expiración criptográfica real de un token Supabase y concurrencia multiworker sobre PostgreSQL 17
requieren probar el proyecto configurado. Antes de declarar integración remota, con cuentas propias
de desarrollo: cargar cada formato, abrir como autor/ADMIN, negar otro usuario/anónimo, verificar
que un enlace caduque tras 120 s y que su renovación autorice de nuevo; revisar que no queden reservas
antiguas tras provocar un fallo. No usar los fixtures académicos en la base compartida.

Fuentes oficiales: [buckets privados](https://supabase.com/docs/guides/storage/buckets/fundamentals),
[service keys/RLS](https://supabase.com/docs/guides/storage/security/access-control),
[decodificación y límites Sharp](https://sharp.pixelplumbing.com/api-constructor/),
[Sharp estable](https://github.com/lovell/sharp/releases/tag/v0.35.5) y
[límite Vercel](https://vercel.com/docs/functions/limitations#request-body-size).
