-- Bucket privado para sesiones propias VocesSilentes; no usa Supabase Auth.
BEGIN;
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-photos', 'profile-photos', false, 5242880, ARRAY['image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
DROP POLICY IF EXISTS profile_photos_server_only ON storage.objects;
CREATE POLICY profile_photos_server_only ON storage.objects AS RESTRICTIVE
FOR ALL TO public USING (bucket_id <> 'profile-photos') WITH CHECK (bucket_id <> 'profile-photos');
COMMIT;
