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
 * Las coordenadas se midieron sobre las cinco imágenes de assets/lsv-manual.
 * @type {Record<string, VowelFocus>}
 */
export const vowelFocus = {
  A: {
    keys: ['Cuatro dedos recogidos', 'Pulgar al costado'],
    short: 'Pulgar al costado',
    compare: 'E',
    detail: { x: 46, y: 36, scale: 1.45, rings: [[44, 38, 40, 26]] },
    focus: { x: 62, y: 28, scale: 2, rings: [[62, 27, 16, 26]] },
    practice: 'Ahora inténtalo tú. Forma la A con calma y compárala con la imagen.',
  },
  E: {
    keys: ['Dedos curvados', 'Pulgar delante de la palma', 'Pulgar debajo de los dedos'],
    short: 'Pulgar delante de la palma',
    compare: 'A',
    detail: {
      x: 50,
      y: 40,
      scale: 1.5,
      rings: [
        [47, 34, 38, 16],
        [56, 47, 18, 12],
      ],
    },
    focus: { x: 54, y: 44, scale: 2.1, rings: [[56, 47, 18, 12]] },
    practice: 'Tu turno. Forma la E y revisa dónde quedó tu pulgar.',
  },
  I: {
    keys: ['Meñique extendido', 'Demás dedos recogidos'],
    short: 'Un dedo extendido',
    compare: 'U',
    detail: {
      x: 45,
      y: 30,
      scale: 1.35,
      rings: [
        [36, 18, 14, 30],
        [52, 38, 30, 24],
      ],
    },
    focus: { x: 38, y: 22, scale: 2, rings: [[36, 18, 14, 30]] },
    practice: 'Inténtalo. Meñique extendido y los demás dedos recogidos.',
  },
  O: {
    keys: ['Dedos curvados hacia el pulgar', 'Forma redondeada'],
    short: 'Forma redondeada',
    compare: null,
    detail: { x: 58, y: 36, scale: 1.5, rings: [[60, 36, 26, 22]] },
    focus: { x: 58, y: 38, scale: 1.9, rings: [[60, 36, 26, 22]] },
    practice: 'Tu turno. Curva los dedos hacia el pulgar y busca la forma redondeada.',
  },
  U: {
    keys: ['Índice y medio extendidos', 'Dedos juntos', 'Otros dedos recogidos'],
    short: 'Dos dedos juntos',
    compare: 'I',
    detail: {
      x: 50,
      y: 32,
      scale: 1.35,
      rings: [
        [56, 20, 18, 34],
        [40, 50, 22, 22],
      ],
    },
    focus: { x: 56, y: 22, scale: 1.9, rings: [[56, 20, 18, 34]] },
    practice: 'Inténtalo. Índice y medio extendidos y juntos.',
  },
};
