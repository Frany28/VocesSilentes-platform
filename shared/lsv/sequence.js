import { LSV_SEQUENCE_LENGTH } from './labels.js';

/**
 * Normaliza posición/escala, conservando orientación, forma y desplazamiento observado de la muñeca.
 * @param {object[]} frames Frames continuos previamente validados, sin espejo aplicado a los datos.
 * @returns {number[][]} 16 observaciones reales remuestreadas: 63 coordenadas y 3 de trayectoria.
 * @throws {Error} Escala de palma degenerada.
 */
export function sequenceFeatures(frames) {
  const aspect = frames[0].width / frames[0].height;
  const metric = (point) => [point[0] * aspect, point[1], point[2] * aspect];
  const origin = metric(frames[0].points[0]);
  const scale =
    frames.reduce((sum, frame) => {
      const wrist = metric(frame.points[0]);
      const middle = metric(frame.points[9]);
      return sum + Math.hypot(...middle.map((value, axis) => value - wrist[axis]));
    }, 0) / frames.length;
  if (!Number.isFinite(scale) || scale < 0.0001)
    throw new Error('No se pudo medir la mano de esta muestra');
  return Array.from({ length: LSV_SEQUENCE_LENGTH }, (_, index) => {
    const target =
      frames[0].t + (index / (LSV_SEQUENCE_LENGTH - 1)) * (frames.at(-1).t - frames[0].t);
    const frame = frames.reduce((best, item) =>
      Math.abs(item.t - target) < Math.abs(best.t - target) ? item : best,
    );
    const wrist = metric(frame.points[0]);
    const pose = frame.points.flatMap((point) =>
      metric(point).map((value, axis) => (value - wrist[axis]) / scale),
    );
    return [...pose, ...wrist.map((value, axis) => (value - origin[axis]) / scale)].map(
      (value) => Math.round(value * 100000) / 100000,
    );
  });
}

/**
 * Compara secuencias mediante Dynamic Time Warping, sin reglas de dedos ni movimientos inventados.
 * @param {number[][]} left Secuencia normalizada.
 * @param {number[][]} right Secuencia normalizada.
 * @returns {number} Distancia temporal normalizada; no es probabilidad ni nota educativa.
 */
export function sequenceDistance(left, right) {
  let costs = Array(right.length + 1).fill(Infinity);
  let lengths = Array(right.length + 1).fill(0);
  costs[0] = 0;
  for (const frame of left) {
    const row = [Infinity];
    const counts = [0];
    for (let column = 1; column <= right.length; column += 1) {
      const choices = [
        [costs[column], lengths[column]],
        [row[column - 1], counts[column - 1]],
        [costs[column - 1], lengths[column - 1]],
      ];
      const [cost, length] = choices.reduce((best, item) => (item[0] < best[0] ? item : best));
      const distance =
        frame.reduce((sum, value, axis) => sum + (value - right[column - 1][axis]) ** 2, 0) /
        frame.length;
      row.push(cost + distance);
      counts.push(length + 1);
    }
    costs = row;
    lengths = counts;
  }
  return Math.sqrt(costs.at(-1) / lengths.at(-1));
}
