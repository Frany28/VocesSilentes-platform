import { LSV_LABELS, LSV_FEATURES, LSV_SEQUENCE_LENGTH } from './labels.js';
import { sequenceDistance } from './sequence.js';

/**
 * Valida el modelo experimental importado; no acepta reglas, notas ni código ejecutable en un JSON.
 * @param {unknown} model Artefacto entrenado localmente con muestras reales.
 * @returns {object} Modelo de prototipos compatible con esta versión.
 * @throws {Error} Formato, valores o cobertura de etiquetas incompatibles.
 */
export function validateModel(model) {
  if (
    !model ||
    model.version !== 1 ||
    model.algorithm !== 'LSV_DTW_1NN' ||
    model.status !== 'EXPERIMENTAL' ||
    model.featureVersion !== 'screen-pose-wrist-v1' ||
    !Array.isArray(model.labels) ||
    model.labels.length < 2 ||
    !model.labels.includes('NONE') ||
    new Set(model.labels).size !== model.labels.length ||
    model.labels.some((label) => !LSV_LABELS.includes(label)) ||
    !Array.isArray(model.prototypes) ||
    !model.prototypes.length ||
    model.prototypes.length > 168
  )
    throw new Error('Modelo LSV incompatible o sin categoría de abstención');
  for (const prototype of model.prototypes) {
    if (
      !model.labels.includes(prototype.label) ||
      !['Left', 'Right'].includes(prototype.hand) ||
      !Array.isArray(prototype.sequence) ||
      prototype.sequence.length !== LSV_SEQUENCE_LENGTH ||
      prototype.sequence.some(
        (frame) =>
          !Array.isArray(frame) ||
          frame.length !== LSV_FEATURES ||
          frame.some((value) => !Number.isFinite(value) || Math.abs(value) > 1000),
      )
    )
      throw new Error('Prototipo de modelo inválido');
  }
  for (const label of model.labels) {
    if (
      !model.prototypes.some((prototype) => prototype.label === label) ||
      !Number.isFinite(model.radii?.[label]) ||
      model.radii[label] < 0
    )
      throw new Error('Faltan ejemplos o calibración por etiqueta');
  }
  return model;
}

/**
 * Clasifica secuencias aprendidas; se abstiene ante material desconocido, otra mano o categoría NONE.
 * @param {object} model Modelo validado y calibrado, siempre experimental.
 * @param {number[][]} sequence Características del intento real.
 * @param {string} hand Lateralidad observada por el detector, sin inferirla desde la letra objetivo.
 * @returns {object} Hipótesis experimental o abstención con motivo, nunca acierto académico.
 */
export function predictSequence(model, sequence, hand) {
  const candidates = model.prototypes
    .filter((prototype) => prototype.hand === hand)
    .map((prototype) => ({
      label: prototype.label,
      distance: sequenceDistance(sequence, prototype.sequence),
    }))
    .sort((left, right) => left.distance - right.distance);
  const best = candidates[0];
  if (!best) return { label: null, distance: null, reason: 'UNSUPPORTED_HAND' };
  if (best.distance > model.radii[best.label])
    return { label: null, distance: best.distance, reason: 'OUT_OF_DISTRIBUTION' };
  if (best.label === 'NONE') return { label: null, distance: best.distance, reason: 'BACKGROUND' };
  const competing = candidates.find((candidate) => candidate.label !== best.label);
  if (!competing || competing.distance - best.distance <= 0.000001)
    return { label: null, distance: best.distance, reason: 'AMBIGUOUS' };
  return { label: best.label, distance: best.distance, reason: 'CANDIDATE' };
}
