import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { prepareTrainingData } from '../../../shared/lsv/training-data.js';

/**
 * Lee lotes locales y añade hashes antes de la misma validación utilizada por el entrenador del navegador.
 * @param {string[]} paths Archivos JSON locales, sin URLs ni .env.
 * @returns {Promise<object>} Dataset revisado, preparado y separado por participantes.
 * @throws {Error} Formato, tamaño, revisión, duplicados o fuga entre personas incompatibles.
 */
export async function readTrainingDataset(paths) {
  const samples = [];
  const sources = [];
  for (const path of paths) {
    const bytes = await readFile(path);
    if (bytes.length > 16 * 1024 * 1024)
      throw new Error('Divide las muestras en archivos de hasta 16 MB');
    const data = JSON.parse(bytes.toString('utf8'));
    if (data.version !== 1 || !Array.isArray(data.samples) || !data.samples.length)
      throw new Error('Se necesita una exportación de muestras reales del laboratorio');
    sources.push(createHash('sha256').update(bytes).digest('hex'));
    samples.push(...data.samples);
    if (samples.length > 3000)
      throw new Error('Máximo 3000 muestras por entrenamiento de este prototipo');
  }
  return { ...prepareTrainingData(samples), sources };
}
