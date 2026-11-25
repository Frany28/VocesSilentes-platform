import {
  FINGERS,
  FINGER_NAMES,
  THUMB,
  WRIST,
  add,
  angle,
  cross,
  distance,
  dot,
  scale,
  sub,
  unit,
} from './landmarks.js';

const DEG = 180 / Math.PI;
const clampUnit = (value) => Math.min(1, Math.max(-1, value));

/**
 * Ejes anatómicos de la palma, independientes de la posición en la imagen.
 * - radial: del meñique al índice (lado del pulgar).
 * - distal: de la muñeca al nudillo del medio.
 * - palmar: normal de la palma hacia el lado palmar (para la mano canónica derecha).
 * @param {number[][]} p Puntos canónicos.
 * @returns {{radial: number[], distal: number[], palmar: number[], center: number[]}} Ejes unitarios.
 */
export function palmAxes(p) {
  const radial = unit(sub(p[5], p[17]));
  const distal = unit(sub(p[9], p[WRIST]));
  // (índice − muñeca) × (meñique − muñeca): con la palma hacia la cámara en una mano derecha,
  // apunta hacia la cámara (z negativo), es decir, hacia el lado palmar.
  const palmar = unit(cross(sub(p[5], p[WRIST]), sub(p[17], p[WRIST])));
  const center = scale(add(add(p[WRIST], p[5]), add(p[9], p[17])), 0.25);
  return { radial, distal, palmar, center };
}

/**
 * Flexión de un dedo largo a partir de sus falanges en 3D.
 * @param {number[][]} p Puntos canónicos.
 * @param {number[]} joints Índices MCP, PIP, DIP y punta.
 * @param {object} axes Ejes de la palma.
 * @returns {object} Ángulos (grados), dirección y alcance relativo.
 */
function fingerFeatures(p, [mcp, pip, dip, tip], axes) {
  const proximal = sub(p[pip], p[mcp]);
  const middle = sub(p[dip], p[pip]);
  const distalBone = sub(p[tip], p[dip]);
  // MCP: inclinación de la falange proximal respecto al plano de la palma, positiva hacia la palma.
  const mcpFlex = Math.asin(clampUnit(dot(unit(proximal), axes.palmar))) * DEG;
  const pipFlex = angle(proximal, middle);
  const dipFlex = angle(middle, distalBone);
  const length = distance(p[mcp], p[pip]) + distance(p[pip], p[dip]) + distance(p[dip], p[tip]);
  return {
    mcpFlex,
    pipFlex,
    dipFlex,
    // Curvatura total: 0 en un dedo recto; ~200–260 en un puño cerrado.
    curl: Math.max(0, mcpFlex) + pipFlex + dipFlex,
    // 1 = recto; disminuye al doblarse. Robusto ante ruido de z en un solo punto.
    straightness: length > 1e-9 ? distance(p[mcp], p[tip]) / length : 1,
    direction: unit(sub(p[tip], p[mcp])),
    proximalDirection: unit(proximal),
    // Avance de la punta respecto al nudillo: a lo largo de la mano (rise) y hacia la palma (forward).
    rise: dot(sub(p[tip], p[mcp]), axes.distal),
    forward: dot(sub(p[tip], p[mcp]), axes.palmar),
  };
}

/**
 * Ángulo entre dos dedos dentro del plano de la palma (separación lateral).
 * @param {number[]} a Dirección del primer dedo.
 * @param {number[]} b Dirección del segundo dedo.
 * @param {number[]} palmar Normal de la palma.
 * @returns {number} Grados.
 */
function spreadAngle(a, b, palmar) {
  const project = (v) => sub(v, scale(palmar, dot(v, palmar)));
  return angle(project(a), project(b));
}

/**
 * Extrae rasgos geométricos interpretables de una mano canónica (derecha, palma de escala 1).
 * No decide letras: alimenta la especificación declarativa y la retroalimentación educativa.
 * @param {number[][]} p Puntos canónicos de canonicalHand.
 * @returns {object} Rasgos por dedo, pulgar, contactos, cruces y orientación.
 */
export function handFeatures(p) {
  const axes = palmAxes(p);
  const fingers = Object.fromEntries(
    FINGER_NAMES.map((name) => [name, fingerFeatures(p, FINGERS[name], axes)]),
  );
  const [cmc, thumbMcp, ip, thumbTip] = THUMB.map((index) => p[index]);
  const lateral = (point) => dot(sub(point, axes.center), axes.radial);
  const along = (point) => dot(sub(point, p[WRIST]), axes.distal);
  const depth = (point) => dot(sub(point, axes.center), axes.palmar);
  const tipOf = (name) => p[FINGERS[name][3]];
  const thumb = {
    bend:
      angle(sub(thumbMcp, cmc), sub(ip, thumbMcp)) + angle(sub(ip, thumbMcp), sub(thumbTip, ip)),
    // Posición de la punta en la palma: lateral > lateral(índice) ⇒ fuera, del lado radial;
    // lateral < lateral(índice) ⇒ cruza hacia el meñique.
    lateral: lateral(thumbTip),
    indexLateral: lateral(p[5]),
    pinkyLateral: lateral(p[17]),
    along: along(thumbTip),
    depth: depth(thumbTip),
    toIndexMcp: distance(thumbTip, p[5]),
    toIndexPip: distance(thumbTip, p[6]),
    toMiddlePip: distance(thumbTip, p[10]),
    toPalmCenter: distance(thumbTip, axes.center),
    direction: unit(sub(thumbTip, thumbMcp)),
    // Apertura respecto al índice (abducción), en el plano de la palma.
    abduction: spreadAngle(sub(thumbTip, cmc), sub(p[8], p[5]), axes.palmar),
    // > 0: la punta del pulgar queda por delante (lado palmar) de las puntas de índice y medio.
    overFingers: depth(thumbTip) - Math.max(depth(tipOf('index')), depth(tipOf('middle'))),
  };
  const contacts = Object.fromEntries(
    FINGER_NAMES.map((name) => [name, distance(thumbTip, tipOf(name))]),
  );
  const tipGaps = {
    indexMiddle: distance(tipOf('index'), tipOf('middle')),
    middleRing: distance(tipOf('middle'), tipOf('ring')),
    ringPinky: distance(tipOf('ring'), tipOf('pinky')),
  };
  const spread = {
    indexMiddle: spreadAngle(fingers.index.direction, fingers.middle.direction, axes.palmar),
    middleRing: spreadAngle(fingers.middle.direction, fingers.ring.direction, axes.palmar),
    ringPinky: spreadAngle(fingers.ring.direction, fingers.pinky.direction, axes.palmar),
  };
  // Cruce índice/medio: el orden lateral de las puntas se invierte respecto al de los nudillos.
  const crossing = {
    indexMiddle:
      (lateral(tipOf('index')) - lateral(tipOf('middle'))) /
      Math.max(1e-6, lateral(p[5]) - lateral(p[9])),
  };
  // Orientación en la imagen (y hacia abajo). La mano canónica es derecha; z negativo = cámara.
  const orientation = {
    hand: axes.distal,
    palmar: axes.palmar,
    // > 0.5: palma hacia la cámara; < -0.5: dorso hacia la cámara; resto: de canto.
    palmTowardCamera: -axes.palmar[2],
  };
  return { fingers, thumb, contacts, tipGaps, spread, crossing, orientation, axes };
}

/**
 * Dirección cualitativa de un vector en la imagen, sin depender del lado (izquierda/derecha).
 * @param {number[]} vector Dirección canónica.
 * @returns {{up: number, down: number, side: number}} Componentes normalizados.
 */
export function imageDirection(vector) {
  const planar = Math.hypot(vector[0], vector[1]) || 1;
  return {
    up: Math.max(0, -vector[1] / planar),
    down: Math.max(0, vector[1] / planar),
    side: Math.abs(vector[0]) / planar,
  };
}
