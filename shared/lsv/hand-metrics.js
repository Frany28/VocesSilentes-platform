import { predictSequence } from './classifier.js';
import { sequenceFeatures } from './sequence.js';

const labels = ['A', 'E', 'I', 'O', 'U', 'NONE'];
const ratio = (n, d) => (d ? n / d : null);

/**
 * Evalúa únicamente capturas reales externas al entrenamiento; NONE correcto sigue siendo una abstención del modelo.
 * @param {object} model Modelo validado.
 * @param {object[]} test Capturas independientes, jamás reflejos ni ejemplos de entrenamiento.
 * @returns {object} Conteos, métricas por mano/letra, matrices, motivos y tiempos medidos en este equipo.
 * @throws {Error} Muestra artificial en la evaluación.
 */
export function evaluateHands(model, test) {
  const observations = test.map((sample) => {
    if (sample.sampleKind && sample.sampleKind !== 'REAL')
      throw new Error('Las pruebas requieren grabaciones reales independientes');
    const start = globalThis.performance.now();
    const prediction = predictSequence(
      model,
      sequenceFeatures(sample.frames),
      sample.frames[0].hand,
    );
    return {
      id: sample.id,
      hand: sample.frames[0].hand,
      expected: sample.label,
      predicted: prediction.label ?? (prediction.reason === 'BACKGROUND' ? 'NONE' : 'UNSURE'),
      reason: prediction.reason,
      abstained: prediction.label === null,
      inferenceMs: globalThis.performance.now() - start,
    };
  });
  const byHand = Object.fromEntries(
    ['Left', 'Right'].map((hand) => {
      const rows = observations.filter((row) => row.hand === hand);
      const matrix = Object.fromEntries(
        labels.map((label) => [
          label,
          Object.fromEntries(
            [...labels, 'UNSURE'].map((result) => [
              result,
              rows.filter((row) => row.expected === label && row.predicted === result).length,
            ]),
          ),
        ]),
      );
      const perLetter = Object.fromEntries(
        labels.map((label) => {
          const tp = matrix[label][label];
          const support = rows.filter((row) => row.expected === label).length;
          const predicted = rows.filter((row) => row.predicted === label).length;
          return [
            label,
            {
              support,
              precision: ratio(tp, predicted),
              recall: ratio(tp, support),
              f1: support ? ratio(2 * tp, support + predicted) : null,
            },
          ];
        }),
      );
      const correct = rows.filter((row) => row.expected === row.predicted).length;
      const times = rows.map((row) => row.inferenceMs).sort((a, b) => a - b);
      return [
        hand,
        {
          total: rows.length,
          correct,
          errors: rows.length - correct,
          accuracy: ratio(correct, rows.length),
          abstentions: rows.filter((row) => row.abstained).length,
          uncertain: rows.filter((row) => row.predicted === 'UNSURE').length,
          reasons: Object.fromEntries(
            [...new Set(rows.map((row) => row.reason))].map((reason) => [
              reason,
              rows.filter((row) => row.reason === reason).length,
            ]),
          ),
          perLetter,
          confusionMatrix: matrix,
          inferenceMs: {
            mean: ratio(
              times.reduce((sum, t) => sum + t, 0),
              times.length,
            ),
            p95: times.length ? times[Math.ceil(times.length * 0.95) - 1] : null,
          },
        },
      ];
    }),
  );
  return { total: test.length, byHand, observations, timingIncludesFeatureExtraction: true };
}
