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
try {
  const action = process.argv[2];
  const config = parseEnv(process.env);
  if (action === 'configure') {
    const { url } = migrationDatasource({ DIRECT_URL: process.env.DIRECT_URL });
    if (!url) throw new Error('DIRECT_URL missing');
    client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 10000 });
    await client.connect();
    await client.query(
      await readFile(new URL('../storage/001_report_evidence.sql', import.meta.url), 'utf8'),
    );
    console.log(
      'Procedimiento de bucket privado y política aplicado al destino DIRECT_URL configurado.',
    );
  } else {
    const storage = createEvidenceStorage(config.storage);
    if (!storage) throw new Error('Storage missing');
    if (action === 'check') {
      const bucket = await storage.check();
      if (
        bucket.public !== false ||
        Number(bucket.file_size_limit) !== 5242880 ||
        JSON.stringify([...bucket.allowed_mime_types].sort()) !==
          JSON.stringify(['image/jpeg', 'image/png', 'image/webp'].sort())
      )
        throw new Error('Bucket mismatch');
      console.log(
        'API Storage: bucket privado, límite y MIME comprobados. No prueba carga ni permisos de usuario.',
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
}
