import { predictSequence } from './classifier.js';
import { classificationMetrics } from './metrics.js';

/**
 * Evalúa el DTW en test sin ajustar prototipos, radios ni etiquetas a partir de sus resultados.
 * @param {object} model Modelo experimental.
 * @param {object[]} records Registros preparados con identidad seudónima y secuencia validada.
 * @returns {object} Métricas reproducibles globales/por mano y predicciones auditables sin landmarks.
 * @throws {Error} Hay clases de prueba ajenas al modelo.
 */
export function evaluateLsvModel(model, records) {
  const observations = records
    .filter((sample) => sample.partition === 'test')
    .map((sample) => {
      const prediction = predictSequence(model, sample.sequence, sample.hand);
      return {
        id: sample.id,
        participantId: sample.participantId,
        hand: sample.hand,
        expected: sample.label,
        predicted: prediction.label ?? (prediction.reason === 'BACKGROUND' ? 'NONE' : 'UNSURE'),
        reason: prediction.reason,
      };
    });
  return {
    ...classificationMetrics(observations, model.labels),
    byHand: Object.fromEntries(
      ['Left', 'Right'].map((hand) => [
        hand,
        classificationMetrics(
          observations.filter((sample) => sample.hand === hand),
          model.labels,
        ),
      ]),
    ),
    observations,
  };
}
