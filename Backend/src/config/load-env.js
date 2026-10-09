import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';

/**
 * Carga Backend/.env sin sobrescribir variables del proceso ni registrar valores.
 * @returns {void}
 */
export function loadEnv() {
  config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });
}
