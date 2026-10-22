-- Procedimiento exclusivo de Supabase, separado de las migraciones Prisma de aplicación.
-- Ejecutar con DIRECT_URL del mismo proyecto, rol con permisos en storage.buckets/objects.
-- No crea políticas basadas en auth.uid(): las sesiones VocesSilentes son propias.
BEGIN;
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('report-evidence', 'report-evidence', false, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, public = false, file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RESTRICTIVE impide que políticas permisivas existentes de otros buckets abran este bucket.
-- service_role/BYPASSRLS sigue siendo responsabilidad del backend autorizado.
DROP POLICY IF EXISTS report_evidence_server_only ON storage.objects;
CREATE POLICY report_evidence_server_only ON storage.objects AS RESTRICTIVE
FOR ALL TO public
USING (bucket_id <> 'report-evidence')
WITH CHECK (bucket_id <> 'report-evidence');
COMMIT;
