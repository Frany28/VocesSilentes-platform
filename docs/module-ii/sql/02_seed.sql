-- EXCLUSIVAMENTE PostgreSQL limpio y aislado; nunca Supabase compartido ni producción.
-- Contraseña pública del fixture: Solo practica local 2026! (Argon2id con sal independiente).
-- ExternalIdentity: identificadores SINTÉTICOS, no sujetos OAuth ni identidades verificadas.
-- ReportEvidence: excepción = 0; no se inventan archivos S3 ni evidencias READY inexistentes.
BEGIN;
SET LOCAL search_path = vocessilentes, pg_catalog;
DO $$
DECLARE application_table text;
DECLARE occupied boolean;
BEGIN
  FOREACH application_table IN ARRAY ARRAY[
    'User', 'Session', 'ExternalIdentity', 'Module', 'Lesson', 'Exercise',
    'LessonProgress', 'ExerciseProgress', 'Report', 'AuditLog', 'ReportEvidence'
  ] LOOP
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I)', application_table) INTO occupied;
    IF occupied THEN RAISE EXCEPTION 'Seed requires empty application tables'; END IF;
  END LOOP;
END $$;
CREATE TEMP TABLE day_one_credentials (n integer, password_hash text, token_hash text) ON COMMIT DROP;
-- BEGIN GENERATED CREDENTIALS
INSERT INTO day_one_credentials VALUES
(1, '$argon2id$v=19$m=19456,p=1,t=2$u8c4kLVM7jmQY+DqZ1yZgg$JyKLJS46H05vde47/pGCfo7/FeWtr4XFfiL1Dbcgk9k', '8f343c1098f99206530ed971eb965f7f81d54da58e7a17a75f8541a423be71f1'),
(2, '$argon2id$v=19$m=19456,p=1,t=2$j5200+PXTfN2DzIvLi0Bsw$q8tbKRPi+/vENCMzm+oRQgcP4LoQqCzjk4y34jU0JVs', '4bcbf3e739701004f2def21bc12d215d4ce57b665292c5b8b7765cdbdf4f22d1'),
(3, '$argon2id$v=19$m=19456,p=1,t=2$pXeLEk3fhP80FhRmcu+edQ$OwII1vxqR5rXwQ+fwGzrF5jmgmPW87RIQh1Qph2DBQs', '7ae182148c686dcbc33f5ad7ccd3acb6444e052622af2b3df82015e716caeb2d'),
(4, '$argon2id$v=19$m=19456,p=1,t=2$4ku5PHEEIrIwYNrGyC3Vdg$8PLjPaT3U3JE15f6EpN1RPNFKc8ovXg1W9/PVhUB/DY', '9a2f0750b7cfc8aac6fd720826818fc94a51fd5fe37bd775976da9650e8b2b4f'),
(5, '$argon2id$v=19$m=19456,p=1,t=2$UgqDVZCmn/ZANtSGr+YKZg$t2GSKveQjvB4OcUcpZ/PuYm7iR60UYpIX21OH8+T93g', '2d78320969b8bc295969edc949261e22f92f7a8978caf06e33253ceb54e77f90') ;
-- END GENERATED CREDENTIALS
CREATE TEMP TABLE academic_fixture ON COMMIT DROP AS
SELECT *,
  ('10000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid AS user_id,
  ('20000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid AS module_id,
  ('30000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid AS lesson_id,
  ('40000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid AS exercise_id
FROM day_one_credentials;
INSERT INTO "User" (id, "firstName", email, username, "passwordHash", role, "createdAt")
SELECT user_id, 'Cuenta académica ' || n, 'academic_' || n || '@example.invalid',
  'academic_' || n, password_hash,
  (CASE WHEN n = 1 THEN 'ADMIN' ELSE 'USER' END)::"UserRole", '2026-01-01T00:00:00Z'
FROM academic_fixture;
INSERT INTO "ExternalIdentity" ("userId", provider, "providerUserId")
SELECT user_id, (CASE WHEN n % 2 = 0 THEN 'GOOGLE' ELSE 'MICROSOFT' END)::"IdentityProvider",
  'academic-fixture:not-an-oauth-subject:' || n FROM academic_fixture;
INSERT INTO "Session" ("userId", "tokenHash", "createdAt", "expiresAt", "revokedAt")
SELECT user_id, token_hash, '2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z', '2026-01-01T01:00:00Z'
FROM academic_fixture;
INSERT INTO "Module" (id, title, description, "order", "publicationStatus")
SELECT module_id, 'Práctica académica ' || n,
  'Contenido sintético para probar formularios y persistencia; no es una lección LSV validada.',
  n, 'PUBLISHED' FROM academic_fixture;
INSERT INTO "Lesson" (id, "moduleId", title, description, "order", "publicationStatus")
SELECT lesson_id, module_id, 'Lectura académica ' || n,
  'Lee esta indicación de prueba y registra tu actividad. No hay vídeo ni evaluación de señas.',
  0, 'PUBLISHED' FROM academic_fixture;
INSERT INTO "Exercise" (id, "lessonId", instructions, "order", "expectedSignKey")
SELECT exercise_id, lesson_id,
  'Actividad académica: registra tu práctica manual. No se activa la cámara ni se reconoce LSV.',
  0, 'academic-fixture-' || n FROM academic_fixture;
INSERT INTO "LessonProgress" ("userId", "lessonId")
SELECT user_id, lesson_id FROM academic_fixture;
INSERT INTO "ExerciseProgress" ("userId", "exerciseId")
SELECT user_id, exercise_id FROM academic_fixture;
INSERT INTO "Report" ("authorId", description, category, "moduleId", status,
  "resolvedById", "resolvedAt", "internalComment", "createdAt", "updatedAt")
SELECT user_id, 'Reporte académico sintético ' || n || ': revisión del material de prueba.',
  (CASE n % 3 WHEN 0 THEN 'CONTENT' WHEN 1 THEN 'TECHNICAL' ELSE 'OTHER' END)::"ReportCategory",
  module_id, (CASE WHEN n = 5 THEN 'RESOLVED' ELSE 'PENDING' END)::"ReportStatus",
  CASE WHEN n = 5 THEN '10000000-0000-4000-8000-000000000001'::uuid ELSE NULL END,
  CASE WHEN n = 5 THEN '2026-01-02T00:00:00Z'::timestamptz ELSE NULL END,
  CASE WHEN n = 5 THEN 'Resolución sintética académica; no operación de una persona real.' ELSE NULL END,
  '2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z' FROM academic_fixture;
-- Actor NULL identifica eventos sintéticos del seed; las operaciones reales usan sesión y transacción.
INSERT INTO "AuditLog" ("actorId", operation, "entityType", "entityId", "createdAt")
SELECT NULL, 'USER_CREATED', 'User', user_id, '2026-01-01T00:00:00Z' FROM academic_fixture;
COMMIT;
SELECT 'User' AS entity, count(*) AS records FROM vocessilentes."User"
UNION ALL SELECT 'ExternalIdentity', count(*) FROM vocessilentes."ExternalIdentity"
UNION ALL SELECT 'Session', count(*) FROM vocessilentes."Session"
UNION ALL SELECT 'Module', count(*) FROM vocessilentes."Module"
UNION ALL SELECT 'Lesson', count(*) FROM vocessilentes."Lesson"
UNION ALL SELECT 'Exercise', count(*) FROM vocessilentes."Exercise"
UNION ALL SELECT 'LessonProgress', count(*) FROM vocessilentes."LessonProgress"
UNION ALL SELECT 'ExerciseProgress', count(*) FROM vocessilentes."ExerciseProgress"
UNION ALL SELECT 'Report', count(*) FROM vocessilentes."Report"
UNION ALL SELECT 'AuditLog', count(*) FROM vocessilentes."AuditLog"
UNION ALL SELECT 'ReportEvidence', count(*) FROM vocessilentes."ReportEvidence";
