import { publicConfig } from '../../../lib/config.js';
import { readLearning } from './learning.api.js';

/**
 * Contrato compartido por catálogo real y demo explícita de diseño.
 * @typedef {object} StudentSnapshot
 * @property {'demo'|'unavailable'|'api'} source Origen explícito de los datos.
 * @property {object[]} modules Módulos publicados, lecciones y disponibilidad del adaptador.
 */

/**
 * Consulta la API salvo en demo explícita; un fallo de red nunca se sustituye por fixtures.
 * @param {AbortSignal} signal Cancelación de navegación.
 * @param {string} [scenario] Variante de demostración seleccionada.
 * @returns {Promise<StudentSnapshot>} Datos identificados; propaga errores de transporte.
 */
export async function readStudentSnapshot(signal, scenario = 'progress') {
  signal.throwIfAborted();
  if (publicConfig.studentDemo) {
    const { readDemoSnapshot } = await import('./student-demo.js');
    return readDemoSnapshot(signal, scenario);
  }
  return readLearning(signal);
}
