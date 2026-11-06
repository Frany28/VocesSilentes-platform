import { validateVideoInterval } from '../../../shared/lsv/video-source.js';
import { PILOT_LABELS } from '../../../shared/lsv/coverage.js';

/**
 * Valida fuentes/anotaciones antes de abrir el navegador; no infiere datos humanos faltantes.
 * @param {unknown} value Manifiesto local editado manualmente.
 * @returns {object} Manifiesto consistente, aunque permisos y personas sigan pendientes.
 * @throws {Error} IDs repetidos, intervalos incompatibles o referencias desconocidas.
 */
export function validatePreparationManifest(value) {
  const code = (input) => typeof input === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(input);
  if (
    value?.version !== 1 ||
    !Array.isArray(value.sources) ||
    !value.sources.length ||
    value.sources.length > 20 ||
    !Array.isArray(value.candidates) ||
    !value.candidates.length ||
    value.candidates.length > 100 ||
    !Array.isArray(value.participants) ||
    !Array.isArray(value.observedSignants)
  )
    throw new Error(
      'Manifiesto inválido: fuentes, candidatos y registros de personas deben ser explícitos.',
    );
  for (const list of [
    value.sources,
    value.candidates,
    value.participants,
    value.observedSignants,
  ]) {
    if (
      list.some((item) => !code(item.id)) ||
      new Set(list.map((item) => item.id.toLowerCase())).size !== list.length
    )
      throw new Error('Hay identificadores inválidos o repetidos en el manifiesto.');
  }
  for (const source of value.sources) {
    if (
      typeof source.file !== 'string' ||
      !/^[a-f0-9]{64}$/.test(source.sha256 ?? '') ||
      !Number.isFinite(source.duration) ||
      source.duration <= 0
    )
      throw new Error('Falta un archivo, huella o duración de origen verificable.');
  }
  for (const candidate of value.candidates) {
    const source = value.sources.find((item) => item.id === candidate.videoId);
    if (
      !source ||
      !code(candidate.executionId) ||
      !code(candidate.observedSignant) ||
      !value.observedSignants.some(
        (item) => item.id === candidate.observedSignant && item.videoId === candidate.videoId,
      ) ||
      (candidate.label !== null && !PILOT_LABELS.includes(candidate.label)) ||
      !Number.isInteger(candidate.startMs) ||
      !Number.isInteger(candidate.endMs)
    )
      throw new Error('Candidato sin referencia de fuente/señante, etiqueta o límites válidos.');
    validateVideoInterval(candidate.startMs / 1000, candidate.endMs / 1000, source.duration);
  }
  return value;
}
