import { validateFrames } from './recording.js';
import { validateHandSequence } from './hand-sequence-validation.js';
export { validateHandSequence } from './hand-sequence-validation.js';

/**
 * Extrae una secuencia unimanual estable para el modelo existente; nunca elimina una segunda mano.
 * @param {object} input Captura sincronizada validable.
 * @returns {object[]} Frames compatibles con DTW, con lateralidad cruda y correcciones documentadas.
 * @throws {Error} Dos manos, pérdida, cambio de track o lateralidad inestable.
 */
export function singleHandFrames(input) {
  const sequence = validateHandSequence(input);
  if (sequence.frames.some((frame) => frame.count > 1))
    throw new Error('Usa solo una mano para esta práctica');
  // Adquisición inicial del track: como máximo 400 ms. No se recortan pérdidas posteriores.
  const first = sequence.frames.findIndex((frame) => frame.singleHand);
  if (first < 0 || sequence.frames[first].t - sequence.frames[0].t > 400)
    throw new Error('No se detecta claramente la mano; mantén la posición');
  return validateFrames(
    sequence.frames.slice(first).map((frame) => {
      const item = frame.hands[frame.singleHand];
      if (!frame.stable || !item)
        throw new Error('Lateralidad inestable o continuidad perdida; repite el intento');
      return {
        t: frame.t,
        width: frame.width,
        height: frame.height,
        hand: item.hand,
        trackId: item.trackId,
        points: item.points,
        rawHand: item.rawHand,
        handednessScore: item.score,
        handednessCorrected: item.corrected,
      };
    }),
  );
}

/**
 * Conserva alineados los dos canales para un futuro modelo bimanual, incluidos los frames ausentes.
 * @param {object} input Captura versión 2.
 * @returns {object} Series Left/Right con timestamps y máscaras de presencia.
 */
export function handSequenceChannels(input) {
  const { frames } = validateHandSequence(input);
  return Object.fromEntries(
    ['Left', 'Right'].map((hand) => [
      hand,
      frames.map((frame) => ({
        t: frame.t,
        present:
          frame.hands[hand] !== null
            ? true
            : frame.ambiguous || frame.observations.some((item) => !item.hand)
              ? null
              : false,
        observation: frame.hands[hand],
      })),
    ]),
  );
}
