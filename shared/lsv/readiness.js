import { LSV_LETTERS } from './labels.js';

/**
 * Criterios mínimos propuestos para considerar una letra. Son un punto de partida para acordar con
 * las personas revisoras de LSV; cambiarlos exige documentarlo en docs/lsv-recognition-roadmap.md.
 */
export const READINESS_CRITERIA = Object.freeze({
  participants: Object.freeze({ train: 6, validation: 2, test: 2 }),
  samplesPerParticipant: 3,
  hands: Object.freeze(['Left', 'Right']),
  minTestSamples: 20,
  minRecall: 0.9,
  maxNoneFalsePositiveRate: 0.05,
  motionLetters: Object.freeze(['J', 'Ñ', 'Z']),
});

const handOf = (sample) => sample.hand ?? sample.frames?.[0]?.hand;

/**
 * Evalúa, solo con metadatos de muestras revisadas, si cada letra tiene datos suficientes para entrenar
 * y evaluar. No genera ni completa muestras y no estima precisión.
 * @param {object[]} samples Grabaciones con label, partition, participantId, reviewStatus y mano.
 * @param {object} [criteria] Criterios; por defecto READINESS_CRITERIA.
 * @returns {object[]} Una fila por letra: estado NO_DATA, INSUFFICIENT_DATA o READY_FOR_EVALUATION y faltantes.
 */
export function letterReadiness(samples, criteria = READINESS_CRITERIA) {
  return LSV_LETTERS.map((label) => {
    const reviewed = samples.filter(
      (item) => item.label === label && item.reviewStatus === 'APPROVED_LSV',
    );
    const motion = criteria.motionLetters.includes(label);
    if (!reviewed.length)
      return { label, motion, status: 'NO_DATA', reviewed: 0, missing: ['Sin muestras revisadas'] };
    const missing = [];
    for (const [partition, required] of Object.entries(criteria.participants)) {
      const counts = new Map();
      for (const item of reviewed.filter((sample) => sample.partition === partition)) {
        const person = item.participantId.toLowerCase();
        counts.set(person, (counts.get(person) ?? 0) + 1);
      }
      const people = [...counts.values()].filter(
        (count) => count >= criteria.samplesPerParticipant,
      ).length;
      if (people < required)
        missing.push(
          `${partition}: ${people}/${required} personas con ${criteria.samplesPerParticipant}+ muestras`,
        );
    }
    for (const hand of criteria.hands)
      if (!reviewed.some((item) => handOf(item) === hand))
        missing.push(`Sin ejemplos con mano ${hand}`);
    return {
      label,
      motion,
      status: missing.length ? 'INSUFFICIENT_DATA' : 'READY_FOR_EVALUATION',
      reviewed: reviewed.length,
      missing,
    };
  });
}

/**
 * Interpreta el informe de prueba de trainLsvModel por letra. El mejor estado posible es
 * CANDIDATE_FOR_LSV_REVIEW: publicar requiere además la aprobación de personas competentes en LSV.
 * @param {{confusionMatrix: object}} report Informe del conjunto de prueba independiente.
 * @param {object} [criteria] Criterios; por defecto READINESS_CRITERIA.
 * @returns {{noneFalsePositiveRate: number | null, letters: object[]}} Decisión por letra presente en el informe.
 */
export function publicationCandidates(report, criteria = READINESS_CRITERIA) {
  const matrix = report.confusionMatrix ?? {};
  const total = (row) => Object.values(row ?? {}).reduce((sum, value) => sum + value, 0);
  const none = matrix.NONE;
  const noneFalse = none ? total(none) - (none.NONE ?? 0) - (none.UNSURE ?? 0) : 0;
  const noneFalsePositiveRate = none && total(none) ? noneFalse / total(none) : null;
  const noneOk =
    noneFalsePositiveRate !== null && noneFalsePositiveRate <= criteria.maxNoneFalsePositiveRate;
  const letters = Object.keys(matrix)
    .filter((label) => label !== 'NONE')
    .map((label) => {
      const tests = total(matrix[label]);
      const recall = tests ? (matrix[label][label] ?? 0) / tests : 0;
      let status = 'CANDIDATE_FOR_LSV_REVIEW';
      if (tests < criteria.minTestSamples) status = 'INSUFFICIENT_TEST_DATA';
      else if (recall < criteria.minRecall || !noneOk) status = 'BELOW_THRESHOLD';
      return { label, tests, recall, status };
    });
  return { noneFalsePositiveRate, letters };
}
