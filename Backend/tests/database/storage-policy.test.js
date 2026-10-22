import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('SQL Storage: bucket privado y política restrictiva niega incluso con otra política permisiva', async () => {
  const db = new PGlite();
  try {
    // Contrato mínimo de Supabase en memoria. No comprueba la instalación remota de Storage.
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA storage;
      CREATE TABLE storage.buckets (id text PRIMARY KEY, name text, public boolean,
        file_size_limit bigint, allowed_mime_types text[]);
      CREATE TABLE storage.objects (bucket_id text, name text);
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      GRANT USAGE ON SCHEMA storage TO anon, authenticated;
      GRANT ALL ON storage.objects TO anon, authenticated;
      CREATE POLICY broad_existing_policy ON storage.objects FOR ALL TO public USING (true) WITH CHECK (true);
      INSERT INTO storage.objects VALUES ('report-evidence', 'private-image'), ('profiles', 'existing-photo');`);
    const sql = await readFile(
      new URL('../../storage/001_report_evidence.sql', import.meta.url),
      'utf8',
    );
    await db.exec(sql);
    await db.exec(sql);
    const bucket = (await db.query('SELECT * FROM storage.buckets')).rows[0];
    assert.equal(bucket.public, false);
    assert.equal(Number(bucket.file_size_limit), 5242880);
    assert.deepEqual(bucket.allowed_mime_types, ['image/jpeg', 'image/png', 'image/webp']);
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`SET ROLE ${role}`);
      assert.deepEqual((await db.query('SELECT name FROM storage.objects')).rows, [
        { name: 'existing-photo' },
      ]);
      await assert.rejects(
        db.exec(`INSERT INTO storage.objects VALUES ('report-evidence', 'foreign')`),
        { code: '42501' },
      );
      assert.equal(
        (
          await db.query(
            `UPDATE storage.objects SET name = 'changed' WHERE bucket_id = 'report-evidence' RETURNING name`,
          )
        ).rows.length,
        0,
      );
      assert.equal(
        (
          await db.query(
            `DELETE FROM storage.objects WHERE bucket_id = 'report-evidence' RETURNING name`,
          )
        ).rows.length,
        0,
      );
      await db.exec('RESET ROLE');
    }
  } finally {
    await db.close();
  }
});
