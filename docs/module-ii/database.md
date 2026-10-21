# Base de datos del Día 1

El [modelo existente](../data-model.md) define nueve entidades y sus restricciones.
`Backend/prisma/audit.prisma` añade `AuditLog`: UUID, actor nullable, operación enumerada,
entidad `User`, UUID afectado y fecha `timestamptz(3)`. Hay diez tablas de aplicación.

Un User tiene sesiones, identidades, progreso, reportes y eventos como actor. Módulos contienen
lecciones y ejercicios compartidos. El progreso relaciona usuario/contenido sin duplicarlo.
La eliminación lógica conserva esas relaciones y los identificadores únicos quedan reservados.

AuditLog referencia al actor mediante FK RESTRICT/CASCADE. El actor eliminado lógicamente sigue
disponible; una futura retención deberá acordar anonimización explícita del actor antes de purgarlo.
`entityId` es UUID sin FK: conserva el identificador histórico aunque una purga futura autorizada
retire la entidad. No hay cascadas de borrado ni snapshots de información personal. No se necesitan
metadatos para estas tres operaciones y por ello no se añade un campo JSON abierto.

## Estructura SQL

`sql/01_schema.sql` es **autónomo**, una copia ordenada de las migraciones versionadas,
incluida `20261020000100_admin_audit`. Conserva enums, defaults, PK, FK, índices, CHECK,
revocaciones y RLS. Requiere una base PostgreSQL limpia/aislada y un propietario con permisos DDL.
No crea roles de proveedores ni instala extensiones; los roles existentes se protegen si existen.
No genera `_prisma_migrations`. No aplicar después `migrate deploy` sobre este snapshot:
para una base administrada por Prisma, aplicar las migraciones **en otra base limpia**.
El archivo contiene transacciones por migración: no es una única transacción global.

En un destino privado de desarrollo ya administrado por Prisma, revisar primero la nueva migración,
permisos y destino; seguir [migraciones](../migrations.md). Aquí no se ejecuta ese despliegue.

## Inserción y reproducción

Desde la raíz, con dependencias instaladas, validar sin URLs ni base compartida:

```powershell
pnpm db:generate
pnpm db:test
```

La prueba `Backend/tests/database/module-ii-sql.test.js` ejecuta ambos archivos en una nueva PGlite,
comprueba recuentos, hashes Argon2id válidos, cuentas inactivas, sesiones inutilizables y rechazo
de una segunda inserción. No carga `.env` ni persiste datos fuera de la memoria.

Para revisión manual en PostgreSQL local aislado, con `psql` y conexión privada configurada
mediante sus mecanismos de entorno (sin contraseñas en argumentos/logs):

```powershell
psql -X -v ON_ERROR_STOP=1 -f docs/module-ii/sql/01_schema.sql
psql -X -v ON_ERROR_STOP=1 -f docs/module-ii/sql/02_seed.sql
```

Comprobar el destino antes de ejecutarlos. El seed exige tablas de aplicación vacías y usa una
transacción; no hace DELETE, TRUNCATE ni sobrescribe registros. Insertar después del esquema,
nunca en la base compartida. `psql` manual no se ejecutó en esta entrega.

El auxiliar `node Backend/scripts/prepare-module-ii-sql.js` regenera el snapshot y renueva únicamente
el bloque de credenciales sintéticas del seed. Usa el servicio Argon2id del proyecto y contraseñas
aleatorias de 32 bytes descartadas; genera hashes SHA-256 de tokens criptográficos de 32 bytes y
descarta los originales. No imprime credenciales, lee `.env` ni se conecta a PostgreSQL.
Las cinco sesiones están además revocadas y vencidas desde enero de 2026. No reactivar estas cuentas.
Regenerar solo si cambia el historial SQL o se necesita renovar los fixtures; volver a probar después.

## Cinco registros y excepción

La consulta UNION ALL al final del seed informa todas las tablas:

| Tabla                             | Filas esperadas | Procedencia                                                            |
| --------------------------------- | --------------- | ---------------------------------------------------------------------- |
| User                              | 5               | Cuentas sintéticas inactivas, dominio `example.invalid`                |
| Session                           | 5               | Revocadas y vencidas; no autentican                                    |
| Module / Lesson / Exercise        | 5 cada una      | Borradores de prueba, sin recursos LSV validados                       |
| LessonProgress / ExerciseProgress | 5 cada una      | Estado NOT_STARTED coherente                                           |
| Report                            | 5               | Reportes pendientes sintéticos ligados a módulos                       |
| AuditLog                          | 5               | Inserciones académicas sintéticas; no actividad real de personas       |
| ExternalIdentity                  | **0**           | Excepción: no existe OAuth/verificación autorizada de sujetos externos |

Crear cinco identidades externas requiere implementar vinculación verificable con proveedores;
no se debe resolver mediante sujetos falsos. La excepción debe acompañar la evidencia académica.
El seed no implica que existan endpoints educativos o reportes funcionales. Las pruebas de
integridad y permisos aplican las migraciones en memoria; resultados en [pruebas](day-01-testing.md).
