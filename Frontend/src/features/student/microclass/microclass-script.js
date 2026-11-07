import { vowelGuides } from '../curriculum/vowel-lesson.js';
import { vowelFocus } from './microclass-focus.js';

/**
 * @typedef {object} MicroclassCue
 * @property {string} text Narración y subtítulo; siempre se muestran por escrito.
 * @property {number} seconds Duración mínima en pantalla.
 * @property {boolean} [waitForAnswer] Detiene el avance hasta que la pregunta se resuelva.
 * @property {string} [revealText] Subtítulo alternativo si el estudiante pide la respuesta.
 * @typedef {{id: string, title: string, type: string, letter?: string, cues: MicroclassCue[]}} MicroclassScene
 */

export const vowelLetters = ['A', 'E', 'I', 'O', 'U'];
export const quizLetter = 'E';

const guides = Object.fromEntries(vowelGuides.map((guide) => [guide.letter, guide]));

// Las descripciones y los focos son los textos ya publicados en vowel-lesson.js (Fuentes, 2022, pp. 5–6).
const vowelScene = (letter) => ({
  id: `vowel-${letter}`,
  title: `Vocal ${letter}`,
  type: 'vowel',
  letter,
  cues: [
    { text: `Esta es la vocal ${letter}.`, seconds: 3.5 },
    { text: guides[letter].description, seconds: 6.5 },
    { text: guides[letter].focus, seconds: 6.5 },
    { text: vowelFocus[letter].practice, seconds: 6.5 },
  ],
});

/** @type {MicroclassScene[]} */
export const microclassScenes = [
  {
    id: 'why',
    title: 'Introducción: ¿por qué LSV?',
    type: 'why',
    cues: [
      {
        text: 'La Lengua de Señas Venezolana, o LSV, es la lengua de la comunidad sorda de Venezuela.',
        seconds: 6,
      },
      {
        text: 'Aprenderla te permite comunicarte con más personas y construir espacios inclusivos.',
        seconds: 5.5,
      },
    ],
  },
  {
    id: 'alphabet',
    title: 'El alfabeto manual',
    type: 'alphabet',
    cues: [
      {
        text: 'Hoy comenzamos con el alfabeto manual. Sirve para deletrear nombres y algunas palabras.',
        seconds: 5.5,
      },
      {
        text: 'Es una herramienta útil, pero no sustituye el vocabulario ni la gramática de la LSV.',
        seconds: 5,
      },
    ],
  },
  {
    id: 'method',
    title: 'Cómo practicar',
    type: 'method',
    cues: [
      {
        text: 'Para cada vocal vas a observar la mano, leer qué la distingue e intentarlo tú.',
        seconds: 6,
      },
    ],
  },
  ...vowelLetters.map(vowelScene),
  {
    id: 'review',
    title: 'Repaso',
    type: 'review',
    cues: [{ text: 'Repasemos las cinco vocales: A, E, I, O y U.', seconds: 10 }],
  },
  {
    id: 'quiz',
    title: 'Pregunta: ¿qué vocal es?',
    type: 'quiz',
    cues: [
      {
        text: '¿Puedes identificar esta vocal? Elige una respuesta.',
        seconds: 4,
        waitForAnswer: true,
      },
      {
        text: '¡Correcto! Es la E: dedos curvados y el pulgar delante de la palma, debajo de ellos.',
        revealText:
          'La respuesta es E: dedos curvados y el pulgar delante de la palma, debajo de ellos.',
        seconds: 5,
      },
    ],
  },
  {
    id: 'outro',
    title: 'Sigue aprendiendo',
    type: 'outro',
    cues: [
      { text: '¡Muy bien! Ya conoces las cinco vocales del alfabeto manual en LSV.', seconds: 4.5 },
      {
        text: 'Sigue aprendiendo en VocesSilentes: practica cada vocal y continúa con el abecedario.',
        seconds: 5.5,
      },
    ],
  },
];

/**
 * Pista para una respuesta incorrecta; repite el rasgo descrito en la guía de la E.
 * @param {string} letter Vocal elegida por el estudiante.
 * @returns {string} Subtítulo y narración de la pista.
 */
export function quizHint(letter) {
  return `Todavía no es la ${letter}. Mira el pulgar: está delante de la palma, debajo de los dedos curvados.`;
}
