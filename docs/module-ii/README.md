# Módulo II — PostgreSQL y operaciones funcionales

**Entrega final del 23 de octubre:** consultar [formularios, contratos, filas y pruebas](final-delivery.md)
y [el paquete académico](../../entrega-modulo-ii/README.md). Incluye resolución/reapertura, bitácora visual
y progreso manual real. SQL definitivo: [estructura](sql/01_schema.sql), [seed](sql/02_seed.sql),
[verificación](sql/03_verificacion.sql). Hay cinco filas en diez tablas y la excepción ReportEvidence = 0;
las identidades externas son fixtures explícitos. Las secciones siguientes documentan el Día 1 histórico.

Entrega del Día 1: administración de usuarios conectada a PostgreSQL, validaciones, eliminación
lógica y bitácora administrativa persistente. Se conserva React/Express/Prisma, JavaScript ESM,
sesiones HttpOnly, CSRF y separación de responsabilidades. No incluye el MVP educativo completo.

| Requisito académico                | Entrega                                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| Auditoría inicial                  | [Inventario y brechas](day-01-audit.md)                                                       |
| SQL relacional e inserciones       | [Base y procedimiento](database.md), [estructura](sql/01_schema.sql), [seed](sql/02_seed.sql) |
| CRUD y procesos administrativos    | [Implementación y archivos](day-01-implementation.md)                                         |
| Validaciones, permisos y evidencia | [Pruebas ejecutadas](day-01-testing.md)                                                       |
| Siguiente entrega                  | [Pendientes del Día 2](day-02-pending.md)                                                     |

Las fuentes de verdad siguen siendo [modelo de datos](../data-model.md),
[migraciones](../migrations.md), [API](../api.md), [autenticación](../authentication.md),
[Admin](../admin.md) y [desarrollo](../development.md).

## Límites

- `ExternalIdentity` tiene **cero filas**: excepción explícita al mínimo de cinco, para evitar
  inventar sujetos de proveedores. Las otras nueve tablas tienen cinco registros sintéticos.
- Las cuentas del seed están inactivas y no tienen contraseñas recuperables. No sirven como
  administrador inicial; seguir el procedimiento existente para una cuenta propia autorizada.
- El SQL se prueba en PostgreSQL WASM efímero; no demuestra un despliegue PostgreSQL 17 multiworker.
- La nueva migración está versionada para revisión. **No se aplica a Supabase en esta tarea**;
  las escrituras administrativas requieren aplicarla antes en una base de desarrollo autorizada.
- En el Día 1, resumen, reportes y funciones educativas conservaban demos identificadas. El rediseño
  posterior de [Admin](../admin.md) retira sus demos e incorpora perfil real y dependencias explícitas.
  Student conserva su configuración de demostración. No hay UI de auditoría,
  solo consulta ADMIN paginada. No se publicó ni se ejecutó GitHub Actions remotamente.
