import assert from 'node:assert/strict';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { loadEnv } from '../src/config/load-env.js';
import { parseEnv } from '../src/config/env.js';
import { EVIDENCE_BUCKET } from '../src/modules/reports/evidence-image.js';
import { createEvidenceS3Client } from '../src/modules/reports/evidence-s3-client.js';
import { createEvidenceStorage } from '../src/modules/reports/evidence-storage.js';
import { probeEvidenceImage } from './probe-evidence-image.js';

// Prueba operativa explícita: crea tres objetos efímeros, sin cuentas ni reportes de prueba en DB.
loadEnv();
const directory = new URL('../../.local/', import.meta.url);
const journal = new URL('evidence-s3-probe.json', directory);
const cases = ['jpeg', 'png', 'webp'].map((format) => ({
  format,
  path: `${randomUUID()}/${randomUUID()}/${randomUUID()}`,
}));
let storage;
let recorded = false;
let phase = 'configuración';
try {
  const config = parseEnv(process.env);
  if (!config.storage) throw new Error('S3 missing');
  const client = createEvidenceS3Client(config.storage);
  storage = createEvidenceStorage(config.storage, { client });
  await storage.check();
  await mkdir(directory, { recursive: true });
  await writeFile(
    journal,
    JSON.stringify({ bucket: EVIDENCE_BUCKET, paths: cases.map((item) => item.path) }),
    { flag: 'wx' },
  );
  recorded = true;
  for (const { format, path } of cases) {
    phase = `carga/lectura/permisos ${format}`;
    await probeEvidenceImage(storage, client, format, path);
    console.log(
      `${format}: lectura exacta, sobrescritura/anónimo/firma vencida denegados y renovación correcta.`,
    );
  }
  phase = 'listado anónimo';
  const listing = await fetch(`${config.storage.endpoint}/${EVIDENCE_BUCKET}?list-type=2`, {
    signal: AbortSignal.timeout(20000),
  });
  assert.ok([400, 401, 403, 404].includes(listing.status));
  await listing.body?.cancel();
  console.log(
    'Listado S3 anónimo denegado. No se prueba aquí la UI desplegada ni sesiones de usuarios remotos.',
  );
} catch {
  console.error(
    `Prueba S3 fallida en ${phase}. Revisar configuración y .local/evidence-s3-probe.json si existe.`,
  );
  process.exitCode = 1;
} finally {
  if (recorded) {
    let clean = true;
    for (const { path } of cases) {
      try {
        await storage.remove(path);
      } catch {
        clean = false;
      }
    }
    if (clean) {
      await unlink(journal);
      console.log('Los tres objetos temporales fueron eliminados.');
    } else {
      console.error(
        'Limpieza incompleta; conservar el registro local para retirar las rutas temporales por S3.',
      );
      process.exitCode = 1;
    }
  }
  storage?.close();
}
