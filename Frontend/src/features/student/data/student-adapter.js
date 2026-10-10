import { publicConfig } from '../../../lib/config.js';

/**
 * Contrato de presentación separado de los endpoints todavía pendientes.
 * @typedef {object} StudentSnapshot
 * @property {'demo'|'unavailable'|'api'} source Origen explícito de los datos.
 * @property {object[]} modules Módulos publicados, lecciones y disponibilidad del adaptador.
 */

/**
 * Carga la demostración habilitada explícitamente, sin fallback de red ni endpoints inventados.
 * @param {AbortSignal} signal Cancelación de navegación.
 * @param {string} [scenario] Variante de demostración seleccionada.
 * @returns {Promise<StudentSnapshot>} Datos identificados o disponibilidad pendiente.
 */
export async function readStudentSnapshot(signal, scenario = 'progress') {
  signal.throwIfAborted();
  if (publicConfig.studentDemo) {
    const { readDemoSnapshot } = await import('./student-demo.js');
    return readDemoSnapshot(signal, scenario);
  }
  return { source: 'unavailable', modules: [] };
}
