import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

/**
 * Lee lotes explícitos para auditar también muestras pendientes, sin reclasificarlas ni entrenar.
 * @param {string[]} paths Rutas locales elegidas por el operador.
 * @returns {Promise<object>} Muestras privadas y huellas de fuentes, sin leer .env ni acceder a la red.
 * @throws {Error} Formato, tamaño o límite incompatibles.
 */
export async function readAuditBatches(paths) {
  const samples = [];
  const sourceSha256 = [];
  for (const path of paths) {
    const bytes = await readFile(path);
    if (bytes.length > 16 * 1024 * 1024)
      throw new Error('Cada lote debe ocupar como máximo 16 MB.');
    const data = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''));
    const batch = Array.isArray(data) ? data : data?.version === 1 ? data.samples : null;
    if (!Array.isArray(batch))
      throw new Error('Indica un JSON de muestras del laboratorio, no un modelo o manifiesto.');
    samples.push(...batch);
    if (samples.length > 3000) throw new Error('Máximo 3000 muestras por auditoría.');
    sourceSha256.push(createHash('sha256').update(bytes).digest('hex'));
  }
  return { samples, sourceSha256 };
}
