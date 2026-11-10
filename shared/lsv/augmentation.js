import { mirrorFrames } from './handedness.js';
import { sequenceFeatures } from './sequence.js';

/**
 * Genera aumentos solo de entrenamiento y con validación explícita por etiqueta, sin cambiar consentimiento/revisión.
 * @param {object[]} records Capturas reales de entrenamiento ya validadas.
 * @param {object|null} policy Declaración documentada de equivalencia; null desactiva el aumento.
 * @returns {object[]} Derivados separados con trazabilidad al original; nunca datos de prueba.
 * @throws {Error} Falta de evidencia, etiqueta no validada o intento de aumentar una prueba.
 */
export function augmentTraining(records, policy = null) {
  if (!policy) return [];
  if (
    policy.version !== 1 ||
    policy.transform !== 'HORIZONTAL_REFLECTION' ||
    policy.status !== 'VALIDATED_FOR_EXPERIMENT' ||
    !/^[a-zA-Z0-9_-]{1,64}$/.test(policy.reviewerId) ||
    typeof policy.evidenceReference !== 'string' ||
    !policy.evidenceReference.trim() ||
    !Number.isFinite(Date.parse(policy.reviewedAt)) ||
    !Array.isArray(policy.labels) ||
    !policy.labels.length ||
    policy.labels.some((label) => !['A', 'E', 'I', 'O', 'U', 'NONE'].includes(label))
  )
    throw new Error(
      'El reflejo requiere validación documentada por etiqueta; no se presupone equivalencia LSV',
    );
  return records
    .filter((sample) => policy.labels.includes(sample.label))
    .map((sample) => {
      if (
        (sample.partition && sample.partition !== 'train') ||
        (sample.evaluationPartition && sample.evaluationPartition !== 'train') ||
        (sample.sampleKind && sample.sampleKind !== 'REAL')
      )
        throw new Error('Solo se aumenta entrenamiento; nunca validación ni prueba');
      const frames = mirrorFrames(sample.frames);
      return {
        ...sample,
        id: `${sample.id}_mirror`,
        sampleKind: 'AUGMENTED',
        dataOrigin: 'DERIVED_REFLECTION',
        parentId: sample.id,
        transform: 'HORIZONTAL_REFLECTION',
        augmentationValidation: { ...policy },
        observedHand: sample.frames[0].hand,
        hand: frames[0].hand,
        frames,
        sequence: sequenceFeatures(frames),
      };
    });
}
