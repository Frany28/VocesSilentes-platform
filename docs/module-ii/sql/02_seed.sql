-- Solo base limpia y aislada. No ejecutar en Supabase compartido ni producción.
-- Cuentas inactivas, contraseñas aleatorias descartadas, sesiones revocadas y vencidas.
-- ExternalIdentity queda vacío: no se fabrican identidades externas (ver database.md).
BEGIN;
SET LOCAL search_path = vocessilentes, pg_catalog;
DO $$
DECLARE application_table text;
DECLARE occupied boolean;
BEGIN
  FOREACH application_table IN ARRAY ARRAY[
    'User', 'Session', 'ExternalIdentity', 'Module', 'Lesson',
    'Exercise', 'LessonProgress', 'ExerciseProgress', 'Report', 'AuditLog'
  ] LOOP
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I)', application_table) INTO occupied;
    IF occupied THEN RAISE EXCEPTION 'Seed requires empty application tables'; END IF;
  END LOOP;
END $$;

CREATE TEMP TABLE day_one_credentials (n integer, password_hash text, token_hash text) ON COMMIT DROP;
-- BEGIN GENERATED CREDENTIALS
INSERT INTO day_one_credentials VALUES
(1, '$argon2id$v=19$m=19456,p=1,t=2$LP8gufLdP1ZEdbm/D/awRw$xP6PB8ylU4v0DKSq+XEOp7ct4y06nMHonrhGYq20lfI', '16aa5ca98c5911bdb8b9c5a56677eb3b28e1567fee1f61312057200c39f8f544'),
(2, '$argon2id$v=19$m=19456,p=1,t=2$i4L+w5/ZH2ewPbyqzxe0CQ$iiBzOZmf+N2ebufBcpaBZ0Z+YRTa4/fjdgBmJoblG7U', 'c2f13ab296e49c42676a99bbfd3df08e17eedf4ea2d3e8e5af84b29d66812f4d'),
(3, '$argon2id$v=19$m=19456,p=1,t=2$puI5fhcNfeqz6RlWdLnrtQ$eRG2pjtD1mEQLqgjHjrxzHiogaq+r8/UG4OmM0o8se0', '5718006fc7f6807e9d844b1302d45df3af4d5657d26cc57ba9531ea7cc3085df'),
(4, '$argon2id$v=19$m=19456,p=1,t=2$e2LhzQrY57CNyt0J34jmHQ$0dSVOSN2cDJrif6IGW1QBosHAZIzriQRjyXwtPi+Lgw', '84a52c0246caa6e4d2467a8d058b1e4b26a783484432291144e4bcc153490824'),
(5, '$argon2id$v=19$m=19456,p=1,t=2$y8uVKc2Aoa/csx4/HnPtfg$Nbe7mhhoAw9xuhtk9rfxEbVg3pysHt3+en3K1vr8CVk', '535fa483270e345d6c544989a982409658d1ce66cba6265cde7b10f178cfd7d6') ;
-- END GENERATED CREDENTIALS

CREATE TEMP TABLE day_one_fixture ON COMMIT DROP AS
SELECT *,
  ('10000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid AS user_id,
  ('20000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid AS module_id,
  ('30000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid AS lesson_id,
  ('40000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid AS exercise_id
FROM day_one_credentials;

INSERT INTO "User" (id, "firstName", email, username, "passwordHash", role, "isActive", "createdAt")
SELECT user_id, 'Cuenta sintética ' || n, 'academic_' || n || '@example.invalid',
  'academic_' || n, password_hash,
  (CASE WHEN n = 1 THEN 'ADMIN' ELSE 'USER' END)::"UserRole", false, '2026-01-01T00:00:00Z'
FROM day_one_fixture;

INSERT INTO "Session" ("userId", "tokenHash", "createdAt", "expiresAt", "revokedAt")
SELECT user_id, token_hash, '2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z', '2026-01-01T01:00:00Z'
FROM day_one_fixture;

INSERT INTO "Module" (id, title, description, "order")
SELECT module_id, 'Módulo sintético ' || n, 'Fixture académico; no contenido LSV validado.', n
FROM day_one_fixture;
INSERT INTO "Lesson" (id, "moduleId", title, description, "order")
SELECT lesson_id, module_id, 'Lección sintética ' || n, 'Fixture académico aislado.', 0
FROM day_one_fixture;
INSERT INTO "Exercise" (id, "lessonId", instructions, "order", "expectedSignKey")
SELECT exercise_id, lesson_id, 'Ejercicio sintético sin evaluación.', 0, 'academic-fixture-' || n
FROM day_one_fixture;
INSERT INTO "LessonProgress" ("userId", "lessonId")
SELECT user_id, lesson_id FROM day_one_fixture;
INSERT INTO "ExerciseProgress" ("userId", "exerciseId")
SELECT user_id, exercise_id FROM day_one_fixture;
INSERT INTO "Report" ("authorId", description, category, "moduleId")
SELECT user_id, 'Reporte sintético ' || n, 'CONTENT', module_id FROM day_one_fixture;
-- Evidencia sintética de inserción, no operaciones realizadas por una persona real.
INSERT INTO "AuditLog" ("actorId", operation, "entityId", "createdAt")
SELECT '10000000-0000-4000-8000-000000000001', 'USER_CREATED', user_id, '2026-01-01T00:00:00Z'
FROM day_one_fixture;
COMMIT;

-- Nueve tablas con cinco filas; excepción explícita: ExternalIdentity = 0.
SELECT 'User' AS entity, count(*) AS records FROM vocessilentes."User"
UNION ALL SELECT 'ExternalIdentity', count(*) FROM vocessilentes."ExternalIdentity"
UNION ALL SELECT 'Session', count(*) FROM vocessilentes."Session"
UNION ALL SELECT 'Module', count(*) FROM vocessilentes."Module"
UNION ALL SELECT 'Lesson', count(*) FROM vocessilentes."Lesson"
UNION ALL SELECT 'Exercise', count(*) FROM vocessilentes."Exercise"
UNION ALL SELECT 'LessonProgress', count(*) FROM vocessilentes."LessonProgress"
UNION ALL SELECT 'ExerciseProgress', count(*) FROM vocessilentes."ExerciseProgress"
UNION ALL SELECT 'Report', count(*) FROM vocessilentes."Report"
UNION ALL SELECT 'AuditLog', count(*) FROM vocessilentes."AuditLog";
