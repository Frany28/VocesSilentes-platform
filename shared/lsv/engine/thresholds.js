// Umbrales del análisis geométrico. Estado: SIN CALIBRAR CON PARTICIPANTES.
//
// Se fijaron con criterios anatómicos (un dedo recto tiene ~0° de flexión acumulada; un puño,
// más de 180°) y se contrastaron con los únicos datos reales del repositorio: 8 prototipos de vocales
// y 1 NONE del modelo vowels-demo-v1 (mano derecha, dos videos, sin participantes independientes).
// No son resultados de entrenamiento. Deben recalibrarse por letra con el protocolo de
// docs/LSV_DATASET_STRATEGY.md antes de considerar fiable cualquier umbral.
export const THRESHOLDS_STATUS = 'UNCALIBRATED_ANATOMICAL';

export const T = Object.freeze({
  // Dedo extendido: curvatura acumulada (MCP+PIP+DIP) y rectitud punta–nudillo.
  extendedCurl: [95, 55], // 0 en 95°, 1 en 55°
  extendedStraight: [0.8, 0.93],
  // Dedo cerrado hacia la palma.
  closedCurl: [95, 135],
  closedStraight: [0.85, 0.7],
  // Dedo curvado sin cerrarse (C/O): avance moderado y rectitud intermedia.
  curvedStraight: [0.5, 0.62, 0.9, 0.97],
  curvedCurl: [40, 70, 190, 230],
  // Gancho (X): falange proximal hacia arriba y punta doblada.
  hookRise: [-0.05, 0.1],
  hookStraight: [0.88, 0.75],
  lead: [0.15, 0.3], // la punta sobresale respecto a la de los demás dedos
  // Dedos colgando sobre el pulgar (M/N): rectos pero sin avanzar a lo largo de la mano.
  drapedStraight: [0.62, 0.78],
  drapedRise: [0.55, 0.3],
  // Separación lateral entre dedos adyacentes (grados en el plano de la palma).
  spread: [10, 20],
  together: [18, 9],
  tipsTogether: [0.45, 0.28],
  // Contacto punta del pulgar–punta de un dedo (en escalas de palma).
  contact: [0.5, 0.3],
  noContact: [0.3, 0.45],
  // Pulgar.
  thumbAcrossMargin: [0.0, 0.15], // cuánto cruza por delante del índice hacia el meñique
  thumbFolded: [50, 85], // flexión acumulada del pulgar
  thumbOutside: [0.0, 0.15], // cuánto sobresale por fuera del índice (lado radial)
  thumbHigh: [0.85, 1.05], // altura de la punta a lo largo de la mano
  thumbStraight: [75, 40],
  thumbAway: [0.6, 0.85], // distancia de la punta al nudillo del índice
  thumbOverFingers: [-0.02, 0.1], // profundidad relativa a las puntas de índice y medio
  // Orientación.
  pointing: [0.55, 0.8],
  palmToward: [0.25, 0.55],
  // Cruce: proporción invertida del orden lateral índice/medio.
  crossed: [0.1, -0.15],
});

/**
 * Rampa lineal 0→1 entre dos valores (o 1→0 si from > to).
 * @param {number} value Valor medido.
 * @param {number[]} range [desde, hasta].
 * @returns {number} Grado de cumplimiento entre 0 y 1.
 */
export function ramp(value, [from, to]) {
  if (!Number.isFinite(value)) return 0;
  const t = (value - from) / (to - from);
  return Math.min(1, Math.max(0, t));
}

/**
 * Trapecio: 0 fuera de [a, d], 1 entre b y c.
 * @param {number} value Valor medido.
 * @param {number[]} limits [a, b, c, d].
 * @returns {number} Grado de pertenencia.
 */
export function band(value, [a, b, c, d]) {
  return Math.min(ramp(value, [a, b]), ramp(value, [d, c]));
}
