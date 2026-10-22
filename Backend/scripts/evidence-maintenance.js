import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { loadEnv } from '../src/config/load-env.js';
import { parseEnv } from '../src/config/env.js';
import { createDatabase } from '../src/lib/database.js';
import { createEvidenceStorage } from '../src/modules/reports/evidence-storage.js';
import { createReportsService } from '../src/modules/reports/reports.service.js';
import { migrationDatasource } from './migration-config.js';

loadEnv();
let database;
let client;
let storage;
async function connect() {
  const { url } = migrationDatasource({ DIRECT_URL: process.env.DIRECT_URL });
  if (!url) throw new Error('DIRECT_URL missing');
  client = new pg.Client({
    connectionString: url,
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
  });
  await client.connect();
}
try {
  const action = process.argv[2];
  const config = parseEnv(process.env);
  if (action === 'configure') {
    await connect();
    await client.query(
      await readFile(new URL('../storage/001_report_evidence.sql', import.meta.url), 'utf8'),
    );
    console.log(
      'Procedimiento de bucket privado y política aplicado al destino DIRECT_URL configurado.',
    );
  } else {
    storage = createEvidenceStorage(config.storage);
    if (!storage) throw new Error('Storage missing');
    if (action === 'check') {
      await storage.check();
      await connect();
      const bucket = (
        await client.query(
          "SELECT public, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id = 'report-evidence'",
        )
      ).rows[0];
      if (
        bucket.public !== false ||
        Number(bucket.file_size_limit) !== 5242880 ||
        JSON.stringify([...bucket.allowed_mime_types].sort()) !==
          JSON.stringify(['image/jpeg', 'image/png', 'image/webp'].sort())
      )
        throw new Error('Bucket mismatch');
      const policy = await client.query(`SELECT 1 FROM pg_policies WHERE schemaname = 'storage'
        AND tablename = 'objects' AND policyname = 'report_evidence_server_only'
        AND permissive = 'RESTRICTIVE' AND cmd = 'ALL' AND roles = ARRAY['public']::name[]
        AND qual = '(bucket_id <> ''report-evidence''::text)' AND with_check = qual`);
      const rls = await client.query(
        "SELECT relrowsecurity FROM pg_class WHERE oid = 'storage.objects'::regclass",
      );
      if (!policy.rowCount || !rls.rows[0]?.relrowsecurity) throw new Error('Policy mismatch');
      console.log(
        'S3 conectado; SQL confirma bucket privado, límite, MIME y política restrictiva. Falta probar el flujo de usuario.',
      );
    } else if (action === 'cleanup') {
      database = await createDatabase(config.databaseUrl);
      if (!database) throw new Error('DB missing');
      const count = await createReportsService(database, storage).cleanup();
      console.log(`Reservas huérfanas limpiadas: ${count}. Repetir si quedan lotes de 100.`);
    } else throw new Error('Unknown action');
  }
} catch {
  console.error(
    'Operación de evidencia fallida. Revisa configuración privada, permisos y migraciones; no se confirma éxito.',
  );
  process.exitCode = 1;
} finally {
  await database?.$disconnect();
  await client?.end();
  storage?.close();
}
