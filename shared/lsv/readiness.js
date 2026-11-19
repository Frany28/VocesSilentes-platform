import { READINESS_CRITERIA } from './readiness-criteria.js';

export { READINESS_CRITERIA } from './readiness-criteria.js';
export { letterReadiness, labelReadiness } from './dataset-readiness.js';

/**
 * Interpreta test independiente sin convertir una buena métrica en autorización de publicación.
 * @param {{confusionMatrix: object, dataReadiness?: object[]}} report Informe del entrenador.
 * @param {object} [criteria] Umbrales técnicos; requieren acuerdo con personas revisoras LSV.
 * @returns {{noneFalsePositiveRate: number|null, letters: object[]}} Candidatos a revisión, nunca aprobaciones.
 */
export function publicationCandidates(report, criteria = READINESS_CRITERIA) {
  const matrix = report.confusionMatrix ?? {};
  const total = (row) => Object.values(row ?? {}).reduce((sum, value) => sum + value, 0);
  const none = matrix.NONE;
  const noneFalse = none ? total(none) - (none.NONE ?? 0) - (none.UNSURE ?? 0) : 0;
  const noneFalsePositiveRate = none && total(none) ? noneFalse / total(none) : null;
  const noneOk =
    noneFalsePositiveRate !== null && noneFalsePositiveRate <= criteria.maxNoneFalsePositiveRate;
  const noneReady = report.dataReadiness?.some(
    (row) => row.label === 'NONE' && row.status === 'READY_FOR_EVALUATION',
  );
  const letters = Object.keys(matrix)
    .filter((label) => label !== 'NONE')
    .map((label) => {
      const tests = total(matrix[label]);
      const recall = tests ? (matrix[label][label] ?? 0) / tests : 0;
      const preparation = report.dataReadiness?.find((row) => row.label === label);
      let status = 'CANDIDATE_FOR_LSV_REVIEW';
      if (tests < criteria.minTestSamples) status = 'INSUFFICIENT_TEST_DATA';
      else if (recall < criteria.minRecall || !noneOk) status = 'BELOW_THRESHOLD';
      else if (!noneReady || !preparation || preparation.status !== 'READY_FOR_EVALUATION')
        status = 'INSUFFICIENT_PARTICIPANT_DATA';
      return { label, tests, recall, status };
    });
  return { noneFalsePositiveRate, letters };
}
