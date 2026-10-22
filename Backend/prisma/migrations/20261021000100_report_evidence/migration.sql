BEGIN;
SET LOCAL search_path = vocessilentes, pg_catalog;

ALTER TABLE "Report" ADD COLUMN "requestId" uuid;
CREATE UNIQUE INDEX "Report_authorId_requestId_key" ON "Report" ("authorId", "requestId");
CREATE UNIQUE INDEX "Report_id_authorId_key" ON "Report" (id, "authorId");

CREATE TABLE "ReportEvidence" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "reportId" uuid NOT NULL UNIQUE,
  "ownerId" uuid NOT NULL,
  bucket text NOT NULL DEFAULT 'report-evidence',
  path text NOT NULL UNIQUE,
  "mimeType" text NOT NULL,
  size integer NOT NULL,
  digest char(64) NOT NULL,
  state text NOT NULL DEFAULT 'PENDING',
  "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "ReportEvidence_reportId_ownerId_fkey" FOREIGN KEY ("reportId", "ownerId")
    REFERENCES "Report" (id, "authorId") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ReportEvidence_bucket_check" CHECK (bucket = 'report-evidence'),
  CONSTRAINT "ReportEvidence_path_check" CHECK (path = "ownerId"::text || '/' || "reportId"::text || '/' || id::text),
  CONSTRAINT "ReportEvidence_mime_check" CHECK ("mimeType" IN ('image/jpeg', 'image/png', 'image/webp')),
  CONSTRAINT "ReportEvidence_size_check" CHECK (size BETWEEN 1 AND 5242880),
  CONSTRAINT "ReportEvidence_digest_check" CHECK (digest ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "ReportEvidence_state_check" CHECK (state IN ('PENDING', 'READY', 'DELETING'))
);
CREATE INDEX "ReportEvidence_state_createdAt_idx" ON "ReportEvidence" (state, "createdAt");
CREATE UNIQUE INDEX "ReportEvidence_reportId_ownerId_key" ON "ReportEvidence" ("reportId", "ownerId");
ALTER TABLE "ReportEvidence" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "ReportEvidence" FROM PUBLIC;
DO $$
DECLARE role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('REVOKE ALL ON vocessilentes."ReportEvidence" FROM %I', role_name);
    END IF;
  END LOOP;
END $$;
COMMIT;
