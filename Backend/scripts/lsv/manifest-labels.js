import { LSV_LABELS } from '../../../shared/lsv/labels.js';
import { PILOT_LABELS } from '../../../shared/lsv/coverage.js';

/**
 * Conserva el alcance histórico del piloto y permite manifiestos explícitos de las 27 letras y NONE.
 * @param {object} manifest Manifiesto de anotaciones humanas.
 * @returns {string[]} Clases declaradas antes de procesar los videos.
 * @throws {Error} Clases inválidas, repetidas o sin categoría negativa.
 */
export function manifestLabels(manifest) {
  const labels = manifest.labels ?? manifest.pilotLabels ?? PILOT_LABELS;
  if (
    !Array.isArray(labels) ||
    labels.length < 2 ||
    !labels.includes('NONE') ||
    new Set(labels).size !== labels.length ||
    labels.some((label) => !LSV_LABELS.includes(label))
  )
    throw new Error('Declara letras válidas y NONE en labels del manifiesto.');
  return labels;
}
