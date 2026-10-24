-- Solo aplicar en una base autorizada. No modifica migraciones históricas ni elimina datos.
BEGIN;
ALTER TYPE vocessilentes."AuditOperation" ADD VALUE 'USER_REGISTERED';
ALTER TYPE vocessilentes."AuditOperation" ADD VALUE 'REPORT_CREATED';
ALTER TYPE vocessilentes."AuditOperation" ADD VALUE 'REPORT_RESOLVED';
ALTER TYPE vocessilentes."AuditOperation" ADD VALUE 'REPORT_REOPENED';
ALTER TYPE vocessilentes."AuditOperation" ADD VALUE 'REPORT_EVIDENCE_ATTACHED';
ALTER TYPE vocessilentes."AuditOperation" ADD VALUE 'LESSON_PROGRESS_UPDATED';
ALTER TYPE vocessilentes."AuditOperation" ADD VALUE 'EXERCISE_PROGRESS_UPDATED';
ALTER TABLE vocessilentes."AuditLog" DROP CONSTRAINT "AuditLog_entityType_check";
-- Comparar texto permite definir el CHECK antes del commit que habilita los nuevos valores enum.
ALTER TABLE vocessilentes."AuditLog" ADD CONSTRAINT "AuditLog_entityType_check" CHECK (
  ("entityType" = 'User' AND operation::text IN
    ('USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_REGISTERED')) OR
  ("entityType" = 'Report' AND operation::text IN
    ('REPORT_CREATED', 'REPORT_RESOLVED', 'REPORT_REOPENED')) OR
  ("entityType" = 'ReportEvidence' AND operation::text = 'REPORT_EVIDENCE_ATTACHED') OR
  ("entityType" = 'LessonProgress' AND operation::text = 'LESSON_PROGRESS_UPDATED') OR
  ("entityType" = 'ExerciseProgress' AND operation::text = 'EXERCISE_PROGRESS_UPDATED')
);
COMMIT;
