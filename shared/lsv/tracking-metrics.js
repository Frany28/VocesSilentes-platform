import { validateHandSequence } from './hand-sequence.js';

/**
 * Resume detección y estabilidad de una captura; no equivale a exactitud lingüística ni anatómica.
 * @param {object} sequence Captura técnica real o fixture explícito.
 * @returns {object} Recuentos por mano, presencia, cambios de track y correcciones observadas.
 */
export function handTrackingMetrics(sequence) {
  const { frames } = validateHandSequence(sequence);
  const byHand = Object.fromEntries(
    ['Left', 'Right'].map((hand) => {
      const observed = frames.map((frame) => frame.hands[hand]).filter(Boolean);
      let switches = 0;
      observed.forEach((item, i) => {
        if (i && item.trackId !== observed[i - 1].trackId) switches += 1;
      });
      return [
        hand,
        {
          rawFrames: frames.filter((f) => f.observations.some((o) => o.rawHand === hand)).length,
          assignedFrames: observed.length,
          stableFrames: observed.filter((o) => o.stable).length,
          correctedFrames: observed.filter((o) => o.corrected).length,
          trackSwitches: switches,
        },
      ];
    }),
  );
  return {
    frames: frames.length,
    byHand,
    noHands: frames.filter((f) => f.count === 0).length,
    oneHand: frames.filter((f) => f.count === 1).length,
    twoHands: frames.filter((f) => f.count === 2).length,
    stableFrames: frames.filter((f) => f.stable).length,
    ambiguousFrames: frames.filter((f) => f.ambiguous).length,
  };
}
