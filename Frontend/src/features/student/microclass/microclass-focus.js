/**
 * @typedef {[number, number, number, number]} FocusRing Centro x/y y tamaño ancho/alto, en % de la ilustración.
 * @typedef {{x: number, y: number, scale: number, rings: FocusRing[]}} FocusView Acercamiento de un momento.
 * @typedef {object} VowelFocus
 * @property {string[]} keys Palabras clave tomadas de la guía de observación.
 * @property {string} short Rasgo distintivo breve para comparar letras.
 * @property {string|null} compare Vocal con la que se confunde, o null si la guía no compara.
 * @property {FocusView} detail Acercamiento mientras se lee la descripción.
 * @property {FocusView} focus Acercamiento mientras se lee «En qué fijarte».
 * @property {string} practice Invitación a practicar, sin añadir rasgos que la guía no describe.
 */

/**
 * Señala zonas de las ilustraciones originales; no dibuja ni corrige dedos.
 * Las coordenadas corresponden al encuadre cuadrado de las fichas sin rótulo.
 * @type {Record<string, VowelFocus>}
 */
export const vowelFocus = {
  A: {
    keys: ['Cuatro dedos recogidos', 'Pulgar al costado'],
    short: 'Pulgar al costado',
    compare: 'E',
    detail: { x: 51, y: 39, scale: 1.45, rings: [[49, 41, 35, 24]] },
    focus: { x: 64, y: 32, scale: 2, rings: [[64, 31, 14, 24]] },
    practice: 'Ahora inténtalo tú. Forma la A con calma y compárala con la imagen.',
  },
  E: {
    keys: ['Dedos curvados', 'Pulgar delante de la palma', 'Pulgar debajo de los dedos'],
    short: 'Pulgar delante de la palma',
    compare: 'A',
    detail: {
      x: 46,
      y: 40,
      scale: 1.5,
      rings: [
        [43, 35, 30, 13],
        [50, 46, 14, 10],
      ],
    },
    focus: { x: 49, y: 43, scale: 2.1, rings: [[50, 46, 14, 10]] },
    practice: 'Tu turno. Forma la E y revisa dónde quedó tu pulgar.',
  },
  I: {
    keys: ['Meñique extendido', 'Demás dedos recogidos'],
    short: 'Un dedo extendido',
    compare: 'U',
    detail: {
      x: 48,
      y: 38,
      scale: 1.35,
      rings: [
        [41, 30, 10, 21],
        [53, 44, 22, 16],
      ],
    },
    focus: { x: 43, y: 33, scale: 2, rings: [[41, 30, 10, 21]] },
    practice: 'Inténtalo. Meñique extendido y los demás dedos recogidos.',
  },
  O: {
    keys: ['Dedos curvados hacia el pulgar', 'Forma redondeada'],
    short: 'Forma redondeada',
    compare: null,
    detail: { x: 56, y: 40, scale: 1.5, rings: [[57, 40, 21, 18]] },
    focus: { x: 56, y: 42, scale: 1.9, rings: [[57, 40, 21, 18]] },
    practice: 'Tu turno. Curva los dedos hacia el pulgar y busca la forma redondeada.',
  },
  U: {
    keys: ['Índice y medio extendidos', 'Dedos juntos', 'Otros dedos recogidos'],
    short: 'Dos dedos juntos',
    compare: 'I',
    detail: {
      x: 52,
      y: 42,
      scale: 1.35,
      rings: [
        [56, 34, 12, 23],
        [46, 54, 14, 15],
      ],
    },
    focus: { x: 56, y: 36, scale: 1.9, rings: [[56, 34, 12, 23]] },
    practice: 'Inténtalo. Índice y medio extendidos y juntos.',
  },
};
