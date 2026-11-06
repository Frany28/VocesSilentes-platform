import { syntheticRecording } from './lsv-synthetic.js';

/**
 * Añade procedencia ficticia para verificar contratos; no contiene una ejecución ni autorización de personas reales.
 * @param {string} [label] Etiqueta numérica de prueba.
 * @param {string} [partition] Grupo independiente de prueba.
 * @param {number} [offset] Variación numérica identificada.
 * @returns {object} Fixture de software, excluido de cualquier modelo distribuido.
 */
export function syntheticVideoRecording(label = 'A', partition = 'train', offset = 0) {
  return {
    ...syntheticRecording(label, partition, offset),
    source: {
      type: 'LOCAL_VIDEO',
      sha256: { train: 'a', validation: 'b', test: 'c' }[partition].repeat(64),
      executionId: `synthetic_${partition}_${label}`,
      origin: 'Software fixture, not actual footage',
      authorization: 'Synthetic software test only',
      authorized: true,
      startMs: label === 'NONE' ? 3000 : 0,
      endMs: label === 'NONE' ? 5000 : 2000,
    },
  };
}
