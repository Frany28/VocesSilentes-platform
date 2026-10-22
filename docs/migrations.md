# Migraciones de la fase 1

Nueva migración: `20261021000100_report_evidence`, aditiva sobre Report y nueva tabla
ReportEvidence con restricciones, RLS y revocaciones. El bucket/política del proveedor tienen su
procedimiento separado `Backend/storage/001_report_evidence.sql`; no forman parte del esquema Prisma.
El 21 de octubre se aplicaron AuditLog y ReportEvidence mediante `migrate deploy` en el proyecto
Supabase de desarrollo, después de revisar SQL y destino. El procedimiento de bucket también se
aplicó y su política se comprobó por catálogo. Ver [pasos y comprobaciones](report-evidence.md).

Prisma **7.10.0** es la única fuente de migraciones de aplicación. No ejecutar `db push`,
`migrate reset` ni editar `_prisma_migrations` para resolver errores. No usar el SQL Editor
de Supabase para introducir una segunda fuente de cambios. No se ejecutan migraciones al arrancar Express.

## Conexiones privadas

`Backend/.env.example` contiene los nombres sin valores reales. Nunca imprimir URLs ni credenciales.

| Variable            | Uso                                                                               |
| ------------------- | --------------------------------------------------------------------------------- |
| DATABASE_URL        | Backend/PrismaPg y `db:check`; puede usar Transaction 6543 en Supabase            |
| DIRECT_URL          | CLI Prisma y `db:inspect`; Session 5432 en Supabase o conexión directa compatible |
| SHADOW_DATABASE_URL | Opcional, exclusivamente base independiente y descartable para `migrate dev`      |

Prisma 7 usa `datasource.url` en `prisma.config.js`, **no** el campo `directUrl` de versiones anteriores.
La CLI toma DIRECT_URL, sin fallback a DATABASE_URL. Validación/generación/diff desde vacío funcionan
sin ninguna URL. Se rechaza puerto 6543 y `pgbouncer=true` para conexiones CLI. Se fuerza el esquema
`vocessilentes` en la URL CLI, incluyendo el historial Prisma. El adaptador runtime fija el mismo esquema
sin cambiar DATABASE_URL ni los archivos `.env` privados existentes.

`migration-config.js` rechaza una shadow del mismo destino aunque cambien schema, credenciales o
Session/direct en Supabase. Es una defensa adicional, no una prueba universal de independencia:
alias DNS/proxies arbitrarios pueden apuntar al mismo servidor. Verificar siempre servidores y bases
antes de utilizar shadow; DATABASE_URL de runtime nunca puede ser la shadow del proyecto.

## Migración inicial sin shadow

Se inspeccionaron tablas e historial **en lectura**. Antes de migrar no había tablas de aplicación
en public ni vocessilentes ni `_prisma_migrations`; los esquemas internos Supabase se preservan.
El usuario confirmó explícitamente que el destino era la base de desarrollo de este proyecto.
DIRECT_URL Session y DATABASE_URL Transaction tenían el mismo host, usuario y base (sin publicar valores).

El flujo usado separa generación, revisión y aplicación. Para reproducir la generación **solo en un
checkout anterior a la migración y con un destino vacío confirmado**, desde PowerShell en la raíz:

```powershell
New-Item -ItemType Directory -Path Backend/prisma/migrations/20261009000100_phase_one
pnpm --filter @vocessilentes/backend exec prisma migrate diff --from-empty --to-schema prisma --script --output prisma/migrations/20261009000100_phase_one/migration.sql
```

No volver a generar ni sobrescribir ese archivo después de aplicarlo. Prisma generó tablas, enums,
índices y FK; se añadieron CHECK, transacción explícita, search_path local, revocación de permisos y RLS.
`migration_lock.toml` fija postgresql. Revisar siempre el archivo SQL completo: `diff` no modela
CHECK, permisos ni RLS, y validación de PSL no garantiza esas reglas.

Antes de aplicar SQL pendiente en una base de desarrollo autorizada:

```powershell
pnpm db:inspect
pnpm db:validate
pnpm db:generate
pnpm db:test
Get-Content Backend/prisma/migrations/20261009000100_phase_one/migration.sql
pnpm db:migrate
pnpm db:status
pnpm db:check
```

`db:migrate` ahora es **migrate deploy**: aplica archivos SQL revisados y registra historial sin
shadow ni reset. No genera nuevos archivos, no comprueba drift ni regenera el cliente.
Tiene que existir DIRECT_URL Session/direct válida y autorización sobre el destino; el comando
por sí solo no certifica que sea desarrollo. En esta entrega la migración inicial es aditiva:
nueve tablas, siete enums, índices y restricciones en el esquema nuevo. No inserta usuarios ni contenido.
Los REVOKE solo restringen acceso a la aplicación nueva; no afectan auth/storage ni otras tablas.

## Cambios siguientes

El Día 1 del Módulo II añade `20261020000100_admin_audit`: enum AuditOperation y tabla AuditLog,
FK de actor RESTRICT/CASCADE, tres índices, CHECK de entidad, RLS y revocaciones de Data API.
Es aditiva, no altera ni reescribe la migración inicial y no inserta datos. Se preparó mediante
SQL revisado contra el modelo Prisma y se verifica en PostgreSQL WASM aislado. Se aplicó a
Supabase de desarrollo el 21 de octubre junto con evidencia; no inserta fixtures ni usuarios.
Los [scripts académicos](module-ii/database.md) son para bases limpias aisladas, no para actualizar
una base compartida ni el historial Prisma.

Con base de desarrollo y shadow independiente autorizadas puede usarse:

```powershell
pnpm db:migrate:dev --name change_name --create-only
```

`migrate dev` necesita permisos para crear una shadow si no se configura una. En Supabase no asumir
esos permisos; la shadow explícita debe ser otro destino. Si el comando propone reset, detenerse y
revisar drift/historial, nunca aceptarlo para resolver un conflicto. Revisar el SQL y añadir reglas
que Prisma no expresa antes de `db:migrate`; generar luego el cliente y ejecutar verify.

Sin shadow, tras revisar destino, historial y cambios anteriores, generar un **archivo nuevo**:

```powershell
New-Item -ItemType Directory -Path Backend/prisma/migrations/YYYYMMDDHHMMSS_change_name
pnpm --filter @vocessilentes/backend exec prisma migrate diff --from-config-datasource --to-schema prisma --script --output prisma/migrations/YYYYMMDDHHMMSS_change_name/migration.sql
```

El comando lee la base configurada y genera SQL; no lo aplica. No generar desde vacío si ya existen
tablas. Revisar FK, efectos en datos, enums, CHECK, permisos y RLS; ejecutar pruebas aisladas antes
de deploy. Una base con tablas preexistentes sin historial requiere un baseline deliberado,
no tratarla como vacía. Las migraciones ya aplicadas son inmutables.

## Integración aislada y sus límites

`pnpm db:test` usa **PGlite 0.5.8**, PostgreSQL **18.3** compilado a WASM, exclusivamente en memoria.
No lee `.env`, no usa URLs y no puede escribir en Supabase. Ejecuta el SQL de todas las migraciones
versionadas en orden y crea fixtures sintéticos solo dentro de ese entorno efímero. Los escenarios
se revierten y el motor se cierra al terminar; `--test-concurrency=1` limita consumo de memoria.
Los fixtures contienen hashes y señas de prueba, sin validez para autenticación ni contenido real.

Estas pruebas comprueban comportamiento SQL de UNIQUE, FK, CHECK, enums, fechas, borrado restrictivo
y permisos/RLS con roles equivalentes creados solo en memoria. Usan SQLSTATE 23505 (duplicado),
23503 (FK huérfana), 23514 (CHECK), 23502 (NOT NULL), 22P02 (enum) y 23001 (RESTRICT en este motor).
No sustituyen pruebas del transporte PrismaPg/Supavisor, PostgreSQL 17 ni la configuración completa
de Data API: conectividad, catálogo real y lectura mediante Prisma se comprueban aparte, sin fixtures
en la base compartida. La generación/validación de Prisma tampoco comprueba tablas reales.

## Fuentes oficiales consultadas

- [Prisma 7: configuración y URL CLI](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference).
- [Prisma 7: diff y deploy sin shadow](https://www.prisma.io/docs/orm/v7/reference/prisma-cli-reference).
- [Esquema en varios archivos](https://www.prisma.io/docs/orm/v7/prisma-schema/overview/location).
- [Supabase y Prisma: Session/direct frente a Transaction](https://supabase.com/docs/guides/database/prisma).
- [Seguridad de Data API](https://supabase.com/docs/guides/api/securing-your-api).
- [PGlite: PostgreSQL WASM en memoria](https://pglite.dev/docs/).
