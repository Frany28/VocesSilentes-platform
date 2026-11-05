-- Ampliación aditiva: conserva los modelos, ejercicios manuales y avances anteriores.
SET search_path = vocessilentes, pg_catalog;
ALTER TYPE "ExerciseType" ADD VALUE 'MULTIPLE_CHOICE_TEXT';
ALTER TYPE "ExerciseType" ADD VALUE 'MULTIPLE_CHOICE_IMAGE';

ALTER TABLE "Module" ADD COLUMN "contentKey" VARCHAR(100);
CREATE UNIQUE INDEX "Module_contentKey_key" ON "Module"("contentKey");
ALTER TABLE "Module" ADD CONSTRAINT "Module_contentKey_check"
  CHECK ("contentKey" IS NULL OR length(btrim("contentKey")) > 0);

ALTER TABLE "Lesson" ADD COLUMN "content" JSONB;
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_content_check"
  CHECK ("content" IS NULL OR jsonb_typeof("content") = 'object');

-- La definición es privada del servidor: nunca serializarla directamente en la API.
ALTER TABLE "Exercise" ADD COLUMN "definition" JSONB;
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_definition_check" CHECK (
  ("type"::text = 'SIGN_PRACTICE' AND "definition" IS NULL) OR
  ("type"::text IN ('MULTIPLE_CHOICE_TEXT', 'MULTIPLE_CHOICE_IMAGE')
    AND "definition" IS NOT NULL AND jsonb_typeof("definition") = 'object')
);
-- No hay tablas nuevas; las políticas RLS y permisos privados existentes se conservan.
