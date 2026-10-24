-- Solo lectura; ejecutar después de 01_schema.sql y 02_seed.sql en PostgreSQL aislado.
BEGIN TRANSACTION READ ONLY;
SET LOCAL search_path = vocessilentes, pg_catalog;
SELECT 'User' AS tabla, count(*) AS registros FROM "User"
UNION ALL SELECT 'ExternalIdentity', count(*) FROM "ExternalIdentity"
UNION ALL SELECT 'Session', count(*) FROM "Session"
UNION ALL SELECT 'Module', count(*) FROM "Module"
UNION ALL SELECT 'Lesson', count(*) FROM "Lesson"
UNION ALL SELECT 'Exercise', count(*) FROM "Exercise"
UNION ALL SELECT 'LessonProgress', count(*) FROM "LessonProgress"
UNION ALL SELECT 'ExerciseProgress', count(*) FROM "ExerciseProgress"
UNION ALL SELECT 'Report', count(*) FROM "Report"
UNION ALL SELECT 'ReportEvidence', count(*) FROM "ReportEvidence"
UNION ALL SELECT 'AuditLog', count(*) FROM "AuditLog" ORDER BY tabla;
-- Identidades marcadas como fixtures: no representan autenticaciones de Google/Microsoft.
SELECT provider, "providerUserId", "providerUserId" LIKE 'academic-fixture:%' AS sintetica
FROM "ExternalIdentity" ORDER BY "providerUserId";
SELECT id, username, role, "isActive", "isDeleted",
  "passwordHash" LIKE '$argon2id$%' AS usa_argon2id FROM "User" ORDER BY username;
SELECT m.title AS modulo, l.title AS leccion, e.instructions AS ejercicio
FROM "Module" m JOIN "Lesson" l ON l."moduleId" = m.id
JOIN "Exercise" e ON e."lessonId" = l.id ORDER BY m."order", l."order", e."order";
SELECT u.username, l.title, p.status, p."startedAt", p."completedAt"
FROM "LessonProgress" p JOIN "User" u ON u.id = p."userId"
JOIN "Lesson" l ON l.id = p."lessonId" ORDER BY u.username;
SELECT u.username, e."expectedSignKey", p.status, p."lastActivityAt", p."completedAt"
FROM "ExerciseProgress" p JOIN "User" u ON u.id = p."userId"
JOIN "Exercise" e ON e.id = p."exerciseId" ORDER BY u.username;
SELECT u.username AS autor, r.category, r.status, r.description,
  a.username AS resuelto_por, r."resolvedAt", r."internalComment"
FROM "Report" r JOIN "User" u ON u.id = r."authorId"
LEFT JOIN "User" a ON a.id = r."resolvedById" ORDER BY r."createdAt", r.id;
SELECT "actorId", operation, "entityType", "entityId", "createdAt",
  "actorId" IS NULL AS evento_sintetico_del_seed FROM "AuditLog" ORDER BY "createdAt", id;
SELECT count(*) AS sesiones_del_seed_utilizables FROM "Session"
WHERE "revokedAt" IS NULL AND "expiresAt" > CURRENT_TIMESTAMP;
SELECT c.relname AS tabla, c.relrowsecurity AS rls_activo
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'vocessilentes' AND c.relkind = 'r' ORDER BY c.relname;
COMMIT;
