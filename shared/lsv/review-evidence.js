import { LSV_LETTERS, LSV_MOTION_LETTERS } from './labels.js';

const code = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(value);

/**
 * Conserva referencias seudónimas a consentimiento, permiso y revisión humana; no certifica al revisor.
 * La evidencia original se mantiene privada, fuera del JSON y del repositorio.
 * @param {object} value Declaraciones documentadas, nunca generadas desde la geometría.
 * @param {string} label Etiqueta observada, incluida NONE.
 * @returns {object} Evidencia permitida para exportación local.
 * @throws {Error} Faltan referencias, variante, fecha o revisión temporal/negativa.
 */
export function validateReviewEvidence(value, label) {
  if (
    value?.language !== 'LSV' ||
    !['consentReference', 'permissionReference', 'reviewReference', 'variantReference'].every(
      (key) => code(value[key]),
    ) ||
    typeof value.reviewedAt !== 'string' ||
    !Number.isFinite(Date.parse(value.reviewedAt))
  )
    throw new Error('Documenta consentimiento, permiso de entrenamiento, revisión y variante LSV.');
  if (LSV_MOTION_LETTERS.includes(label) && value.motionReviewed !== true)
    throw new Error('J, Ñ y Z requieren revisión del movimiento completo y su variante LSV.');
  if (
    label === 'NONE' &&
    (!Array.isArray(value.negativeFor) ||
      !value.negativeFor.length ||
      new Set(value.negativeFor).size !== value.negativeFor.length ||
      value.negativeFor.some((letter) => !LSV_LETTERS.includes(letter)) ||
      typeof value.negativeDescription !== 'string' ||
      value.negativeDescription.trim().length < 10 ||
      value.negativeDescription.length > 240)
  )
    throw new Error(
      'Define qué postura representa NONE y para qué letras es un negativo revisado.',
    );
  return {
    language: 'LSV',
    consentReference: value.consentReference,
    permissionReference: value.permissionReference,
    reviewReference: value.reviewReference,
    variantReference: value.variantReference,
    reviewedAt: value.reviewedAt,
    motionReviewed: value.motionReviewed === true,
    ...(label === 'NONE'
      ? {
          negativeFor: [...value.negativeFor],
          negativeDescription: value.negativeDescription.trim(),
        }
      : {}),
  };
}

/**
 * Impide reutilizar negativos del piloto (p. ej. B) al ampliar las clases reconocidas.
 * @param {object} sample Muestra validada con evidencia humana.
 * @param {string[]} labels Clases del experimento actual.
 * @returns {void} Sin efectos; no cambia etiquetas.
 * @throws {Error} NONE no fue revisada frente a todas las letras elegidas.
 */
export function assertNegativeScope(sample, labels) {
  if (
    sample.label === 'NONE' &&
    labels.some((label) => label !== 'NONE' && !sample.reviewEvidence.negativeFor.includes(label))
  )
    throw new Error(
      'NONE pertenece a otro alcance; revisa sus negativos antes de ampliar las letras.',
    );
}
