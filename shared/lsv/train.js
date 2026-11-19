import { LSV_LABELS } from './labels.js';
import { validateModel } from './classifier.js';
import { prepareTrainingData } from './training-data.js';
import { selectPrototypes, calibrationRadii } from './train-prototypes.js';
import { evaluateLsvModel } from './model-evaluation.js';
import { labelReadiness, publicationCandidates } from './readiness.js';

/**
 * Entrena el DTW existente con train, calibra con validation y mide test separado por participante.
 * Revalida los registros para impedir que un llamador salte consentimiento o separación de personas.
 * @param {object} dataset Muestras preparadas y hashes de los archivos explícitamente autorizados.
 * @param {string[]} labels Clases fijadas antes de observar test, incluida NONE.
 * @returns {object} Modelo de investigación y métricas del lote, nunca un modelo validado ni una calificación.
 * @throws {Error} Contratos, revisión, negativos, duplicados, particiones o calibración incompatibles.
 */
export function trainLsvModel(dataset, labels) {
  if (
    !Array.isArray(labels) ||
    labels.length < 2 ||
    !labels.includes('NONE') ||
    new Set(labels).size !== labels.length ||
    labels.some((label) => !LSV_LABELS.includes(label))
  )
    throw new Error('Selecciona letras válidas e incluye NONE');
  const prepared = prepareTrainingData(dataset.records, labels);
  const records = prepared.records.filter((sample) => labels.includes(sample.label));
  for (const label of labels)
    for (const partition of ['train', 'validation', 'test'])
      if (!records.some((sample) => sample.label === label && sample.partition === partition))
        throw new Error(`Faltan muestras revisadas de ${label} en ${partition}`);
  const prototypes = labels.flatMap((label) =>
    ['Left', 'Right'].flatMap((hand) =>
      selectPrototypes(
        records.filter(
          (sample) =>
            sample.label === label && sample.hand === hand && sample.partition === 'train',
        ),
      ).map((sample) => ({ label, hand, sequence: sample.sequence })),
    ),
  );
  const model = validateModel({
    version: 1,
    algorithm: 'LSV_DTW_1NN',
    status: 'EXPERIMENTAL',
    usage: 'LOCAL_RESEARCH_ONLY',
    academicGrading: false,
    labels,
    prototypes,
    ...calibrationRadii(records, prototypes, labels),
    featureVersion: 'screen-pose-wrist-v1',
    sources: dataset.sources,
    prototypeSelection: 'TRAIN_ONLY_FARTHEST_FIRST_3_PER_HAND',
    partitions: Object.fromEntries(
      ['train', 'validation', 'test'].map((partition) => [
        partition,
        {
          samples: records.filter((sample) => sample.partition === partition).length,
          participants: [
            ...new Set(
              records.filter((s) => s.partition === partition).map((s) => s.participantId),
            ),
          ].sort(),
        },
      ]),
    ),
  });
  const report = {
    status: 'EXPERIMENTAL',
    ...evaluateLsvModel(model, records),
    partitions: model.partitions,
    dataReadiness: labelReadiness(records, undefined, labels),
    protocol: {
      split: 'PARTICIPANT_HOLDOUT',
      calibration: 'VALIDATION_ONLY_P95_NEAREST_RANK_PER_LABEL_HAND',
      featureVersion: model.featureVersion,
      prototypeSelection: model.prototypeSelection,
      academicGrading: false,
    },
    warning:
      'Métricas de este lote; no autorizan publicación, validación LSV ni calificación académica.',
  };
  report.publication = publicationCandidates(report);
  return { model, report };
}
