import { LSV_MOTION_LETTERS } from './labels.js';
import { sequenceFeatures } from './sequence.js';

/**
 * Comprueba escala por frame, continuidad geométrica y diversidad temporal antes del entrenamiento.
 * Conserva screen-pose-wrist-v1: no rota, suaviza, refleja ni fabrica observaciones.
 * @param {object} sample Grabación con frames ya validados.
 * @returns {number[][]} Características compatibles con la demo existente.
 * @throws {Error} Palma degenerada/inestable, salto de muñeca o movimiento completamente ausente.
 */
export function trainingSequence(sample) {
  const aspect = sample.frames[0].width / sample.frames[0].height;
  const lengths = sample.frames.map(({ points }) =>
    Math.hypot(
      (points[9][0] - points[0][0]) * aspect,
      points[9][1] - points[0][1],
      (points[9][2] - points[0][2]) * aspect,
    ),
  );
  const median = [...lengths].sort((a, b) => a - b)[Math.floor(lengths.length / 2)];
  if (lengths.some((length) => length < 0.0001 || length < median / 4 || length > median * 4))
    throw new Error('Escala de palma degenerada o inestable; revisa la captura original.');
  for (let index = 1; index < sample.frames.length; index += 1) {
    const current = sample.frames[index].points[0];
    const previous = sample.frames[index - 1].points[0];
    if (Math.hypot(current[0] - previous[0], current[1] - previous[1]) > 0.3)
      throw new Error('Salto de muñeca entre frames; revisa continuidad y encuadre.');
  }
  const sequence = sequenceFeatures(sample.frames);
  if (
    LSV_MOTION_LETTERS.includes(sample.label) &&
    sequence.every((frame) => frame.every((value, axis) => value === sequence[0][axis]))
  )
    throw new Error('Una postura congelada no representa una ejecución temporal de J, Ñ o Z.');
  return sequence;
}
