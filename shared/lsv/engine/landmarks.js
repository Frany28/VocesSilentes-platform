// Índices de los 21 puntos de MediaPipe Hand Landmarker (documentación oficial de Google AI Edge).
export const WRIST = 0;
export const THUMB = Object.freeze([1, 2, 3, 4]); // CMC, MCP, IP, punta
export const FINGERS = Object.freeze({
  index: Object.freeze([5, 6, 7, 8]), // MCP, PIP, DIP, punta
  middle: Object.freeze([9, 10, 11, 12]),
  ring: Object.freeze([13, 14, 15, 16]),
  pinky: Object.freeze([17, 18, 19, 20]),
});
export const FINGER_NAMES = Object.freeze(['index', 'middle', 'ring', 'pinky']);
export const TIPS = Object.freeze([4, 8, 12, 16, 20]);

export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const scale = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const norm = (a) => Math.hypot(a[0], a[1], a[2]);
export const distance = (a, b) => norm(sub(a, b));
export const unit = (a) => {
  const length = norm(a);
  return length > 1e-9 ? scale(a, 1 / length) : [0, 0, 0];
};
/**
 * @param {number[]} a Vector.
 * @param {number[]} b Vector.
 * @returns {number} Ángulo en grados entre 0 y 180.
 */
export const angle = (a, b) => {
  const denominator = norm(a) * norm(b);
  if (denominator < 1e-12) return 0;
  return (Math.acos(Math.min(1, Math.max(-1, dot(a, b) / denominator))) * 180) / Math.PI;
};

/**
 * Comprueba la forma de una observación del detector sin repararla ni rellenar puntos ausentes.
 * @param {unknown} points Puntos [x, y, z] normalizados por MediaPipe.
 * @returns {boolean} 21 puntos finitos.
 */
export function validLandmarks(points) {
  return (
    Array.isArray(points) &&
    points.length === 21 &&
    points.every(
      (point) =>
        Array.isArray(point) && point.length >= 3 && point.slice(0, 3).every(Number.isFinite),
    )
  );
}

/**
 * Lleva la mano a un sistema común: muñeca en el origen, escala de palma 1 y, para la mano
 * izquierda, reflexión horizontal. Así un mismo clasificador evalúa ambas manos.
 *
 * La reflexión es lingüísticamente válida para el alfabeto manual: las fuentes revisadas lo
 * describen como unimanual (Martínez, UPEL 2018, p. 65) y la persona zurda ejecuta la imagen
 * especular de la configuración. La orientación vertical y la profundidad se conservan; solo se
 * invierte el eje lateral, que es justamente el que depende de la lateralidad.
 *
 * Los puntos de MediaPipe vienen de fotogramas SIN reflejar (el espejo del visor es solo CSS). Con
 * esa entrada, la etiqueta Left/Right describe la mano tal como aparece en la imagen, que coincide
 * con la mano física de la persona. Ver docs/HAND_RECOGNITION_ARCHITECTURE.md, «Lateralidad».
 * @param {number[][]} points 21 puntos [x, y, z] en coordenadas de imagen (0–1).
 * @param {{width?: number, height?: number, hand?: 'Left'|'Right'|null}} [options] Aspecto y lateralidad.
 * @returns {{points: number[][], palm: number, hand: string|null, mirrored: boolean}|null}
 * Puntos canónicos (eje y hacia abajo, z negativo hacia la cámara) o null si la mano es degenerada.
 */
export function canonicalHand(points, { width = 1, height = 1, hand = 'Right' } = {}) {
  if (!validLandmarks(points)) return null;
  const aspect = width / height;
  // MediaPipe expresa z con una escala similar a x; se corrige igual que x.
  const metric = points.map(([x, y, z]) => [x * aspect, y, z * aspect]);
  const wrist = metric[WRIST];
  const palm =
    (distance(wrist, metric[5]) + distance(wrist, metric[9]) + distance(wrist, metric[17])) / 3;
  if (!Number.isFinite(palm) || palm < 1e-4) return null;
  const mirrored = hand === 'Left';
  return {
    points: metric.map((point) => {
      const relative = scale(sub(point, wrist), 1 / palm);
      return mirrored ? [-relative[0], relative[1], relative[2]] : relative;
    }),
    palm,
    hand: hand ?? null,
    mirrored,
  };
}
