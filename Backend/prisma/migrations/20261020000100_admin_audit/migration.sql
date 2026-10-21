BEGIN;
SET LOCAL search_path = "vocessilentes", pg_catalog;

CREATE TYPE "AuditOperation" AS ENUM ('USER_CREATED', 'USER_UPDATED', 'USER_DELETED');
CREATE TABLE "AuditLog" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "actorId" UUID,
  "operation" "AuditOperation" NOT NULL,
  "entityType" VARCHAR(50) NOT NULL DEFAULT 'User',
  "entityId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuditLog_entityType_check" CHECK ("entityType" = 'User'),
  CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId")
    REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
-- entityId se conserva sin FK: una futura purga autorizada no debe borrar el historial.
CREATE INDEX "AuditLog_createdAt_id_idx" ON "AuditLog"("createdAt", "id");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "AuditLog_entityId_createdAt_idx" ON "AuditLog"("entityId", "createdAt");
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "AuditLog" FROM PUBLIC;
DO $$
DECLARE api_role text;
BEGIN
  FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
      EXECUTE format('REVOKE ALL ON TABLE vocessilentes."AuditLog" FROM %I', api_role);
    END IF;
  END LOOP;
END $$;
COMMIT;
