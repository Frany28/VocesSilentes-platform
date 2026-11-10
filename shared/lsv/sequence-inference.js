import { singleHandFrames, handSequenceChannels } from './hand-sequence.js';
import { predictSequence } from './classifier.js';
import { sequenceFeatures } from './sequence.js';

/**
 * Enruta por modalidad observada; DTW actual aprende prototipos separados por mano, sin reflejo implícito.
 * @param {object} model Modelo unimanual existente.
 * @param {object} sequence Captura sincronizada de una o dos manos.
 * @param {{expectedHands?: number}} [options] Modalidad de la actividad, nunca elegida por el estudiante.
 * @returns {object} Candidata/abstención y canales disponibles; dos manos requieren un modelo futuro específico.
 */
export function predictHandSequence(model, sequence, { expectedHands = 1 } = {}) {
  const channels = handSequenceChannels(sequence);
  if (expectedHands === 2) return { label: null, reason: 'TWO_HAND_MODEL_REQUIRED', channels };
  if (sequence.frames.some((frame) => frame.count > 1))
    return { label: null, reason: 'SINGLE_HAND_REQUIRED', channels };
  const frames = singleHandFrames(sequence);
  return { ...predictSequence(model, sequenceFeatures(frames), frames[0].hand), frames, channels };
}
