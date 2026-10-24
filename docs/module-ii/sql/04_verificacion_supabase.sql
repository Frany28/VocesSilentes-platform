-- Solo lectura: comprueba el subconjunto académico sin asumir que la base estaba vacía.
-- Ejecutar en el mismo proyecto Supabase de desarrollo; las tablas están en vocessilentes.
BEGIN TRANSACTION READ ONLY;
SET LOCAL search_path = vocessilentes, pg_catalog;
SELECT 'User' AS tabla, count(*) AS registros_totales,
  count(*) FILTER (WHERE id::text LIKE '10000000-0000-4000-8000-%') AS academicos
FROM "User"
UNION ALL SELECT 'Session', count(*),
  count(*) FILTER (WHERE "userId"::text LIKE '10000000-0000-4000-8000-%') FROM "Session"
UNION ALL SELECT 'ExternalIdentity', count(*),
  count(*) FILTER (WHERE "providerUserId" LIKE 'academic-fixture:not-an-oauth-subject:%')
FROM "ExternalIdentity"
UNION ALL SELECT 'Module', count(*),
  count(*) FILTER (WHERE id::text LIKE '20000000-0000-4000-8000-%') FROM "Module"
UNION ALL SELECT 'Lesson', count(*),
  count(*) FILTER (WHERE id::text LIKE '30000000-0000-4000-8000-%') FROM "Lesson"
UNION ALL SELECT 'Exercise', count(*),
  count(*) FILTER (WHERE id::text LIKE '40000000-0000-4000-8000-%') FROM "Exercise"
UNION ALL SELECT 'LessonProgress', count(*),
  count(*) FILTER (WHERE "userId"::text LIKE '10000000-0000-4000-8000-%') FROM "LessonProgress"
UNION ALL SELECT 'ExerciseProgress', count(*),
  count(*) FILTER (WHERE "userId"::text LIKE '10000000-0000-4000-8000-%') FROM "ExerciseProgress"
UNION ALL SELECT 'Report', count(*),
  count(*) FILTER (WHERE "authorId"::text LIKE '10000000-0000-4000-8000-%'
    AND description LIKE 'Reporte académico sintético %') FROM "Report"
UNION ALL SELECT 'AuditLog', count(*),
  count(*) FILTER (WHERE "actorId" IS NULL AND operation = 'USER_CREATED'
    AND "entityId"::text LIKE '10000000-0000-4000-8000-%') FROM "AuditLog"
UNION ALL SELECT 'ReportEvidence', count(*), 0 FROM "ReportEvidence" ORDER BY tabla;

-- Se conserva el hash del seed, pero las cinco cuentas de contraseña pública están desactivadas.
SELECT id, username, role, "isActive", "isDeleted",
  "passwordHash" LIKE '$argon2id$%' AS usa_argon2id
FROM "User" WHERE id::text LIKE '10000000-0000-4000-8000-%' ORDER BY id;
SELECT count(*) AS sesiones_academicas_utilizables FROM "Session"
WHERE "userId"::text LIKE '10000000-0000-4000-8000-%'
  AND "revokedAt" IS NULL AND "expiresAt" > CURRENT_TIMESTAMP;
SELECT migration_name, finished_at IS NOT NULL AS aplicada
FROM _prisma_migrations WHERE rolled_back_at IS NULL ORDER BY migration_name;
SELECT c.relname AS tabla, c.relrowsecurity AS rls_activo
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'vocessilentes' AND c.relkind = 'r'
  AND c.relname <> '_prisma_migrations' ORDER BY c.relname;
COMMIT;
