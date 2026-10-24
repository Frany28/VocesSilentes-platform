# Entrega final del Módulo II — 23 de octubre de 2026

**Paquete actualizado:** la entrega actual incluye dashboard, estado, perfiles, contraseña, fotos
y conexión TLS; sus controles suman 218 pruebas. `pnpm academic:package` reconstruye la carpeta
de Franciely y el ZIP con código actual y documentación de instalación/API.
[Selección y validación de archivos](package-delivery.md). El informe siguiente conserva el estado
de la primera entrega de 206 pruebas como registro histórico.

**Actualización posterior:** por solicitud del usuario ya se aplicó la migración pendiente y se
importaron los 50 registros académicos en Supabase de desarrollo, conservando los datos existentes.
Ver [resultado de la carga remota](supabase-import.md). El informe siguiente documenta la entrega
aislada original; sus límites de no escritura remota corresponden a aquella ejecución.

Se conservan React/Tailwind, Express, Prisma 7.10.0, PostgreSQL y S3 existente. No se reescribe el
CRUD de usuarios ni se rediseñan pantallas. La nueva migración se prueba únicamente en PostgreSQL
aislado; no se aplica a Supabase compartido ni a producción.

## Formularios auditados

| Área / formulario                 | Estado final                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| Registro público                  | User + Session + USER_REGISTERED atómicos, Argon2id y validaciones existentes         |
| Alta administrativa               | CRUD conservado; cinco altas reales desde el modal en la prueba de navegador          |
| Listado / consulta de usuarios    | Paginación, búsqueda, UUID, recarga y datos reales                                    |
| Edición / perfil ADMIN            | PATCH existente, permisos y bitácora; respuesta y recarga comprobadas                 |
| Eliminación de usuario            | Borrado lógico, revocación de sesiones y protección del último ADMIN                  |
| Reporte Student                   | POST idempotente y adjunto opcional; cinco envíos desde el formulario                 |
| Reportes Admin / evidencia        | Lista, detalle y visor autorizado; cinco PNG reales en almacenamiento local de prueba |
| Resolución / reapertura           | PATCH ADMIN conectado al formulario y confirmación; comentario y auditoría atómicos   |
| Catálogo / lecciones / ejercicios | Contenido publicado y progreso propio consultados desde PostgreSQL                    |
| Lectura / práctica manual         | Avance propio guardado con bitácora; estado conservado tras recarga                   |
| Bitácora Admin                    | Consulta paginada real en `/admin/audit` con los componentes existentes               |
| Perfil USER / foto / contraseña   | Presentación conservada; sus servicios de escritura siguen pendientes                 |

No existen formularios ADMIN de edición/publicación de Module/Lesson/Exercise. No se crea un CMS
nuevo: el alcance académico se cubre con contenido SQL reconstruible, consulta y progreso desde
Practicar. COMPLETED expresa lectura/práctica **declarada por el alumno**; no acredita dominio de LSV
ni evaluación de cámara. Los textos del catálogo están identificados como fixtures académicos.
La API real es el valor predeterminado también en desarrollo. `VITE_STUDENT_DEMO=true` conserva
únicamente la demo visual explícita; no se usa en la demostración académica ni en la prueba UI.

## Contratos y reglas

| Ruta                                       | Permiso y entrada                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------- |
| PATCH `/api/reports/:id/status`            | ADMIN + CSRF; `{status: PENDING/RESOLVED, internalComment?: string hasta 2000}` |
| GET `/api/learning`                        | USER; publicaciones y progreso de `req.auth.id`                                 |
| PUT `/api/learning/lessons/:id/progress`   | USER + CSRF; `{status: IN_PROGRESS/COMPLETED}`                                  |
| PUT `/api/learning/exercises/:id/progress` | USER + CSRF; mismo contrato de actividad manual                                 |
| GET `/api/admin/audit-logs`                | ADMIN; contrato paginado existente, ahora consumido desde la UI                 |

Zod rechaza campos extra; el actor se deriva de la sesión y se revalida bajo bloqueo antes de
escribir. Estado, fechas y bitácora comparten transacción. Resolver guarda ADMIN/fecha/comentario;
reabrir limpia ADMIN/fecha de resolución. Un reintento idéntico no duplica eventos; modificar el
comentario sobre el mismo estado devuelve 409. Cerrar un reporte significa resolverlo: no hay borrado
físico de reportes/evidencias. El progreso completado no retrocede al abrirlo desde otra pestaña.
Los comentarios internos solo se proyectan a ADMIN. Se conservan envelopes, AbortSignal y errores.

La lista de reportes agrupa lecturas secuenciales en RepeatableRead, conservando página/recuento
coherentes y evitando queries paralelas sobre un único Client pg. La migración
`20261023000100_module_ii_operations` amplía AuditOperation y su CHECK por entidad. El CHECK compara
texto para definir la restricción antes del commit que habilita los valores enum nuevos;
[regla de ALTER TYPE](https://www.postgresql.org/docs/17/sql-altertype.html).

## Cinco registros por tabla

| Tabla                             |       Seed | Procedencia                                                                           |
| --------------------------------- | ---------: | ------------------------------------------------------------------------------------- |
| User                              |          5 | Un ADMIN y cuatro USER; activos exclusivamente para la demostración aislada; Argon2id |
| Session                           |          5 | Revocadas y vencidas, tokens originales descartados                                   |
| ExternalIdentity                  |          5 | Prefijo `academic-fixture:not-an-oauth-subject:`; sin OAuth ni sujetos verificados    |
| Module / Lesson / Exercise        | 5 cada una | Contenido académico sintético identificado; sin vídeos inexistentes                   |
| LessonProgress / ExerciseProgress | 5 cada una | Relaciones válidas, NOT_STARTED y fechas nulas                                        |
| Report                            |          5 | Categorías coherentes; cuatro pendientes y una resolución sintética con ADMIN/fecha   |
| AuditLog                          |          5 | Eventos sintéticos del seed identificados por actor nulo                              |
| ReportEvidence                    |      **0** | Excepción: un SQL autónomo no entrega objetos S3 ni credenciales de un bucket         |

Son **50 filas en diez tablas y una excepción**; `_prisma_migrations` es interna y no se rellena.
No se insertan evidencias READY ni reservas falsas. La prueba UI crea cinco imágenes en una base
distinta usando un sustituto local explícito de Storage, **no S3 remoto**. No se ha vuelto a escribir
en el proveedor remoto como parte de esta entrega. ExternalIdentity solo prueba relaciones y únicos;
los identificadores sintéticos no autentican porque no existe un flujo OAuth.

SQL definitivos: `docs/module-ii/sql/01_schema.sql`, `02_seed.sql`, `03_verificacion.sql`.
El esquema copia exactamente las migraciones. El seed exige las once tablas vacías y usa una
transacción; repetirlo se rechaza sin borrar filas. Las verificaciones son de solo lectura.
`pnpm academic:prepare` regenera estructura y hashes con sales nuevas desde la plantilla versionada.

## Persistencia y pruebas reales

`pnpm academic:verify` inicia otra base **sin seed**, Express y PrismaPg por TCP, y conduce Chrome:

1. Provisiona un operador inicial aparte de los registros evaluados. Crea cinco usuarios desde el
   modal, los encuentra en dos páginas, edita uno y elimina lógicamente otro.
2. Uno de esos USER envía cinco reportes y cinco PNG desde el formulario. Admin abre el visor,
   resuelve con comentario, recarga y reabre; los bytes permanecen en el fixture local de Storage.
3. Registra inicio/finalización de lectura y práctica manual desde la UI y confirma SQL tras recarga.
   El contenido inicial se prepara como fixture de integración, no mediante un CMS inexistente.
4. Consulta **24 eventos en cinco páginas** de bitácora: registro, CRUD de usuarios, creación de
   reportes, confirmación de imágenes, resolución/reapertura y ambas operaciones de progreso.
5. Revisa **40 combinaciones** de cinco vistas, dos temas y cuatro viewports: 1440×960, 834×1100,
   390×920 y 320×620; sin desbordamiento horizontal ni llamadas a la cámara.

Los tests HTTP adicionales comprueban 401/403, CSRF, campos privilegiados, privacidad, reintentos,
publicación y separación entre usuarios. Fallos SQL deliberados de bitácora revierten creación,
resolución y progreso. Otra prueba reconstruye los SQL y autentica las credenciales públicas del seed.
Los eventos guardan actor, operación, entidad/ID y fecha, sin contraseñas, tokens ni comentarios internos.

`pnpm verify` ejecuta lint, formato, Vitest, backend, Prisma, build e integración SQL/auth.
La ejecución final terminó con código **0**: **107 frontend + 43 backend + 56 SQL/auth = 206 pruebas
aprobadas**, lint sin advertencias, formato, validación Prisma y build correctos. La comprobación
completa de formularios en Chrome también terminó con código **0**.
Las evidencias del navegador están en `.local/module-ii-review/`; el ZIP copia resultados/capturas
sin perfiles Chrome. Las pruebas de S3 existentes usan SDK real y transporte HTTP local controlado;
el sustituto de la demo no acredita disponibilidad remota. PostgreSQL WASM no acredita PostgreSQL 17
nativo ni concurrencia multiworker. No se ejecutan GitHub Actions, despliegues ni migraciones compartidas.

## Paquete y pendientes

`entrega-modulo-ii/` contiene README, TXT, los tres SQL y pruebas. `pnpm academic:package` genera
`VocesSilentes-Modulo-II.zip`, incluye código y recursos usados, excluye secretos/dependencias/generados
y comprueba el límite de **10 000 000 bytes**. El staging es nuevo y está dentro de `.local/`.
Nombre, apellido, cédula y enlace publicado quedan **POR COMPLETAR**, porque no se proporcionaron.
Las credenciales del TXT son públicas y exclusivas de `pnpm academic:demo`; no son cuentas reales.

Quedan fuera: CMS de contenido, OAuth, foto persistente, cambio de contraseña y reconocimiento LSV.
La migración nueva requiere revisión/aplicación posterior en un destino de desarrollo autorizado
antes de desplegar el código. No se ha aplicado a Supabase compartido.
