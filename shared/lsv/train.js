import { LSV_LABELS } from './labels.js';
import { sequenceDistance } from './sequence.js';
import { predictSequence, validateModel } from './classifier.js';

/**
 * Aprende prototipos de secuencias y radios de abstención con calibración independiente del entrenamiento.
 * @param {object} dataset Muestras revisadas y separación validada por persona.
 * @param {string[]} labels Etiquetas del experimento, incluida NONE; no se asume cobertura de las 27 letras.
 * @returns {object} Modelo experimental y métricas reales del conjunto test, sin aprobar publicación ni progreso.
 * @throws {Error} Falta de clases o lateralidad compatible para calibrar.
 */
export function trainLsvModel(dataset, labels) {
  if (
    labels.length < 2 ||
    !labels.includes('NONE') ||
    new Set(labels).size !== labels.length ||
    labels.some((label) => !LSV_LABELS.includes(label))
  )
    throw new Error('Selecciona letras válidas e incluye NONE');
  const records = dataset.records.filter((sample) => labels.includes(sample.label));
  const prototypes = [];
  const radii = {};
  for (const label of labels) {
    for (const partition of ['train', 'validation', 'test']) {
      if (!records.some((sample) => sample.label === label && sample.partition === partition))
        throw new Error(`Faltan muestras revisadas de ${label} en ${partition}`);
    }
    for (const hand of ['Left', 'Right']) {
      const training = records.filter(
        (sample) => sample.label === label && sample.hand === hand && sample.partition === 'train',
      );
      const positions = new Set([0, Math.floor((training.length - 1) / 2), training.length - 1]);
      for (const index of positions) {
        const sample = training[index];
        if (sample) prototypes.push({ label, hand, sequence: sample.sequence });
      }
    }
    const distances = records
      .filter((sample) => sample.label === label && sample.partition === 'validation')
      .map((sample) => {
        const candidates = prototypes.filter(
          (prototype) => prototype.label === label && prototype.hand === sample.hand,
        );
        if (!candidates.length)
          throw new Error(`Falta entrenamiento de la mano observada en ${label}`);
        return Math.min(
          ...candidates.map((prototype) => sequenceDistance(sample.sequence, prototype.sequence)),
        );
      })
      .sort((left, right) => left - right);
    radii[label] = distances[Math.floor((distances.length - 1) * 0.95)];
  }
  const model = validateModel({
    version: 1,
    algorithm: 'LSV_DTW_1NN',
    status: 'EXPERIMENTAL',
    labels,
    prototypes,
    radii,
    featureVersion: 'screen-pose-wrist-v1',
    sources: dataset.sources,
    partitions: Object.fromEntries(
      ['train', 'validation', 'test'].map((partition) => [
        partition,
        {
          samples: records.filter((sample) => sample.partition === partition).length,
          participants: [
            ...new Set(
              records
                .filter((sample) => sample.partition === partition)
                .map((sample) => sample.participantId),
            ),
          ],
        },
      ]),
    ),
  });
  const matrix = {};
  let correct = 0;
  let total = 0;
  let abstained = 0;
  for (const sample of records.filter((item) => item.partition === 'test')) {
    const prediction = predictSequence(model, sample.sequence, sample.hand);
    const result = prediction.label ?? (prediction.reason === 'BACKGROUND' ? 'NONE' : 'UNSURE');
    matrix[sample.label] ??= {};
    matrix[sample.label][result] = (matrix[sample.label][result] ?? 0) + 1;
    if (result === sample.label) correct += 1;
    if (result === 'UNSURE') abstained += 1;
    total += 1;
  }
  return {
    model,
    report: {
      status: 'EXPERIMENTAL',
      total,
      correct,
      abstained,
      accuracy: correct / total,
      confusionMatrix: matrix,
      partitions: model.partitions,
      warning:
        'Resultados de este dataset; no constituyen validación lingüística ni autorización para calificar estudiantes.',
    },
  };
}
