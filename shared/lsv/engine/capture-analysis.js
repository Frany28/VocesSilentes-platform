import { analyzeHand, evaluateTarget } from './handshape.js';
import { MOTION_SPECS, engineSupports, letterSpec } from './alphabet-spec.js';
import { evaluateMotionLetter, mostFrequent } from './motion.js';
import { TIMING } from './recognizer.js';

/**
 * Analiza un intento capturado (frames validados de una sola mano) frente a la letra objetivo.
 * Una letra estática exige una racha continua compatible de al menos TIMING.holdMs; una letra con
 * movimiento exige postura inicial, continuidad y movimiento completo.
 * @param {object[]} frames Frames {t, width, height, hand, points}.
 * @param {string} target Letra objetivo.
 * @returns {object} Veredicto MATCH | CONFUSED | ADJUST | NEEDS_MOTION | INCOMPLETE_MOTION |
 * UNSUPPORTED, con la corrección prioritaria y la letra rival si la hay.
 */
export function analyzeCapture(frames, target) {
  const spec = letterSpec(target);
  if (!engineSupports(target) || !frames?.length)
    return { verdict: 'UNSUPPORTED', target, status: spec?.status ?? null };
  if (MOTION_SPECS[target]) {
    const motion = evaluateMotionLetter(frames, target);
    return {
      verdict:
        motion.verdict === 'ADJUST_SHAPE'
          ? 'ADJUST'
          : motion.verdict === 'TOO_SHORT'
            ? 'NEEDS_MOTION'
            : motion.verdict,
      target,
      status: spec.status,
      hint: motion.hint ?? null,
      progress: motion.progress ?? 0,
      hand: frames[0].hand,
    };
  }
  const evaluations = frames
    .map((frame) => {
      const analysis = analyzeHand(frame.points, frame);
      return analysis ? { t: frame.t, ...evaluateTarget(analysis.descriptors, target) } : null;
    })
    .filter(Boolean);
  // Racha continua más larga de fotogramas compatibles, en milisegundos.
  let best = 0;
  let start = null;
  for (const item of evaluations) {
    if (item.verdict === 'MATCH') {
      start ??= item.t;
      best = Math.max(best, item.t - start);
    } else start = null;
  }
  const matchFraction =
    evaluations.filter((item) => item.verdict === 'MATCH').length / Math.max(1, evaluations.length);
  const hand = frames[0].hand;
  if (best >= TIMING.holdMs)
    return { verdict: 'MATCH', target, status: spec.status, matchFraction, hand };
  const rivals = evaluations.filter((item) => item.verdict === 'CONFUSED');
  const rival = mostFrequent(rivals.map((item) => item.rival?.label));
  const hint = mostFrequent(
    evaluations.filter((item) => item.verdict !== 'MATCH').map((item) => item.failing?.[0]?.hint),
  );
  return {
    verdict: rivals.length > evaluations.length / 2 && rival ? 'CONFUSED' : 'ADJUST',
    target,
    status: spec.status,
    rival,
    hint,
    matchFraction,
    hand,
  };
}
