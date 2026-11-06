import { validateModel } from './classifier.js';

/**
 * Deriva un artefacto de inferencia para la demostración autorizada, sin publicar el lote ni su auditoría privada.
 * @param {object} input Modelo provisional real ya entrenado.
 * @returns {object} Modelo EXPERIMENTAL publicable para práctica educativa, sin calificación.
 * @throws {Error} Modelo de entrenamiento incompatible.
 */
export function createDemoRelease(input) {
  const model = validateModel(input);
  if (model.trainingMode !== 'LOCAL_PROVISIONAL' || model.usage !== 'LOCAL_DEVELOPMENT_ONLY')
    throw new Error('Se necesita el modelo provisional local original');
  return validateModel({
    version: model.version,
    algorithm: model.algorithm,
    status: 'EXPERIMENTAL',
    trainingMode: model.trainingMode,
    usage: 'EDUCATIONAL_DEMONSTRATION',
    releaseId: 'vowels-demo-v1',
    featureVersion: model.featureVersion,
    linguisticValidation: model.linguisticValidation,
    partitions: null,
    metrics: null,
    labels: model.labels,
    prototypes: model.prototypes,
    radii: model.radii,
    abstention: model.abstention,
    documentation: {
      sampleCount: model.prototypes.length,
      labelReview: 'OWNER_CONFIRMED_PROVISIONAL',
      expertLsvReview: 'PENDING',
      sourceAuthorization: 'DECLARED_PENDING_EVIDENCE',
      independentEvaluation: false,
      academicGrading: false,
      publication: 'OWNER_AUTHORIZED_EDUCATIONAL_DEMO_2026_11_06',
    },
  });
}
