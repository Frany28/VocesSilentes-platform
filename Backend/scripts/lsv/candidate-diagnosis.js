import { PILOT_LABELS, DATA_PARTITIONS } from '../../../shared/lsv/coverage.js';

/**
 * Enumera requisitos estructurales completos y del piloto reducido sin entrenar ni usar test para elegir precisión.
 * @param {object[]} records Candidatos técnicos, incluidos rechazos y etiquetas desconocidas.
 * @param {object[]} ready Muestras elegibles tras permisos, personas, contrato y revisión LSV.
 * @param {object} manifest Declaraciones explícitas de participantes y permisos.
 * @returns {object} Cobertura real, celdas faltantes y métricas null mientras no haya entrenamiento independiente.
 */
export function candidateDiagnosis(records, ready, manifest) {
  const classes = PILOT_LABELS.map((label) => {
    const candidates = records.filter((item) => item.label === label);
    const approved = ready.filter((item) => item.label === label);
    const partitions = Object.fromEntries(
      DATA_PARTITIONS.map((partition) => [
        partition,
        approved.filter((item) => item.partition === partition).length,
      ]),
    );
    return {
      label,
      candidates: candidates.length,
      validGeometry: candidates.filter((item) => item.technicalStatus === 'VALID_GEOMETRY').length,
      approved: approved.length,
      partitions,
      missingPartitions: DATA_PARTITIONS.filter((partition) => partitions[partition] === 0),
    };
  });
  const covered = classes
    .filter((item) => !item.missingPartitions.length)
    .map((item) => item.label);
  const reducedLabels = covered.includes('NONE') && covered.length > 1 ? covered : [];
  return {
    status: classes.every((item) => !item.missingPartitions.length)
      ? 'STRUCTURALLY_READY'
      : 'BLOCKED',
    trainingExecuted: false,
    classes,
    unlabelledCandidates: records.filter((item) => item.label === null).length,
    confirmedParticipants: manifest.participants.filter((item) => item.confirmed === true).length,
    minimumIndependentParticipants: 3,
    missingApprovedSampleCells: classes.flatMap((item) =>
      item.missingPartitions.map((partition) => ({
        label: item.label,
        partition,
        minimumApprovedSamples: 1,
      })),
    ),
    reducedPilot: {
      structurallyReady: reducedLabels.length > 0,
      labels: reducedLabels,
      minimumClasses: 2,
      mustInclude: 'NONE',
      minimumApprovedSamples: 6,
    },
    evaluation: {
      status: 'NOT_RUN',
      accuracy: null,
      confusionMatrix: null,
      errors: null,
      abstentions: null,
      physicalCameraTest: 'NOT_RUN',
    },
    warning:
      'Cobertura estructural mínima no equivale a validación LSV ni autoriza calificación académica.',
  };
}
