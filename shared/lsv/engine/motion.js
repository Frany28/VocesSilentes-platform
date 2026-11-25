import { angle, distance, sub } from './landmarks.js';
import { analyzeHand, evaluateTarget } from './handshape.js';
import { MOTION_SPECS } from './alphabet-spec.js';

// Criterios temporales SIN CALIBRAR: solo se fijan mínimos de evidencia, no la ejecución ideal.
export const MOTION = Object.freeze({
  minDurationMs: 400,
  initialShapeFraction: 0.5, // fracción mínima de fotogramas con la postura inicial correcta
  reversalAmplitude: 0.25, // amplitud mínima (en palmas) para contar un cambio de dirección
  zigzagPath: 1.2, // recorrido mínimo de la punta del índice para Z, en palmas
  zigzagDescent: 0.25, // Z avanza de arriba hacia abajo
  holdTailFraction: 0.2, // J: la rotación debe mantenerse al final (segunda detención)
});

/**
 * Serie temporal en un sistema común para ambas manos: posiciones en palmas y eje x reflejado para
 * la mano izquierda, de modo que «hacia el lado del pulgar» signifique lo mismo en las dos.
 * @param {object[]} frames Fotogramas {t, width, height, hand, points} de una sola mano.
 * @returns {object[]} Muestras con análisis estático, trayectorias y normal de la palma.
 */
export function motionSeries(frames) {
  // `frame.analysis` permite reutilizar el análisis del reconocedor en vivo (sin recalcular).
  const analyses = frames.map((frame) => ({
    t: frame.t,
    analysis: frame.analysis ?? analyzeHand(frame.points, frame),
  }));
  const valid = analyses.filter((item) => item.analysis);
  if (!valid.length) return [];
  const palm = valid.reduce((sum, item) => sum + item.analysis.canonical.palm, 0) / valid.length;
  return frames
    .map((frame, index) => {
      const analysis = analyses[index].analysis;
      if (!analysis) return null;
      const aspect = frame.width / frame.height;
      const side = frame.hand === 'Left' ? -1 : 1;
      const position = (point) => [(side * point[0] * aspect) / palm, point[1] / palm, 0];
      return {
        t: frame.t,
        frame,
        analysis,
        wrist: position(frame.points[0]),
        indexTip: position(frame.points[8]),
        pinkyTip: position(frame.points[20]),
        palmar: analysis.features.axes.palmar,
        distal: analysis.features.axes.distal,
      };
    })
    .filter(Boolean);
}

/**
 * Cuenta cambios de dirección con histéresis de amplitud, ignorando el temblor.
 * @param {number[]} values Serie escalar.
 * @param {number} amplitude Variación mínima para confirmar un tramo.
 * @returns {number} Número de inversiones confirmadas.
 */
export function countReversals(values, amplitude) {
  let reversals = 0;
  let direction = 0;
  let anchor = values[0];
  for (const value of values.slice(1)) {
    const delta = value - anchor;
    if (direction >= 0 && delta <= -amplitude) {
      if (direction > 0) reversals += 1;
      direction = -1;
      anchor = value;
    } else if (direction <= 0 && delta >= amplitude) {
      if (direction < 0) reversals += 1;
      direction = 1;
      anchor = value;
    } else if ((direction > 0 && value > anchor) || (direction < 0 && value < anchor))
      anchor = value;
  }
  return reversals;
}

/**
 * Rasgos de movimiento de una secuencia: duración, recorrido, inversiones y giro de la palma.
 * @param {object[]} series Resultado de motionSeries.
 * @returns {object} Rasgos interpretables del movimiento.
 */
export function motionFeatures(series) {
  if (series.length < 2) return { durationMs: 0, path: 0, rotation: 0, reversals: {} };
  const path = series
    .slice(1)
    .reduce((sum, item, index) => sum + distance(item.indexTip, series[index].indexTip), 0);
  const first = series[0];
  // Giro de la palma respecto a la postura inicial, a lo largo del tiempo (grados).
  const rotations = series.map((item) => angle(first.palmar, item.palmar));
  // Giro alrededor del eje del antebrazo: componente lateral de la normal de la palma.
  const roll = series.map((item) => item.palmar[0]);
  return {
    durationMs: series.at(-1).t - first.t,
    path,
    descent: series.at(-1).indexTip[1] - first.indexTip[1],
    rotation: Math.max(...rotations),
    finalRotation: rotations
      .slice(-Math.max(1, Math.round(series.length * MOTION.holdTailFraction)))
      .reduce((min, value) => Math.min(min, value), Infinity),
    reversals: {
      indexX: countReversals(
        series.map((item) => item.indexTip[0]),
        MOTION.reversalAmplitude,
      ),
      wristX: countReversals(
        series.map((item) => item.wrist[0]),
        MOTION.reversalAmplitude,
      ),
      roll: countReversals(roll, 0.25),
    },
    displacement: distance(series.at(-1).wrist, first.wrist),
    lateralShift: sub(series.at(-1).wrist, first.wrist)[0],
  };
}

/**
 * Evalúa una letra con movimiento. No acepta la letra porque la postura inicial coincida:
 * exige postura inicial, continuidad de la configuración y el movimiento documentado completo.
 * @param {object[]} frames Fotogramas continuos de una mano.
 * @param {string} letter J, Ñ o Z.
 * @returns {object} MATCH, NEEDS_MOTION, INCOMPLETE_MOTION, ADJUST_SHAPE o TOO_SHORT con detalle.
 */
export function evaluateMotionLetter(frames, letter) {
  const spec = MOTION_SPECS[letter];
  if (!spec) return { verdict: 'UNSUPPORTED', letter };
  const series = motionSeries(frames);
  const features = motionFeatures(series);
  if (series.length < 4 || features.durationMs < MOTION.minDurationMs)
    return { verdict: 'TOO_SHORT', letter, features };
  const shape = series.map((item) => {
    // Caché por fotograma: la ventana deslizante reevalúa los mismos fotogramas muchas veces.
    const cache = (item.frame.shapes ??= {});
    return (cache[spec.from] ??= evaluateTarget(item.analysis.descriptors, spec.from));
  });
  const opening = shape.slice(0, Math.max(2, Math.round(shape.length * 0.25)));
  const startOk = opening.some((item) => item.verdict === 'MATCH');
  const heldFraction = shape.filter((item) => item.verdict === 'MATCH').length / shape.length;
  if (!startOk || heldFraction < MOTION.initialShapeFraction) {
    const failing = shape.flatMap((item) => item.failing ?? []);
    return {
      verdict: 'ADJUST_SHAPE',
      letter,
      features,
      heldFraction,
      hint: mostFrequent(failing.map((item) => item.hint)),
    };
  }
  const { motion } = spec;
  let progress = 0;
  if (motion.type === 'ROTATION') {
    // J (Oviedo 2000): segunda detención en posición supina; el giro debe completarse y mantenerse.
    progress = Math.min(features.rotation, features.finalRotation) / motion.minDegrees;
  } else if (motion.type === 'OSCILLATION') {
    progress =
      Math.max(features.reversals.wristX, features.reversals.roll, features.reversals.indexX) /
      motion.minReversals;
  } else if (motion.type === 'ZIGZAG') {
    progress = Math.min(
      features.reversals.indexX / motion.minReversals,
      features.path / MOTION.zigzagPath,
      Math.max(0, features.descent) / MOTION.zigzagDescent,
    );
  }
  if (progress >= 1) return { verdict: 'MATCH', letter, features, progress: 1 };
  return {
    verdict: progress > 0.25 ? 'INCOMPLETE_MOTION' : 'NEEDS_MOTION',
    letter,
    features,
    progress,
  };
}

/**
 * @param {string[]} values Valores repetidos.
 * @returns {string|null} El más frecuente.
 */
export function mostFrequent(values) {
  const counts = new Map();
  for (const value of values) if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}
