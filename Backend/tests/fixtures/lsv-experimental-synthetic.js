import { syntheticRecording } from './lsv-synthetic.js';

/**
 * Contrato provisional sintético exclusivo de pruebas; no representa ejecuciones LSV reales.
 * @param {string} [label] Categoría artificial A o NONE.
 * @returns {object} Muestra con confirmación de prueba sin revisión experta.
 */
export function syntheticExperimental(label = 'A') {
  return {
    ...syntheticRecording(label, 'train'),
    type: 'LOCAL_EXPERIMENTAL_SAMPLE',
    partition: null,
    reviewStatus: 'PENDING_LSV_REVIEW',
    reviewerId: null,
    observedSignant: null,
    source: { type: 'CAMERA' },
    labelConfirmation: {
      status: 'MANUALLY_CONFIRMED',
      label,
      reviewerId: 'software_fixture',
      confirmedAt: '2026-11-06T12:00:00Z',
    },
  };
}
