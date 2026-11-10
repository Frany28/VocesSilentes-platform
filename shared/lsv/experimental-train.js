import { validateExperimentalRecording } from './experimental-recording.js';
import { createSampleRegistry } from './sample-conflicts.js';
import { experimentalPrototypes } from './experimental-prototypes.js';
import { validateModel } from './classifier.js';

/**
 * Aprende ejemplos confirmados sin particiones ni métricas; los umbrales son heurísticos, sin calibración.
 * @param {object[]} samples Ejecuciones reales con confirmación provisional manual.
 * @param {{augmentation?: object|null}} [options] Reflejo desactivado por defecto; exige validación documentada.
 * @returns {object} Artefacto local EXPERIMENTAL e informe documental sin exactitud.
 * @throws {Error} Falta de confirmación, NONE, letras, geometría o ejecuciones únicas.
 */
export function trainExperimentalModel(samples, { augmentation = null } = {}) {
  if (!Array.isArray(samples) || !samples.length || samples.length > 168)
    throw new Error('Usa entre 1 y 168 ejecuciones experimentales');
  const registry = createSampleRegistry();
  const records = samples.map((input) => {
    const sample = validateExperimentalRecording(input, true);
    if (sample.evaluationPartition !== 'train')
      throw new Error('No entrenes con la prueba reservada; utiliza la comparación A/B/C');
    registry.add({
      ...sample,
      participantId: sample.participantId ?? sample.observedSignant ?? 'unknown',
    });
    return sample;
  });
  const labels = [...new Set(records.map((sample) => sample.label))].sort();
  if (labels.length < 2 || !labels.includes('NONE'))
    throw new Error('Incluye al menos una letra confirmada y una ejecución NONE');
  const { prototypes, radii, augmented } = experimentalPrototypes(records, augmentation);
  const model = validateModel({
    version: 1,
    algorithm: 'LSV_DTW_1NN',
    status: 'EXPERIMENTAL',
    trainingMode: 'LOCAL_PROVISIONAL',
    usage: 'LOCAL_DEVELOPMENT_ONLY',
    featureVersion: 'screen-pose-wrist-v1',
    labels,
    prototypes,
    radii,
    abstention: { method: 'UNCALIBRATED_HEURISTIC', minimumRelativeMargin: 0.15 },
    linguisticValidation: 'PENDING_LSV_REVIEW',
    partitions: null,
    metrics: null,
    augmentation: augmentation ?? null,
    augmentedAudit: augmented.map(({ id, parentId, hand, transform }) => ({
      id,
      parentId,
      hand,
      transform,
    })),
    sampleAudit: records.map((sample) => ({
      id: sample.id,
      label: sample.label,
      hand: sample.frames[0].hand,
      sampleKind: 'REAL',
      participantId: sample.participantId,
      observedSignant: sample.observedSignant,
      consent: sample.consent,
      reviewStatus: sample.reviewStatus,
      labelConfirmation: sample.labelConfirmation,
      source: sample.source,
    })),
  });
  return {
    model,
    report: {
      status: 'EXPERIMENTAL',
      trainingMode: 'LOCAL_PROVISIONAL',
      samples: records.length,
      augmentedSamples: augmented.length,
      byHand: Object.fromEntries(
        ['Left', 'Right'].map((hand) => [
          hand,
          {
            real: records.filter((sample) => sample.frames[0].hand === hand).length,
            augmented: augmented.filter((sample) => sample.hand === hand).length,
          },
        ]),
      ),
      counts: Object.fromEntries(
        labels.map((label) => [label, records.filter((s) => s.label === label).length]),
      ),
      partitions: null,
      accuracy: null,
      independentEvaluation: false,
      warning:
        'Demostración por ejemplos. Sin revisión experta ni evaluación independiente. Umbrales sin calibrar.',
    },
  };
}
