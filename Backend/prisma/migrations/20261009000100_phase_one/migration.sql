-- Excepción de tamaño: migración inicial atómica generada por Prisma y ampliada
-- con integridad y permisos SQL no expresables en PSL. Ver docs/development.md.
BEGIN;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "vocessilentes";

SET LOCAL search_path = "vocessilentes", pg_catalog;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "IdentityProvider" AS ENUM ('GOOGLE', 'MICROSOFT');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('SIGN_PRACTICE');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('CONTENT', 'TECHNICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'RESOLVED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100),
    "email" VARCHAR(254) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "profileImagePath" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMPTZ(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalIdentity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "provider" "IdentityProvider" NOT NULL,
    "providerUserId" VARCHAR(255) NOT NULL,

    CONSTRAINT "ExternalIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "revokedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "imagePath" TEXT,
    "order" INTEGER NOT NULL,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "moduleId" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "referenceVideoPath" TEXT,
    "order" INTEGER NOT NULL,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lessonId" UUID NOT NULL,
    "instructions" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "ExerciseType" NOT NULL DEFAULT 'SIGN_PRACTICE',
    "expectedSignKey" VARCHAR(100) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "lessonId" UUID NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseProgress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "exerciseId" UUID NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "lastActivityAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),

    CONSTRAINT "ExerciseProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "authorId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "moduleId" UUID,
    "lessonId" UUID,
    "exerciseId" UUID,
    "internalComment" TEXT,
    "resolvedById" UUID,
    "resolvedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "ExternalIdentity_userId_idx" ON "ExternalIdentity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalIdentity_provider_providerUserId_key" ON "ExternalIdentity"("provider", "providerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Module_order_key" ON "Module"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_moduleId_order_key" ON "Lesson"("moduleId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_lessonId_order_key" ON "Exercise"("lessonId", "order");

-- CreateIndex
CREATE INDEX "LessonProgress_lessonId_idx" ON "LessonProgress"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userId_lessonId_key" ON "LessonProgress"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "ExerciseProgress_exerciseId_idx" ON "ExerciseProgress"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseProgress_userId_exerciseId_key" ON "ExerciseProgress"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "Report_authorId_createdAt_idx" ON "Report"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Report_resolvedById_idx" ON "Report"("resolvedById");

-- CreateIndex
CREATE INDEX "Report_moduleId_idx" ON "Report"("moduleId");

-- CreateIndex
CREATE INDEX "Report_lessonId_idx" ON "Report"("lessonId");

-- CreateIndex
CREATE INDEX "Report_exerciseId_idx" ON "Report"("exerciseId");

-- AddForeignKey
ALTER TABLE "ExternalIdentity" ADD CONSTRAINT "ExternalIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseProgress" ADD CONSTRAINT "ExerciseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseProgress" ADD CONSTRAINT "ExerciseProgress_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Reglas SQL: conservarlas en las futuras migraciones; Prisma diff no modela CHECK ni RLS.
ALTER TABLE "User"
  ADD CONSTRAINT "User_firstName_check" CHECK (length(btrim("firstName")) > 0),
  ADD CONSTRAINT "User_lastName_check" CHECK ("lastName" IS NULL OR length(btrim("lastName")) > 0),
  ADD CONSTRAINT "User_email_canonical_check" CHECK (
    "email" = lower("email") AND "email" = btrim("email") AND "email" ~ '^[!-~]+@[!-~]+$'
  ),
  ADD CONSTRAINT "User_username_canonical_check" CHECK ("username" ~ '^[a-z0-9_]{3,50}$'),
  ADD CONSTRAINT "User_passwordHash_check" CHECK ("passwordHash" ~ '^\$(argon2id|2[aby])\$'),
  ADD CONSTRAINT "User_failedLoginAttempts_check" CHECK ("failedLoginAttempts" >= 0),
  ADD CONSTRAINT "User_deleted_check" CHECK (
    (NOT "isDeleted" AND "deletedAt" IS NULL) OR
    ("isDeleted" AND "deletedAt" IS NOT NULL AND "deletedAt" >= "createdAt")
  ),
  ADD CONSTRAINT "User_updatedAt_check" CHECK ("updatedAt" >= "createdAt");

ALTER TABLE "ExternalIdentity"
  ADD CONSTRAINT "ExternalIdentity_providerUserId_check" CHECK (length(btrim("providerUserId")) > 0);

ALTER TABLE "Session"
  ADD CONSTRAINT "Session_tokenHash_check" CHECK ("tokenHash" ~ '^[0-9a-f]{64}$'),
  ADD CONSTRAINT "Session_expiresAt_check" CHECK ("expiresAt" > "createdAt"),
  ADD CONSTRAINT "Session_revokedAt_check" CHECK ("revokedAt" IS NULL OR "revokedAt" >= "createdAt");

ALTER TABLE "Module"
  ADD CONSTRAINT "Module_title_check" CHECK (length(btrim("title")) > 0),
  ADD CONSTRAINT "Module_description_check" CHECK (length(btrim("description")) > 0),
  ADD CONSTRAINT "Module_order_check" CHECK ("order" >= 0);

ALTER TABLE "Lesson"
  ADD CONSTRAINT "Lesson_title_check" CHECK (length(btrim("title")) > 0),
  ADD CONSTRAINT "Lesson_description_check" CHECK (length(btrim("description")) > 0),
  ADD CONSTRAINT "Lesson_order_check" CHECK ("order" >= 0);

ALTER TABLE "Exercise"
  ADD CONSTRAINT "Exercise_instructions_check" CHECK (length(btrim("instructions")) > 0),
  ADD CONSTRAINT "Exercise_expectedSignKey_check" CHECK (length(btrim("expectedSignKey")) > 0),
  ADD CONSTRAINT "Exercise_order_check" CHECK ("order" >= 0);

ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_state_check" CHECK (
  ("status" = 'NOT_STARTED' AND "startedAt" IS NULL AND "completedAt" IS NULL) OR
  ("status" = 'IN_PROGRESS' AND "startedAt" IS NOT NULL AND "completedAt" IS NULL) OR
  ("status" = 'COMPLETED' AND "startedAt" IS NOT NULL AND "completedAt" IS NOT NULL
    AND "completedAt" >= "startedAt")
);

ALTER TABLE "ExerciseProgress" ADD CONSTRAINT "ExerciseProgress_state_check" CHECK (
  ("status" = 'NOT_STARTED' AND "lastActivityAt" IS NULL AND "completedAt" IS NULL) OR
  ("status" = 'IN_PROGRESS' AND "lastActivityAt" IS NOT NULL AND "completedAt" IS NULL) OR
  ("status" = 'COMPLETED' AND "lastActivityAt" IS NOT NULL AND "completedAt" IS NOT NULL
    AND "lastActivityAt" >= "completedAt")
);

ALTER TABLE "Report"
  ADD CONSTRAINT "Report_description_check" CHECK (length(btrim("description")) > 0),
  ADD CONSTRAINT "Report_context_check" CHECK (num_nonnulls("moduleId", "lessonId", "exerciseId") <= 1),
  ADD CONSTRAINT "Report_resolution_check" CHECK (
    ("status" = 'PENDING' AND "resolvedById" IS NULL AND "resolvedAt" IS NULL) OR
    ("status" = 'RESOLVED' AND "resolvedById" IS NOT NULL AND "resolvedAt" IS NOT NULL
      AND "resolvedAt" >= "createdAt")
  ),
  ADD CONSTRAINT "Report_updatedAt_check" CHECK ("updatedAt" >= "createdAt");

-- Defensa ante una exposición accidental por Data API. Ninguna política pública.
REVOKE ALL ON SCHEMA "vocessilentes" FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA "vocessilentes" FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA "vocessilentes" REVOKE ALL ON TABLES FROM PUBLIC;
DO $$
DECLARE
  api_role text;
  application_table text;
BEGIN
  FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
      EXECUTE format('REVOKE ALL ON SCHEMA vocessilentes FROM %I', api_role);
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA vocessilentes FROM %I', api_role);
      EXECUTE format(
        'ALTER DEFAULT PRIVILEGES IN SCHEMA vocessilentes REVOKE ALL ON TABLES FROM %I', api_role
      );
    END IF;
  END LOOP;
  FOREACH application_table IN ARRAY ARRAY[
    'User', 'ExternalIdentity', 'Session', 'Module', 'Lesson',
    'Exercise', 'LessonProgress', 'ExerciseProgress', 'Report'
  ] LOOP
    EXECUTE format('ALTER TABLE vocessilentes.%I ENABLE ROW LEVEL SECURITY', application_table);
  END LOOP;
END $$;

COMMIT;
