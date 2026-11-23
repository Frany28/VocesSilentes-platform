import { vowelGuides, vowelLetters } from './vowel-lesson.js';

export const vowelGuideMap = Object.freeze(
  Object.fromEntries(vowelGuides.map((guide) => [guide.letter, guide])),
);

// Cada actividad recorre las cinco vocales en un orden propio, para que la posición de la ronda no
// anticipe la respuesta. El orden es fijo: el progreso guardado sigue siendo por vocal.
const orders = {
  identify: ['O', 'A', 'U', 'E', 'I'],
  differentiate: ['E', 'I', 'A', 'U', 'O'],
  recall: ['U', 'O', 'I', 'A', 'E'],
};

/**
 * @param {string} activityId Actividad formativa.
 * @returns {string[]} Las cinco vocales en el orden de rondas de esa actividad.
 */
export function activityOrder(activityId) {
  return orders[activityId] ?? [...vowelLetters];
}

/**
 * Opciones de la ronda «Diferencia las señas»: la vocal objetivo y la que suele confundirse con
 * ella, alternando su posición para no fijar la respuesta en el mismo lado.
 * @param {string} letter Vocal solicitada.
 * @param {number} round Ronda actual.
 * @returns {string[]} Dos vocales a comparar.
 */
export function differentiateChoices(letter, round) {
  const other = vowelGuideMap[letter].compareWith;
  return round % 2 ? [other, letter] : [letter, other];
}

/**
 * Opciones de «Recuerda sin pistas»: todos los rasgos, en un orden que depende de la vocal.
 * @param {string} letter Vocal solicitada.
 * @returns {string[]} Vocales cuyos rasgos se ofrecen como opciones.
 */
export function recallChoices(letter) {
  const start = vowelLetters.indexOf(letter);
  return vowelLetters.map((_, index) => vowelLetters[(start + index * 2) % vowelLetters.length]);
}

// Repaso combinado: alterna reconocimiento visual y práctica física, una vez por vocal.
export const mixedReview = Object.freeze([
  { id: 'mix-1', kind: 'visual', activity: 'identify', letter: 'U' },
  { id: 'mix-2', kind: 'camera', letter: 'A' },
  { id: 'mix-3', kind: 'visual', activity: 'differentiate', letter: 'O' },
  { id: 'mix-4', kind: 'camera', letter: 'E' },
  { id: 'mix-5', kind: 'visual', activity: 'recall', letter: 'I' },
]);

/**
 * El repaso combinado se completa al atender sus cinco rondas: las visuales con una respuesta
 * correcta y las de cámara al continuar, con o sin intento, porque la cámara es voluntaria.
 * @param {object} progress Progreso formativo local.
 * @returns {boolean} Si todas las rondas fueron atendidas.
 */
export function mixedReviewDone(progress) {
  return mixedReview.every((item) => progress.mixed?.includes(item.id));
}
