# Datos del Módulo II en Supabase — 23 de octubre de 2026

Por solicitud expresa del usuario se importaron los datos de `modulo-ii-franciely vivas/02_seed.sql`
en la base Supabase de desarrollo configurada privadamente en el backend. Esta actualización es
posterior a las pruebas aisladas de la entrega original.

## Resultado comprobado

| Tabla            | Antes | Insertados | Total |
| ---------------- | ----: | ---------: | ----: |
| User             |     2 |          5 |     7 |
| Session          |    20 |          5 |    25 |
| ExternalIdentity |     0 |          5 |     5 |
| Module           |     0 |          5 |     5 |
| Lesson           |     0 |          5 |     5 |
| Exercise         |     0 |          5 |     5 |
| LessonProgress   |     0 |          5 |     5 |
| ExerciseProgress |     0 |          5 |     5 |
| Report           |     0 |          5 |     5 |
| AuditLog         |     0 |          5 |     5 |
| ReportEvidence   |     0 |          0 |     0 |

Se añadieron **50 registros** conservando los 22 existentes. Las huellas de cada fila preexistente
se compararon dentro de la transacción y no cambiaron. Los reportes conservan categorías, contenido
y relaciones: cuatro pendientes y uno resuelto. No se inventaron imágenes en Storage.

## Cómo encontrarlos

En Supabase, abrir **Table Editor**, seleccionar el esquema **vocessilentes** y la tabla correspondiente.
Son tablas de la aplicación; sus usuarios no aparecen en Supabase Auth, porque el proyecto usa su
propia autenticación con Prisma y sesiones. Refrescar el editor después de seleccionar el esquema.
La [consulta de verificación](sql/04_verificacion_supabase.sql) muestra totales y subconjunto académico
en modo de solo lectura; no requiere publicar el esquema en Data API ni cambiar RLS.

Los usuarios `academic_1` a `academic_5` conservan IDs, nombres, correos, roles y hashes del seed,
pero se importaron con **isActive=false** porque su contraseña es pública. Sus registros son visibles
y no sirven para iniciar sesión remoto. Las dos cuentas anteriores conservan configuración y acceso.
El TXT personalizado no se utilizó para cambiar credenciales. La demostración local conserva el
seed original con cuentas activas.

## Procedimiento y controles

1. Lectura de tablas e historial y comparación con el seed de `docs/module-ii/sql/`: ambos archivos
   tienen SHA-256 `5b544e757bc36220adc2ded4d48ecabf448816e43a7babc14b0097c945f6d68f`.
2. Reconstrucción exacta del SQL en PostgreSQL aislado para obtener las filas. Los UUID definidos
   en el seed se conservan; los generados por defecto se fijan de forma determinista por tabla y
   cuenta para evitar duplicados en reintentos. No se modifica el SQL original.
3. Ensayo de inserción con rollback en Supabase: restricciones y conservación correctas.
4. **56 pruebas SQL/auth aprobadas**. El sandbox impidió inicialmente crear subprocesos (`EPERM`);
   la ejecución fuera del sandbox terminó correctamente, sin modificar pruebas ni dependencias.
5. Aplicación mediante `pnpm db:migrate` de `20261023000100_module_ii_operations`: cuatro migraciones
   terminadas en el historial Prisma. Se conservan permisos y RLS.
6. Inserción en una transacción Serializable, con bloqueo temporal de escritura, parámetros SQL,
   rechazo de conflictos y sin UPDATE, DELETE, TRUNCATE, reset ni recreación de tablas.
7. Lectura desde una conexión nueva y desde Prisma usando DATABASE_URL: las 50 filas permanecen
   y las once tablas mantienen RLS activo. No se registran URLs, contraseñas ni hashes de cuentas.
8. Segundo ensayo de importación con rollback: cero filas nuevas, sin duplicados ni modificaciones.

La carpeta de entrega conserva `pruebas/supabase-importacion.json` y
`pruebas/supabase-verificacion.json`, con recuentos e indicadores sin credenciales privadas.

La carga es una operación puntual autorizada, no un seed automático al arrancar. No ejecutar
`01_schema.sql` ni `02_seed.sql` sobre esta base poblada: siguen destinados a reconstrucción aislada.
Los resultados y capturas de Chrome originales siguen correspondiendo al entorno aislado; esta
carga acredita persistencia remota SQL/Prisma, sin una nueva prueba de navegador ni de S3.
No se hicieron despliegues ni se ejecutaron GitHub Actions.
