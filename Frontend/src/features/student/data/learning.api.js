import { requestJson } from '../../../lib/http.js';

/**
 * Consulta contenido publicado real y el progreso propio, con cancelación de navegación.
 * @param {AbortSignal} signal Cancelación del consumidor.
 * @returns {Promise<object>} Snapshot confirmado por el backend; propaga ApiError.
 */
export async function readLearning(signal) {
  return (await requestJson('learning', { signal })).data;
}

/**
 * Guarda un avance declarado manualmente; no envía identidad ni resultados de reconocimiento.
 * @param {'lessons'|'exercises'} kind Tipo de contenido.
 * @param {string} id UUID confirmado por el catálogo.
 * @param {string} status Estado solicitado.
 * @param {AbortSignal} signal Cancelación de transporte.
 * @returns {Promise<object>} Progreso persistido; el servidor determina permisos y fechas.
 */
export async function writeLearningProgress(kind, id, status, signal) {
  const { data } = await requestJson('auth/csrf', { signal });
  return (
    await requestJson(`learning/${kind}/${id}/progress`, {
      method: 'PUT',
      signal,
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': data.csrfToken },
      body: JSON.stringify({ status }),
    })
  ).data.progress;
}
