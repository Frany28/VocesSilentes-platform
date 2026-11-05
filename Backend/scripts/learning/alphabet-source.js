import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { alphabetPackageSchema } from './alphabet.schema.js';

/**
 * Obtiene UUID v5 estables para el contenido, sin relación con identidades o tokens.
 * @param {string} key Clave editorial del JSON.
 * @returns {string} UUID estable del espacio de nombres exclusivo de este módulo.
 */
export function alphabetId(key) {
  const namespace = Buffer.from('cb98d68092f24d95b48f3d83096a0a05', 'hex');
  const bytes = createHash('sha1').update(namespace).update(key, 'utf8').digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 15) | 80;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export const alphabetModuleId = alphabetId('modulo-01-alfabeto-manual-lsv');

/**
 * Lee exclusivamente el JSON versionado del servidor y valida referencias y claves de evaluación.
 * @returns {Promise<object>} Paquete editorial privado; nunca importarlo desde el frontend.
 * @throws {Error} Ante JSON inválido, referencias incoherentes o materiales que aún no estén autorizados.
 */
export async function readAlphabetSource() {
  const raw = await readFile(
    new URL('../../content/alphabet/module-01.json', import.meta.url),
    'utf8',
  );
  return alphabetPackageSchema.parse(JSON.parse(raw));
}
