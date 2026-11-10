import { validateExperimentalRecording } from './experimental-recording.js';
import { trainExperimentalModel } from './experimental-train.js';
import { createSampleRegistry } from './sample-conflicts.js';
import { mirrorFrames } from './handedness.js';
import { evaluateHands } from './hand-metrics.js';

/**
 * Ejecuta A derecha, B ambas manos y C con reflejo validado sobre la misma prueba real reservada por persona.
 * @param {object[]} samples Exportaciones experimentales auténticas; evaluación explícita train/test.
 * @param {object|null} [augmentation] Validación documental opcional; C queda bloqueado si no existe.
 * @returns {object} Modelos separados y métricas disponibles, siempre preliminares y sin notas académicas.
 * @throws {Error} Duplicados, reflejos reutilizados o participantes entre entrenamiento y prueba.
 */
export function compareHandExperiments(samples, augmentation = null) {
  const registry = createSampleRegistry();
  const fingerprints = new Set();
  const records = samples.map((input) => {
    const sample = validateExperimentalRecording(input, true);
    if (!['A', 'E', 'I', 'O', 'U', 'NONE'].includes(sample.label))
      throw new Error('La comparación bilateral admite solo vocales LSV y NONE');
    registry.add({
      ...sample,
      participantId: sample.participantId ?? sample.observedSignant ?? 'unknown',
      partition: sample.evaluationPartition,
    });
    const fingerprint = (frames) =>
      JSON.stringify(
        frames.map((frame) => frame.points.map((point) => point.map((v) => Math.round(v * 1e7)))),
      );
    const direct = fingerprint(sample.frames);
    const reflected = fingerprint(mirrorFrames(sample.frames));
    if (fingerprints.has(direct) || fingerprints.has(reflected))
      throw new Error('Una captura o su reflejo se reutiliza como muestra independiente');
    fingerprints.add(direct);
    fingerprints.add(reflected);
    return sample;
  });
  const reserved = records.filter((sample) => sample.evaluationPartition === 'test');
  const training = records.filter((sample) => sample.evaluationPartition === 'train');
  const unknownTrainingParticipants = training.some((sample) => !sample.participantId);
  const test = unknownTrainingParticipants ? [] : reserved;
  const experiments = {};
  for (const name of ['A', 'B', 'C']) {
    if (name === 'C' && !augmentation) {
      experiments.C = {
        status: 'BLOCKED',
        reason: 'Falta validación documentada del reflejo',
        metrics: null,
      };
      continue;
    }
    const selected = training.filter((sample) => name !== 'A' || sample.frames[0].hand === 'Right');
    try {
      const result = trainExperimentalModel(selected, {
        augmentation: name === 'C' ? augmentation : null,
      });
      experiments[name] = {
        ...result,
        status: 'PRELIMINARY_TECHNICAL_ONLY',
        metrics: evaluateHands(result.model, test),
        missingTraining: ['Left', 'Right'].flatMap((hand) =>
          ['A', 'E', 'I', 'O', 'U', 'NONE']
            .filter(
              (label) => !result.model.prototypes.some((s) => s.hand === hand && s.label === label),
            )
            .map((label) => ({ hand, label })),
        ),
      };
    } catch (error) {
      experiments[name] = { status: 'BLOCKED', reason: error.message, metrics: null };
    }
  }
  return {
    version: 1,
    status: 'PRELIMINARY_TECHNICAL_ONLY',
    academicGrading: false,
    evaluation: {
      method: 'EXPLICIT_PARTICIPANT_HOLDOUT',
      testSamples: test.length,
      reservedTestSamples: reserved.length,
      independenceVerified: test.length > 0,
      unknownTrainingParticipants,
      testIds: test.map((s) => s.id),
      trainingIds: training.map((s) => s.id),
      warning: unknownTrainingParticipants
        ? 'Participantes de entrenamiento sin identificar: no se puede verificar independencia ni calcular métricas.'
        : 'Etiquetas provisionales y umbrales heurísticos. Sin pruebas reservadas, métricas null por mano.',
    },
    experiments,
  };
}
