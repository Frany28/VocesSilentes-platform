import { validateExperimentalRecording } from './experimental-recording.js';
import { createSampleRegistry } from './sample-conflicts.js';
import { sequenceFeatures, sequenceDistance } from './sequence.js';
import { validateModel } from './classifier.js';

/**
 * Aprende ejemplos confirmados sin particiones ni métricas; los umbrales son heurísticos, sin calibración.
 * @param {object[]} samples Ejecuciones reales con confirmación provisional manual.
 * @returns {object} Artefacto local EXPERIMENTAL e informe documental sin exactitud.
 * @throws {Error} Falta de confirmación, NONE, letras, geometría o ejecuciones únicas.
 */
export function trainExperimentalModel(samples) {
  if (!Array.isArray(samples) || !samples.length || samples.length > 168)
    throw new Error('Usa entre 1 y 168 ejecuciones experimentales');
  const registry = createSampleRegistry();
  const records = samples.map((input) => {
    const sample = validateExperimentalRecording(input, true);
    registry.add({
      ...sample,
      participantId: sample.participantId ?? sample.observedSignant ?? 'unknown',
    });
    return sample;
  });
  const labels = [...new Set(records.map((sample) => sample.label))].sort();
  if (labels.length < 2 || !labels.includes('NONE'))
    throw new Error('Incluye al menos una letra confirmada y una ejecución NONE');
  const prototypes = records.map((sample) => ({
    label: sample.label,
    hand: sample.frames[0].hand,
    sequence: sequenceFeatures(sample.frames),
  }));
  const radii = Object.fromEntries(
    labels.map((label) => {
      const distances = prototypes
        .filter((item) => item.label === label)
        .flatMap((item) =>
          prototypes
            .filter((other) => other.label !== label && other.hand === item.hand)
            .map((other) => sequenceDistance(item.sequence, other.sequence)),
        );
      return [label, Math.min(0.35, ...distances.map((distance) => distance * 0.45))];
    }),
  );
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
    sampleAudit: records.map((sample) => ({
      id: sample.id,
      label: sample.label,
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
