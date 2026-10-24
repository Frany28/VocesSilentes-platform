# Evidencias de reportes

Actualización del 23 de octubre: PATCH `/api/reports/:id/status` permite resolver/reabrir a ADMIN,
con comentario privado, metadatos y bitácora atómicos. Confirmar READY añade REPORT_EVIDENCE_ATTACHED
en la misma transacción; un fallo de auditoría conserva la recuperación/compensación existente.
La [entrega académica](module-ii/final-delivery.md) prueba cinco imágenes en Storage local sustituido
explícitamente, no en Supabase; no se repite la carga remota histórica como parte de esta tarea.

Implementación del 21 de octubre de 2026. El flujo usa las sesiones opacas propias de
VocesSilentes (`User`/`Session`), **no Supabase Auth**. Reutiliza DATABASE_URL/Prisma,
requireSession, transporte HTTPS, CSRF firmado y el cliente HTTP compartido.
Reutiliza las claves S3 existentes mediante los SDK oficiales AWS, sin requerir service_role REST.

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
- Las claves S3 administrativas omiten RLS: la autorización se hace explícitamente en Express antes
  de firmar o cargar. El secreto nunca llega a VITE_*, respuestas ni logs. Las firmas SigV4 de lectura
  incluyen el identificador de acceso y una firma temporal, nunca el secreto que la genera.

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
3. Consulta HEAD y carga el archivo saneado por S3; confirma READY. Solo READY permite lectura.
   Un reintento con el mismo digest READY devuelve 204 sin otra carga; otro archivo devuelve 409.
   La reserva única de DB y los UUID del servidor excluyen dos escritores de la misma ruta.
   S3 recibe `If-None-Match: *` como defensa adicional, pero no se presume que Supabase lo aplique
   atómicamente en PutObject: su implementación documentada realiza upsert. No hay subida directa
   desde el cliente ni reutilización de rutas. HEAD rechaza un archivo preexistente sin borrarlo
   en la compensación, y un HEAD fallido distinto de 404 no permite iniciar PUT.
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

| Variable             | Uso                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| DATABASE_URL         | Conexión Prisma runtime ya existente                                                            |
| DIRECT_URL           | Conexión Session/direct del mismo proyecto para SQL versionado y comprobación de políticas      |
| S3_ENDPOINT          | Endpoint HTTPS de Supabase terminado en `/storage/v1/s3`, copiado de Storage → S3 Configuration |
| S3_REGION            | Región indicada en esa misma configuración                                                      |
| s3_access_key_id     | Identificador S3 existente, conservando su nombre en minúsculas                                 |
| s3_secret_access_key | Secreto S3 existente, exclusivo del servidor                                                    |
| S3_BUCKET_NAME       | Bucket general anterior; **no cambia** el destino de evidencias, siempre `report-evidence`      |

Sin variables de conexión S3 se deshabilitan adjuntos con 503; configuración parcial/inválida impide
arrancar. No se modifica el .env privado existente ni se derivan secretos de DATABASE_URL.
Se comprueba que el endpoint sea de Supabase, sin credenciales/query y del mismo proyecto que las
URLs PostgreSQL de Supabase cuando se puede extraer su referencia. El SDK usa credenciales explícitas,
path-style, un intento, timeout 20 s y cálculo de checksum solo cuando se exige; se cierra al salir
del servidor/CLI. No necesita SUPABASE_URL ni SUPABASE_SERVICE_ROLE_KEY.
`db:migrate` aplica todas las migraciones pendientes; AuditLog y evidencia ya se aplicaron en desarrollo.

Desde PowerShell, después de configurar secretos privadamente y revisar el destino autorizado:

```powershell
pnpm install --frozen-lockfile
pnpm verify
pnpm db:check
# Revisar SQL y destino antes de estas dos escrituras:
pnpm db:migrate
pnpm --filter @vocessilentes/backend evidence:configure
pnpm --filter @vocessilentes/backend evidence:check
# Prueba remota explícita: sube y elimina tres imágenes temporales, sin filas de aplicación:
pnpm --filter @vocessilentes/backend evidence:probe
# Operación periódica privada:
pnpm --filter @vocessilentes/backend evidence:cleanup
```

El procedimiento Storage es idempotente, no instala extensiones, no modifica fotos de perfil ni
reescribe migraciones aplicadas. Es independiente de Prisma porque storage es administrado por
Supabase y no existe en PostgreSQL genérico/PGlite. Requiere permisos para bucket y políticas;
no cambiar propietarios ni elevar permisos globales para evitar un error. `evidence:check` comprueba
S3 HeadBucket y, por SQL, privacidad, tamaño, MIME, RLS y la política restrictiva exacta;
no certifica por sí solo carga real ni identidades. `evidence:probe` verifica carga/lectura exacta de
JPEG/PNG/WEBP, rechazo de reemplazo, GET/listado anónimo denegados, firma vencida rechazada y firma
renovada válida. La firma vencida se genera con fecha de emisión 125 s anterior y TTL 120 s;
no se simula el rechazo del proveedor ni se espera un temporizador del navegador.
Registra primero las rutas en `.local/evidence-s3-probe.json` (sin secretos/URLs firmadas), elimina
los tres objetos incluso ante fallo y retira el registro al confirmar borrado. Si el proceso muere
o falla el borrado, conservar ese registro y retirar únicamente sus rutas por S3 antes de repetir;
el archivo existente bloquea otra prueba para evitar perder el seguimiento. No crea cuentas/reportes.
El máximo global de Storage debe admitir al menos 5 MiB y la API/proxy debe permitir ese cuerpo.

**Vercel:** su límite de cuerpo es 4,5 MB, menor que el máximo de esta API. Para aceptar los 5 MiB
completos usar un host Express/proxy que lo permita. Esta entrega no incorpora subida directa
sin validar a Storage, ni afirma compatibilidad del máximo en Vercel; una futura subida por
cuarentena requiere diseño de validación confiable y promoción antes de ofrecer lectura.

## Evidencia de ejecución y límites

- Aplicado en Supabase de desarrollo: migraciones AuditLog y ReportEvidence mediante Prisma deploy,
  más procedimiento versionado de bucket/política. La inspección previa confirmó el mismo proyecto
  para endpoint S3 y PostgreSQL; no se insertaron fixtures ni cuentas/reportes de prueba remotos.
- Comprobado remotamente: `evidence:check` correcto; `evidence:probe` correcto en los tres formatos,
  incluidos rechazo anónimo, sobrescritura y firma vencida. Los objetos temporales se eliminaron.
- Localmente se prueban Sharp, SQL/RLS en PGlite, Express/Prisma/sesiones efímeras, firma SigV4,
  transporte HTTP S3 en loopback y frontend. `pnpm verify` completo pasó con 198 pruebas
  (104 frontend, 43 backend, 51 SQL/auth), lint sin advertencias, Prisma y build correctos.
  Resultados completos en [verificación](verification.md).
- La prueba remota de Storage no es una prueba de la UI desplegada ni login de usuarios remotos.
  No se ejecutó GitHub Actions, despliegue ni programación remota de limpieza.

Pruebas cubren anónimo, CSRF, otro propietario, ADMIN y degradación, aislamiento de listado,
MIME falso, SVG/GIF/documentos, corrupción, tamaño/dimensiones, idempotencia, compensación/purga,
política restrictiva frente a otra permisiva y renovación/reintento del visor con reloj controlado.
La concurrencia multiworker sobre PostgreSQL 17 y la navegación desplegada requieren comprobación
adicional con cuentas propias: adjuntar desde Student, abrir como autor/ADMIN y negar otro usuario.
La autorización de esas sesiones se prueba localmente con persistencia efímera real y no se sustituye
por permisos S3. No usar los fixtures académicos en la base compartida.

Fuentes oficiales: [buckets privados](https://supabase.com/docs/guides/storage/buckets/fundamentals),
[service keys/RLS](https://supabase.com/docs/guides/storage/security/access-control),
[autenticación S3](https://supabase.com/docs/guides/storage/s3/authentication),
[compatibilidad S3](https://supabase.com/docs/guides/storage/s3/compatibility),
[decodificación y límites Sharp](https://sharp.pixelplumbing.com/api-constructor/),
[Sharp estable](https://github.com/lovell/sharp/releases/tag/v0.35.5) y
[límite Vercel](https://vercel.com/docs/functions/limitations#request-body-size).

## Presentación Student actualizada — 22 de octubre

ReportForm reutiliza Input/Select/Button compactos y muestra título, tipo, ubicación y descripción,
además de selección, previsualización y eliminación local de evidencia. El título (120 caracteres) y
ubicación opcional (160) se conservan dentro de description junto al detalle (3600), verificando el
límite conjunto de 4000. La API y las categorías TECHNICAL/CONTENT/OTHER no cambian; no se requiere
migración para esta presentación. El requestId permanece durante el reintento; Crear otro reporte
genera un borrador nuevo únicamente tras éxito confirmado. Los errores no eliminan el archivo elegido.
Esta revisión visual no reaplica migraciones ni vuelve a ejecutar pruebas contra el Storage remoto.
Fotos de perfil permanecen en features/account/photo y no escriben en report-evidence.
