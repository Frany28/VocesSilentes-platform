# Implementación del Día 1

Rama `module-ii/day-01`. Se completa el CRUD administrativo existente y se conserva auth,
transporte, CSRF, DTO, rutas previas y manejo central de errores. No se añaden dependencias.
La [auditoría inicial](day-01-audit.md) documenta las funciones reutilizadas.

## Endpoints añadidos

| Método y ruta                 | Resultado                                                                                                |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| GET `/api/admin/users`        | PostgreSQL real, búsqueda por nombre/apellido/username/correo, rol, paginación y exclusión de eliminados |
| DELETE `/api/admin/users/:id` | Eliminación lógica, revocación de sesiones y bitácora atómicas                                           |
| GET `/api/admin/audit-logs`   | Consulta cronológica descendente y paginada, exclusivamente ADMIN                                        |

Los contratos, DTO, límites y códigos están en [API](../api.md), sin duplicar sus tablas.
Crear, consultar UUID y editar mantienen rutas y respuestas. Todas las rutas administrativas
comprueban sesión y rol; las mutaciones exigen CSRF. El cambio del punto de montaje interno a
`/api/admin` permite la consulta de bitácora sin alterar las URLs de usuarios existentes.

## Reglas y consistencia

- Zod valida queries estrictas, enteros positivos acotados, q de hasta 100 caracteres y rol enumerado.
  La consulta usa proyección permitida, sin recuperar hashes ni sesiones; total y página comparten
  instantánea RepeatableRead y orden estable por fecha/UUID. Las páginas fuera de rango están vacías.
- Se reutilizan identidad, normalización, validación de contraseñas, Argon2id y conflictos UNIQUE.
  No se modifica la política del registro público ni se libera email/username de cuentas eliminadas.
- El advisory lock administrativo y los bloqueos de actor/cuenta se conservan. Las escrituras
  revalidan al actor tras esperar el bloqueo. Tanto degradar como eliminar al último ADMIN activo
  devuelve 409 LAST_ACTIVE_ADMIN. Una cuenta ya eliminada devuelve 409 USER_DELETED.
- La eliminación marca isDeleted/deletedAt, revoca todas sus sesiones no revocadas y conserva
  los datos relacionados. El bloqueo de fila se comparte con finalizeLogin: una emisión de sesión
  previa queda revocada; una posterior vuelve a leer el estado eliminado y se rechaza.
- USER_CREATED/USER_UPDATED/USER_DELETED se generan en backend usando el actor autenticado y
  el UUID confirmado. No se acepta una operación/actor del frontend ni se guardan valores sensibles.
  Si AuditLog falla, toda la transacción revierte, incluida la revocación. Errores y conflictos
  no generan eventos de éxito. Las operaciones públicas de auth y SQL manual no se auditan aquí.
- El historial no tiene endpoints de mutación; USER recibe 403. RLS sin políticas y revocaciones
  impiden acceso directo mediante roles Data API. Un propietario SQL privilegiado sigue pudiendo
  administrar tablas: no se afirma almacenamiento inmutable frente al operador de base de datos.

## Frontend

Se reutilizan panel, controles, estilos y diálogo de confirmación existentes. La lista consulta
solo el servidor y mantiene q/filter/page en URL; presenta carga, error, vacío y reintento.
Las lecturas obsoletas se abortan y descartan. Las demos del resumen/reportes siguen identificadas.
Se retira la caché de UUIDs conocidos: el censo ya no depende del navegador. Claves antiguas se ignoran.

La eliminación exige confirmación, bloquea doble envío y permite corregir/reintentar ante error.
Solo muestra éxito tras respuesta confirmada; refresca auth si se elimina la propia cuenta.
Las cuentas eliminadas no ofrecen editar/eliminar de nuevo. No implementa restauración ni isActive.
El cliente HTTP conserva rutas restringidas y añade `options.query` URLSearchParams codificado;
preserva cookies, errores y AbortSignal y no pasa query a fetch como opción desconocida.

## Archivos creados y modificados

Persistencia:

- Creados `Backend/prisma/audit.prisma` y
  `Backend/prisma/migrations/20261020000100_admin_audit/migration.sql`.
- Modificado `Backend/prisma/accounts.prisma` para la relación inversa del actor.
- Creados `Backend/scripts/prepare-module-ii-sql.js`, `docs/module-ii/sql/01_schema.sql`
  y `docs/module-ii/sql/02_seed.sql`. Procedimiento y excepción de identidades: [database.md](database.md).

Backend:

- Creados `Backend/src/modules/admin/users.read.repository.js`,
  `Backend/src/modules/admin/users.policy.js` y `Backend/src/modules/admin/users.deletion.js`.
- Modificados `Backend/src/app.js`, `Backend/src/modules/admin/users.routes.js`,
  `Backend/src/modules/admin/users.controller.js`, `Backend/src/modules/admin/users.service.js`,
  `Backend/src/modules/admin/users.repository.js` y `Backend/src/modules/admin/users.validation.js`.

Frontend:

- Creados `Frontend/src/features/admin/data/use-users-list.js`,
  `Frontend/src/features/admin/data/use-user-delete.js`,
  `Frontend/src/features/admin/components/UserLookup.jsx` y
  `Frontend/src/features/admin/components/UserDeleteAction.jsx`.
- Modificados `Frontend/src/features/admin/pages/AdminUsers.jsx`,
  `Frontend/src/features/admin/pages/AdminUserDetail.jsx`,
  `Frontend/src/features/admin/data/AdminProvider.jsx`,
  `Frontend/src/features/admin/data/users.api.js`,
  `Frontend/src/features/admin/forms/use-user-submit.js` y `Frontend/src/lib/http.js`.
- Retirados `Frontend/src/features/admin/data/known-users.js` y
  `Frontend/src/features/admin/data/use-known-users.js`, sin usos tras conectar el listado.

Pruebas y documentación:

- Creadas `Backend/tests/auth/admin-day-one.test.js`, `Backend/tests/auth/admin-deletion.test.js`,
  `Backend/tests/auth/admin-deletion-invariant.test.js`, `Backend/tests/auth/admin-audit.test.js`,
  `Backend/tests/database/audit.test.js` y `Backend/tests/database/module-ii-sql.test.js`.
- Modificadas `Backend/tests/auth/admin-users.test.js`, `Backend/tests/auth/admin-validation.test.js`,
  `Backend/tests/database/security.test.js`,
  `Frontend/src/test/admin-fixture.jsx`, `Frontend/src/test/admin-create.test.jsx`
  y `Frontend/src/test/admin-navigation.test.jsx`.
- Creadas `Frontend/src/test/admin-list.test.jsx`, `Frontend/src/test/admin-delete.test.jsx`
  y `Frontend/src/test/http-query.test.js`; retirada `Frontend/src/test/admin-known-users.test.jsx`.
- Creados los seis Markdown de `docs/module-ii/`; actualizados `README.md`, `docs/admin.md`,
  `docs/api.md`, `docs/architecture.md`, `docs/authentication.md`, `docs/data-model.md`, `docs/development.md`,
  `docs/migrations.md` y `docs/verification.md` para reflejar contratos y resultados.

No se edita la migración aplicada, generated/, `.env`, autenticación ni datos de Supabase.
La excepción de tamaño es solo el snapshot SQL completo, documentada en desarrollo y junto al archivo.
Las pruebas nuevas se separan por contratos de listado/permisos, eliminación, concurrencia y bitácora.
