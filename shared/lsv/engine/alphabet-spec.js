import { fingerPoints } from './descriptors.js';

// Especificación técnica del abecedario LSV usada por el motor de reconocimiento.
// Fuente de verdad documental: docs/LSV_ALPHABET_SPECIFICATION.md (matriz completa y fuentes).
//
// Fuentes (identificadores de docs/lsv-alphabet-sources.json y docs/LSV_ALPHABET_RESEARCH.md):
//   manual-fuentes-2022  Fichas del curso (Y. Fuentes, Manual básico de LSV, 2022), pp. 5–6.
//   oviedo-2000-part3    Oviedo, ULA 2000: I (detención), J (giro de muñeca neutra→supina), S (p. 62).
//   upel-martinez-2018   Martínez, UPEL 2018, pp. 65–66: alfabeto unimanual, P con dos
//                        configuraciones, LL y Ñ propias del alfabeto venezolano.
//
// Estados de evidencia:
//   DOCUMENTED             Ficha del curso; sin contradicción encontrada en fuentes textuales.
//   TEXT_AND_REFERENCE     Ficha y descripción textual académica coincidentes.
//   SOURCE_CONFLICT        Una fuente académica describe otra configuración: se evalúa la ficha del
//                          curso y se marca para revisión por personas competentes en LSV.
//   VARIANT_PENDING        Variante documentada pero no descrita; solo se evalúa la de la ficha.
//   MOTION_FROM_REFERENCE  Movimiento tomado solo de las flechas de la ficha; protocolo pendiente.
//   REFERENCE_ONLY         La ficha no permite fijar rasgos verificables: no se reconoce.
//   BLOCKED                Sin configuración descrita en las fuentes consultadas: no se implementa.

const NAMES = { index: 'índice', middle: 'medio', ring: 'anular', pinky: 'meñique' };
const ALL = ['index', 'middle', 'ring', 'pinky'];

// Constructores de restricciones. critical: debe cumplirse (≥0,5) para declarar compatibilidad.
const c = (id, score, hint, { critical = true, part = 'hand' } = {}) => ({
  id,
  score,
  hint,
  critical,
  part,
});
const extended = (finger, options) =>
  c(`${finger}.extended`, (d) => d.fingers[finger].extended, `Extiende el dedo ${NAMES[finger]}.`, {
    part: finger,
    ...options,
  });
const closed = (finger, options) =>
  c(
    `${finger}.closed`,
    (d) => d.fingers[finger].closed,
    `Dobla el ${NAMES[finger]} hacia la palma.`,
    { part: finger, ...options },
  );
const bent = (finger, options) =>
  c(`${finger}.bent`, (d) => d.fingers[finger].bent, `Flexiona el dedo ${NAMES[finger]}.`, {
    part: finger,
    ...options,
  });
const curved = (finger, options) =>
  c(
    `${finger}.curved`,
    (d) => d.fingers[finger].curved,
    `Curva el ${NAMES[finger]} sin cerrarlo del todo.`,
    { part: finger, ...options },
  );
const draped = (finger, options) =>
  c(
    `${finger}.draped`,
    (d) => d.fingers[finger].draped,
    `Baja el ${NAMES[finger]} por encima del pulgar.`,
    { part: finger, ...options },
  );
const hooked = (finger, options) =>
  c(
    `${finger}.hooked`,
    (d) => d.fingers[finger].hooked,
    `Dobla la punta del ${NAMES[finger]} en forma de gancho.`,
    { part: finger, ...options },
  );
const together = (pair, options) =>
  c(
    `${pair}.together`,
    (d) => d.pairs[pair].together,
    `Junta los dedos ${pair
      .split('-')
      .map((name) => NAMES[name])
      .join(' y ')}.`,
    { part: pair, ...options },
  );
const spread = (pair, options) =>
  c(
    `${pair}.spread`,
    (d) => d.pairs[pair].spread,
    `Separa los dedos ${pair
      .split('-')
      .map((name) => NAMES[name])
      .join(' y ')}.`,
    { part: pair, ...options },
  );
const thumb = (property, hint, options) =>
  c(`thumb.${property}`, (d) => d.thumb[property], hint, { part: 'thumb', ...options });
const touches = (finger, options) =>
  c(
    `thumb.touches.${finger}`,
    (d) => d.thumb.touches[finger],
    `Junta la punta del pulgar con la del ${NAMES[finger]}.`,
    { part: 'thumb', ...options },
  );
const apart = (finger, options) =>
  c(
    `thumb.apart.${finger}`,
    (d) => d.thumb.apart[finger],
    `Deja un espacio entre el pulgar y el ${NAMES[finger]}.`,
    { part: 'thumb', ...options },
  );
const points = (finger, where, options) =>
  c(
    `${finger}.points.${where}`,
    (d) => fingerPoints(d, finger, where),
    {
      up: `Apunta el ${NAMES[finger]} hacia arriba.`,
      side: `Gira la mano para que el ${NAMES[finger]} apunte hacia un lado.`,
      down: `Apunta el ${NAMES[finger]} hacia abajo.`,
    }[where],
    { part: 'orientation', ...options },
  );
const handUp = (options) =>
  c('hand.up', (d) => d.orientation.handUp, 'Orienta la mano con los dedos hacia arriba.', {
    part: 'orientation',
    ...options,
  });
const palmToward = (options) =>
  c('palm.toward', (d) => d.orientation.palmToward, 'Gira la palma hacia la cámara.', {
    part: 'orientation',
    critical: false,
    ...options,
  });
const closedExcept = (kept, options) =>
  ALL.filter((finger) => !kept.includes(finger)).map((finger) => closed(finger, options));

const notCrossed = (options) =>
  c(
    'index-middle.notCrossed',
    (d) => 1 - d.pairs['index-middle'].crossed,
    'Descruza los dedos índice y medio.',
    { part: 'index-middle', ...options },
  );
const thumbAcross = (options) =>
  thumb('across', 'Cruza el pulgar por delante de la palma.', options);
const thumbOut = (options) => thumb('out', 'Separa el pulgar del índice.', options);
const thumbTucked = ({ hint = 'Recoge el pulgar junto a la palma.', ...options } = {}) =>
  thumb('tucked', hint, { critical: false, ...options });

const M = 'manual-fuentes-2022';
const O = 'oviedo-2000-part3';
const U = 'upel-martinez-2018';

/**
 * Letra estática o dinámica con su evidencia. `constraints` describe la configuración de la ficha
 * del curso; `similar` alimenta la comparación con otras clases y las pruebas de confusión.
 */
const letters = {
  A: {
    status: 'SOURCE_CONFLICT',
    sources: [M, O],
    description: 'Puño cerrado; pulgar extendido junto al lado del índice, apuntando hacia arriba.',
    similar: ['S', 'E', 'T'],
    constraints: [
      ...closedExcept([]),
      thumb('alongside', 'Coloca el pulgar recto junto al índice, hacia arriba.'),
      handUp({ critical: false }),
      palmToward(),
    ],
  },
  B: {
    status: 'DOCUMENTED',
    sources: [M],
    description: 'Cuatro dedos extendidos y juntos; pulgar doblado sobre la palma.',
    similar: ['U', 'W', 'P'],
    constraints: [
      ...['index', 'middle', 'ring', 'pinky'].map((finger) => extended(finger)),
      together('index-middle'),
      together('middle-ring', { critical: false }),
      together('ring-pinky', { critical: false }),
      thumbAcross(),
      handUp(),
      palmToward(),
    ],
  },
  C: {
    status: 'DOCUMENTED',
    sources: [M],
    description: 'Dedos juntos y curvados; pulgar curvado enfrente, sin tocar los dedos.',
    similar: ['O', 'E'],
    constraints: [
      curved('index'),
      curved('middle'),
      curved('ring', { critical: false }),
      curved('pinky', { critical: false }),
      apart('index'),
      c(
        'thumb.notAcross',
        (d) => 1 - d.thumb.across,
        'Separa el pulgar de la palma para formar la curva.',
        { part: 'thumb', critical: false },
      ),
    ],
  },
  D: {
    status: 'DOCUMENTED',
    sources: [M],
    description:
      'Índice extendido hacia arriba; medio, anular y meñique curvados tocando el pulgar.',
    similar: ['O', 'F', 'L', 'X'],
    constraints: [
      extended('index'),
      points('index', 'up'),
      bent('middle'),
      bent('ring'),
      bent('pinky', { critical: false }),
      touches('middle'),
    ],
  },
  E: {
    status: 'DOCUMENTED',
    sources: [M],
    description: 'Dedos flexionados con las puntas sobre el pulgar, que cruza la palma.',
    similar: ['A', 'S', 'O', 'M', 'N'],
    constraints: [
      ...ALL.map((finger) => bent(finger)),
      thumbAcross(),
      // Separabilidad E/S baja: la profundidad de MediaPipe está comprimida (ver especificación).
      thumb('underFingers', 'Apoya las puntas de los dedos sobre el pulgar.', { critical: false }),
      handUp({ critical: false }),
      palmToward(),
    ],
  },
  F: {
    status: 'DOCUMENTED',
    sources: [M],
    description: 'Índice y pulgar forman un círculo; medio, anular y meñique extendidos.',
    similar: ['D', 'O', 'W'],
    constraints: [
      bent('index'),
      touches('index'),
      extended('middle'),
      extended('ring'),
      extended('pinky'),
      handUp({ critical: false }),
    ],
  },
  G: {
    status: 'DOCUMENTED',
    sources: [M],
    description: 'Índice extendido apuntando hacia un lado; los demás dedos y el pulgar recogidos.',
    similar: ['D', 'L', 'H', 'Z'],
    constraints: [
      extended('index'),
      points('index', 'side'),
      ...closedExcept(['index']),
      thumbTucked(),
    ],
  },
  H: {
    status: 'DOCUMENTED',
    sources: [M],
    description: 'Índice y medio extendidos y juntos, apuntando hacia un lado.',
    similar: ['U', 'G', 'P', 'N'],
    constraints: [
      extended('index'),
      extended('middle'),
      together('index-middle'),
      points('index', 'side'),
      ...closedExcept(['index', 'middle']),
    ],
  },
  I: {
    status: 'TEXT_AND_REFERENCE',
    sources: [M, O],
    description: 'Meñique extendido hacia arriba; los demás dedos cerrados (Oviedo 2000, p. 57).',
    similar: ['J', 'Y'],
    constraints: [
      extended('pinky'),
      ...closedExcept(['pinky']),
      thumbTucked({ critical: true, hint: 'Cierra el pulgar sobre los dedos doblados.' }),
      handUp({ critical: false }),
      palmToward(),
    ],
  },
  K: {
    status: 'DOCUMENTED',
    sources: [M],
    description: 'Índice y medio extendidos y separados; la punta del pulgar apoyada en el medio.',
    similar: ['V', 'R', 'U', 'P'],
    constraints: [
      extended('index'),
      extended('middle'),
      thumb('onMiddle', 'Apoya la punta del pulgar en el dedo medio, entre los dos dedos.'),
      spread('index-middle', { critical: false }),
      ...closedExcept(['index', 'middle']),
      handUp(),
    ],
  },
  L: {
    status: 'DOCUMENTED',
    sources: [M],
    description: 'Índice extendido hacia arriba y pulgar extendido hacia el lado, formando una L.',
    similar: ['G', 'D', 'Y'],
    constraints: [extended('index'), points('index', 'up'), thumbOut(), ...closedExcept(['index'])],
  },
  M: {
    status: 'DOCUMENTED',
    sources: [M],
    description: 'Índice, medio y anular doblados hacia abajo sobre el pulgar.',
    similar: ['N', 'E', 'S'],
    constraints: [draped('index'), draped('middle'), draped('ring'), thumbTucked()],
  },
  N: {
    status: 'DOCUMENTED',
    sources: [M],
    description: 'Índice y medio doblados hacia abajo sobre el pulgar; anular y meñique cerrados.',
    similar: ['M', 'Ñ', 'U'],
    constraints: [
      draped('index'),
      draped('middle'),
      closed('ring'),
      closed('pinky', { critical: false }),
      thumbTucked(),
    ],
  },
  O: {
    status: 'DOCUMENTED',
    sources: [M],
    description: 'Todos los dedos curvados con las puntas tocando el pulgar, formando una O.',
    similar: ['C', 'E', 'D', 'F'],
    constraints: [
      curved('index'),
      curved('middle'),
      curved('ring', { critical: false }),
      curved('pinky', { critical: false }),
      touches('index'),
      touches('middle', { critical: false }),
    ],
  },
  P: {
    status: 'VARIANT_PENDING',
    sources: [M, U],
    description: 'Variante de la ficha: índice, medio y anular extendidos y juntos, hacia un lado.',
    similar: ['H', 'W', 'B'],
    constraints: [
      extended('index'),
      extended('middle'),
      extended('ring'),
      together('index-middle'),
      points('index', 'side'),
      closed('pinky', { critical: false }),
    ],
  },
  Q: {
    status: 'REFERENCE_ONLY',
    sources: [M],
    description:
      'La ficha muestra la mano hacia abajo con índice y pulgar curvados; no fija contacto ni orientación verificables.',
    similar: ['G', 'X'],
    constraints: [],
  },
  R: {
    status: 'DOCUMENTED',
    sources: [M],
    description: 'Índice y medio extendidos y cruzados; anular y meñique cerrados con el pulgar.',
    similar: ['U', 'V', 'K'],
    constraints: [
      extended('index'),
      extended('middle'),
      c(
        'index-middle.crossed',
        (d) => d.pairs['index-middle'].crossed,
        'Cruza el dedo medio sobre el índice.',
        { part: 'index-middle' },
      ),
      ...closedExcept(['index', 'middle']),
      handUp(),
    ],
  },
  S: {
    status: 'SOURCE_CONFLICT',
    sources: [M, O],
    description: 'Ficha: puño cerrado con el pulgar cruzado por delante de los dedos.',
    similar: ['A', 'E', 'T'],
    constraints: [
      ...closedExcept([]),
      thumbAcross(),
      thumb('overFingers', 'Cruza el pulgar por delante de los dedos cerrados.', {
        critical: false,
      }),
      handUp({ critical: false }),
    ],
  },
  T: {
    status: 'REFERENCE_ONLY',
    sources: [M],
    description:
      'Puño con el pulgar elevado junto al índice; la ficha no distingue con seguridad su contacto respecto de la A.',
    similar: ['A', 'S'],
    constraints: [],
  },
  U: {
    status: 'DOCUMENTED',
    sources: [M],
    description: 'Índice y medio extendidos y juntos hacia arriba; pulgar sobre anular y meñique.',
    similar: ['V', 'H', 'R', 'N', 'K'],
    constraints: [
      extended('index'),
      extended('middle'),
      together('index-middle'),
      notCrossed({ critical: false }),
      ...closedExcept(['index', 'middle']),
      thumbAcross({ critical: false }),
      handUp(),
    ],
  },
  V: {
    status: 'DOCUMENTED',
    sources: [M],
    description:
      'Índice y medio extendidos y separados hacia arriba; pulgar sobre anular y meñique.',
    similar: ['U', 'K', 'W', 'R'],
    constraints: [
      extended('index'),
      extended('middle'),
      spread('index-middle'),
      notCrossed(),
      ...closedExcept(['index', 'middle']),
      c(
        'thumb.notOnMiddle',
        (d) => 1 - d.thumb.onMiddle,
        'Lleva el pulgar sobre el anular y el meñique doblados.',
        { part: 'thumb', critical: false },
      ),
      handUp(),
    ],
  },
  W: {
    status: 'DOCUMENTED',
    sources: [M],
    description: 'Índice, medio y anular extendidos y separados; pulgar sobre el meñique.',
    similar: ['V', 'F', 'B', 'P'],
    constraints: [
      extended('index'),
      extended('middle'),
      extended('ring'),
      spread('index-middle', { critical: false }),
      spread('middle-ring', { critical: false }),
      closed('pinky'),
      handUp(),
    ],
  },
  X: {
    status: 'DOCUMENTED',
    sources: [M],
    description: 'Índice en forma de gancho hacia arriba; los demás dedos cerrados.',
    similar: ['D', 'G', 'Z'],
    constraints: [
      hooked('index'),
      c(
        'index.lead',
        (d) => d.fingers.index.lead,
        'Eleva el índice doblado por encima de los demás dedos.',
        { part: 'index' },
      ),
      ...closedExcept(['index']),
      handUp({ critical: false }),
    ],
  },
  Y: {
    status: 'DOCUMENTED',
    sources: [M],
    description: 'Pulgar y meñique extendidos; índice, medio y anular cerrados.',
    similar: ['I', 'L'],
    constraints: [extended('pinky'), thumbOut(), ...closedExcept(['pinky'])],
  },
};

// Las letras con movimiento parten de una postura estática y exigen un movimiento completo.
const motionLetters = {
  J: {
    status: 'TEXT_AND_REFERENCE',
    sources: [M, O],
    description:
      'Configuración de I y giro de muñeca de posición neutra a supina (Oviedo 2000, pp. 57–58).',
    similar: ['I', 'Y'],
    from: 'I',
    motion: { type: 'ROTATION', minDegrees: 45 },
  },
  Ñ: {
    status: 'MOTION_FROM_REFERENCE',
    sources: [M, U],
    description: 'Configuración de N con oscilación lateral (flecha doble de la ficha).',
    similar: ['N', 'M'],
    from: 'N',
    motion: { type: 'OSCILLATION', minReversals: 2 },
  },
  Z: {
    status: 'MOTION_FROM_REFERENCE',
    sources: [M],
    description: 'Índice extendido que traza una Z (flechas de la ficha).',
    similar: ['D', 'G', 'X'],
    from: 'ONE',
    motion: { type: 'ZIGZAG', minReversals: 2 },
  },
};

// Postura inicial de Z: índice extendido hacia arriba con los demás dedos cerrados. No es una letra.
const helperShapes = {
  ONE: {
    status: 'MOTION_FROM_REFERENCE',
    sources: [M],
    description: 'Índice extendido hacia arriba; los demás dedos cerrados.',
    constraints: [
      extended('index'),
      points('index', 'up'),
      ...closedExcept(['index']),
      thumbTucked(),
    ],
  },
};

// Digrafos tradicionales investigados. No se implementan sin descripción verificable.
export const BLOCKED_LETTERS = Object.freeze({
  CH: 'Ninguna fuente LSV consultada describe su configuración; no se incorpora.',
  LL: 'Martínez (UPEL 2018, p. 66) la documenta como letra del alfabeto venezolano, sin describir su ejecución.',
  RR: 'Aparece en materiales ilustrados de terceros sin descripción ni licencia; no se incorpora.',
});

export const STATIC_SPECS = Object.freeze(letters);
export const MOTION_SPECS = Object.freeze(motionLetters);
export const HELPER_SPECS = Object.freeze(helperShapes);

/** Letras con rasgos estáticos verificables por el motor. */
export const STATIC_RECOGNIZABLE = Object.freeze(
  Object.keys(letters).filter((letter) => letters[letter].constraints.length > 0),
);

/** Letras con movimiento cuyo análisis temporal está implementado. */
export const MOTION_RECOGNIZABLE = Object.freeze(Object.keys(motionLetters));

/**
 * @param {string} letter Letra del abecedario.
 * @returns {object|null} Especificación estática, dinámica o null si no existe.
 */
export function letterSpec(letter) {
  return letters[letter] ?? motionLetters[letter] ?? null;
}

/**
 * @param {string} letter Letra objetivo.
 * @returns {boolean} El motor puede evaluar la letra (estática o con movimiento).
 */
export function engineSupports(letter) {
  return STATIC_RECOGNIZABLE.includes(letter) || MOTION_RECOGNIZABLE.includes(letter);
}

/**
 * @param {string} name Letra o postura auxiliar.
 * @returns {object|null} Especificación con restricciones estáticas.
 */
export function shapeSpec(name) {
  return letters[name] ?? helperShapes[name] ?? null;
}
