import { isLocalExperiment } from './local-experiment.js';

/**
 * Permite inferencia educativa en contextos seguros; los archivos originales locales siguen restringidos.
 * @param {object} model Modelo validado, sin inferir permisos de su etiqueta objetivo.
 * @returns {void} Lanza si el modelo no está autorizado para este entorno.
 * @throws {Error} Uso local fuera de desarrollo o demostración en origen inseguro.
 */
export function assertModelUsage(model) {
  if (model.trainingMode !== 'LOCAL_PROVISIONAL') return;
  if (model.usage === 'LOCAL_DEVELOPMENT_ONLY' && isLocalExperiment()) return;
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(globalThis.location?.hostname);
  if (
    model.usage === 'EDUCATIONAL_DEMONSTRATION' &&
    (globalThis.location?.protocol === 'https:' || local)
  )
    return;
  throw new Error('Este modelo no está habilitado para el entorno actual');
}
