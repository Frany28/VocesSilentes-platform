import { LSV_FEATURES, LSV_SEQUENCE_LENGTH } from './labels.js';

/**
 * Comprueba el contrato numérico de inferencia sin normalizar ni reparar datos incompatibles.
 * @param {unknown} sequence Características de un intento o prototipo.
 * @returns {boolean} 16 observaciones finitas de 66 rasgos, dentro del límite del modelo v1.
 */
export function validFeatureSequence(sequence) {
  return (
    Array.isArray(sequence) &&
    sequence.length === LSV_SEQUENCE_LENGTH &&
    sequence.every(
      (frame) =>
        Array.isArray(frame) &&
        frame.length === LSV_FEATURES &&
        frame.every((value) => Number.isFinite(value) && Math.abs(value) <= 1000),
    )
  );
}
