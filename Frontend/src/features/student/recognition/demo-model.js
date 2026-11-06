import { validateModel } from '../../../../../shared/lsv/classifier.js';

/**
 * Descarga únicamente el artefacto educativo del mismo sitio; nunca sube puntos ni solicita cámara.
 * @param {AbortSignal} signal Cancelación al abandonar la práctica.
 * @returns {Promise<object>} Modelo de nueve ejecuciones reales con documentación pendiente explícita.
 * @throws {Error} HTTP, JSON, tamaño, versión o contrato incompatibles.
 */
export async function readDemoModel(signal) {
  const response = await fetch('/models/lsv-vowels-demo-v1.json', { signal, credentials: 'omit' });
  if (!response.ok)
    throw new Error('No se pudo descargar el modelo de vocales. Reintenta la carga.');
  if (!response.headers.get('content-type')?.includes('application/json'))
    throw new Error('El modelo de vocales aún no está disponible en este despliegue.');
  const text = await response.text();
  signal.throwIfAborted();
  if (text.length > 8 * 1024 * 1024) throw new Error('El modelo supera el tamaño permitido');
  const model = validateModel(JSON.parse(text));
  if (model.usage !== 'EDUCATIONAL_DEMONSTRATION' || model.releaseId !== 'vowels-demo-v1')
    throw new Error('La versión publicada no corresponde al modelo de vocales');
  return model;
}
