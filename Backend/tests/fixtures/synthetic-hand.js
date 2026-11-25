// Generador SINTÉTICO de 21 puntos con forma de MediaPipe, por cinemática directa.
// Exclusivamente para pruebas de software (invariancias, lógica de decisión, temporalidad).
// No son muestras de LSV ni sustituyen grabaciones reales: no se usan para entrenar ni para medir
// precisión. Las posturas transcriben las fichas del curso (manual-fuentes-2022).

const FINGER_BASE = {
  index: { mcp: [0.32, -0.92, 0], lengths: [0.45, 0.27, 0.22], abduction: 6 },
  middle: { mcp: [0.08, -1.0, 0], lengths: [0.5, 0.31, 0.24], abduction: 0 },
  ring: { mcp: [-0.14, -0.95, 0], lengths: [0.47, 0.3, 0.23], abduction: -5 },
  pinky: { mcp: [-0.33, -0.85, 0], lengths: [0.36, 0.22, 0.2], abduction: -11 },
};
const ORDER = ['index', 'middle', 'ring', 'pinky'];
const THUMB_CMC = [0.3, -0.2, -0.02];
const RAD = Math.PI / 180;

const EXT = [0, 4, 2];
const CLOSED = [85, 100, 60];
const CURVED = [35, 45, 25];
const DRAPED = [82, 8, 4];
const HOOK = [5, 95, 70];
const BENT = [25, 90, 60];

// Puntas del pulgar en coordenadas canónicas (mano derecha, palma hacia la cámara, dedos arriba).
const THUMBS = {
  alongside: { tip: [0.5, -0.92, -0.12], control: [0.48, -0.5, -0.06] },
  out: { tip: [1.0, -0.45, -0.02], control: [0.65, -0.3, -0.02] },
  across: { tip: [-0.12, -0.62, -0.32], control: [0.6, -0.62, -0.3] },
  tucked: { tip: [0.18, -0.7, -0.3], control: [0.5, -0.55, -0.25] },
};

/**
 * Postura de cada letra según la ficha del curso. Ángulos [MCP, PIP, DIP] en grados.
 * thumb: postura nombrada o { touch: dedo } / { onMiddle: true }.
 */
export const LETTER_POSES = {
  A: {
    fingers: { index: CLOSED, middle: CLOSED, ring: CLOSED, pinky: CLOSED },
    thumb: 'alongside',
  },
  B: { fingers: { index: EXT, middle: EXT, ring: EXT, pinky: EXT }, thumb: 'across', spread: -1 },
  C: {
    fingers: { index: CURVED, middle: CURVED, ring: CURVED, pinky: CURVED },
    thumb: { tip: [0.45, -0.75, -0.75], control: [0.6, -0.4, -0.45] },
    spread: -1,
  },
  D: {
    fingers: { index: EXT, middle: [40, 80, 40], ring: [40, 80, 40], pinky: [40, 80, 40] },
    thumb: { touch: 'middle' },
  },
  E: { fingers: { index: BENT, middle: BENT, ring: BENT, pinky: BENT }, thumb: 'across' },
  F: {
    fingers: { index: [40, 80, 40], middle: EXT, ring: EXT, pinky: EXT },
    thumb: { touch: 'index' },
  },
  G: {
    fingers: { index: EXT, middle: CLOSED, ring: CLOSED, pinky: CLOSED },
    thumb: 'tucked',
    roll: 90,
  },
  H: {
    fingers: { index: EXT, middle: EXT, ring: CLOSED, pinky: CLOSED },
    thumb: 'across',
    spread: -1,
    roll: 90,
  },
  I: { fingers: { index: CLOSED, middle: CLOSED, ring: CLOSED, pinky: EXT }, thumb: 'across' },
  K: {
    fingers: { index: EXT, middle: EXT, ring: CLOSED, pinky: CLOSED },
    thumb: { onMiddle: true },
    spread: 2,
  },
  L: { fingers: { index: EXT, middle: CLOSED, ring: CLOSED, pinky: CLOSED }, thumb: 'out' },
  M: { fingers: { index: DRAPED, middle: DRAPED, ring: DRAPED, pinky: CLOSED }, thumb: 'tucked' },
  N: { fingers: { index: DRAPED, middle: DRAPED, ring: CLOSED, pinky: CLOSED }, thumb: 'tucked' },
  O: {
    fingers: { index: [40, 50, 30], middle: [40, 50, 30], ring: [45, 50, 30], pinky: [50, 50, 30] },
    thumb: { touch: 'index' },
    spread: -1,
  },
  P: {
    fingers: { index: EXT, middle: EXT, ring: EXT, pinky: CLOSED },
    thumb: 'tucked',
    spread: -1,
    roll: 90,
  },
  R: {
    fingers: { index: EXT, middle: EXT, ring: CLOSED, pinky: CLOSED },
    thumb: 'across',
    crossed: true,
  },
  S: {
    fingers: { index: CLOSED, middle: CLOSED, ring: CLOSED, pinky: CLOSED },
    thumb: { tip: [-0.05, -0.85, -0.55], control: [0.55, -0.75, -0.5] },
  },
  U: {
    fingers: { index: EXT, middle: EXT, ring: CLOSED, pinky: CLOSED },
    thumb: 'across',
    spread: -1,
  },
  V: {
    fingers: { index: EXT, middle: EXT, ring: CLOSED, pinky: CLOSED },
    thumb: 'across',
    spread: 4,
  },
  W: {
    fingers: { index: EXT, middle: EXT, ring: EXT, pinky: CLOSED },
    thumb: 'across',
    spread: 2.5,
  },
  X: { fingers: { index: HOOK, middle: CLOSED, ring: CLOSED, pinky: CLOSED }, thumb: 'tucked' },
  Y: { fingers: { index: CLOSED, middle: CLOSED, ring: CLOSED, pinky: EXT }, thumb: 'out' },
  ONE: { fingers: { index: EXT, middle: CLOSED, ring: CLOSED, pinky: CLOSED }, thumb: 'tucked' },
  // Posturas ajenas al abecedario para probar el rechazo.
  OPEN_FIVE: {
    fingers: { index: EXT, middle: EXT, ring: EXT, pinky: EXT },
    thumb: 'out',
    spread: 2,
  },
  MIDDLE_ONLY: {
    fingers: { index: CLOSED, middle: EXT, ring: CLOSED, pinky: CLOSED },
    thumb: 'across',
  },
  RING_PINKY: {
    fingers: { index: CLOSED, middle: CLOSED, ring: EXT, pinky: EXT },
    thumb: 'across',
  },
};

const add = (a, b) => a.map((v, i) => v + b[i]);
const mul = (a, k) => a.map((v) => v * k);

function fingerChain(name, [mcpFlex, pipFlex, dipFlex], { spread = 1, crossed = false }) {
  const base = FINGER_BASE[name];
  let abduction = base.abduction * spread;
  if (crossed && name === 'index') abduction = -14;
  if (crossed && name === 'middle') abduction = 14;
  const a = abduction * RAD;
  const points = [crossed && name === 'middle' ? add(base.mcp, [0, 0, -0.06]) : base.mcp];
  let phi = 0;
  [mcpFlex, pipFlex, dipFlex].forEach((flex, bone) => {
    phi += flex * RAD;
    const direction = [Math.sin(a) * Math.cos(phi), -Math.cos(a) * Math.cos(phi), -Math.sin(phi)];
    points.push(add(points.at(-1), mul(direction, base.lengths[bone])));
  });
  return points;
}

function thumbChain(pose, fingers) {
  let tip;
  let control;
  if (typeof pose === 'string') ({ tip, control } = THUMBS[pose]);
  else if (pose.touch) {
    tip = add(fingers[pose.touch][3], [0.03, 0.02, -0.03]);
    control = [0.62, -0.45, -0.45];
  } else if (pose.onMiddle) {
    tip = add(fingers.middle[1], [0.05, 0.05, -0.06]);
    control = [0.55, -0.55, -0.25];
  } else ({ tip, control } = pose);
  const bezier = (t) =>
    THUMB_CMC.map((v, i) => (1 - t) ** 2 * v + 2 * (1 - t) * t * control[i] + t * t * tip[i]);
  return [THUMB_CMC, bezier(0.42), bezier(0.72), tip];
}

/**
 * Puntos canónicos (mano derecha) de una postura.
 * @param {string} name Letra o postura auxiliar de LETTER_POSES.
 * @returns {number[][]} 21 puntos con la muñeca en el origen.
 */
export function canonicalPose(name) {
  const pose = LETTER_POSES[name];
  const fingers = Object.fromEntries(
    ORDER.map((finger) => [finger, fingerChain(finger, pose.fingers[finger], pose)]),
  );
  return [[0, 0, 0], ...thumbChain(pose.thumb, fingers), ...ORDER.flatMap((f) => fingers[f])];
}

/**
 * Generador pseudoaleatorio determinista (mulberry32) para pruebas reproducibles.
 * @param {number} seed Semilla.
 * @returns {Function} Números en [0, 1).
 */
export function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Lleva una postura canónica a coordenadas de imagen MediaPipe (0–1), con variaciones.
 * @param {number[][]} canonical Puntos canónicos.
 * @param {object} [options] Variaciones de cámara y persona.
 * @param {string} [options.hand] Right o Left (refleja la geometría).
 * @param {number} [options.size] Tamaño de la palma en alturas de imagen.
 * @param {number[]} [options.center] Posición de la muñeca (0–1).
 * @param {number} [options.roll] Giro en el plano de la imagen (grados).
 * @param {number} [options.yaw] Giro alrededor del eje vertical (grados).
 * @param {number} [options.pitch] Giro alrededor del eje lateral (grados).
 * @param {number} [options.zScale] Compresión de profundidad, como en MediaPipe.
 * @param {number} [options.noise] Ruido gaussiano aproximado, en palmas.
 * @param {Function} [options.random] Generador aleatorio reproducible.
 * @param {number} [options.aspect] Relación ancho/alto de la imagen.
 * @returns {number[][]} Puntos de imagen sin reflejar; para hand='Left' se refleja la geometría.
 */
export function toImage(
  canonical,
  {
    hand = 'Right',
    size = 0.22,
    center = [0.5, 0.55],
    roll = 0,
    yaw = 0,
    pitch = 0,
    zScale = 0.6,
    noise = 0,
    random = Math.random,
    aspect = 4 / 3,
  } = {},
) {
  const r = roll * RAD;
  const y = yaw * RAD;
  const p = pitch * RAD;
  const gauss = () => (random() + random() + random() - 1.5) * noise * 2;
  return canonical.map(([x0, y0, z0]) => {
    // Giro en el plano de la imagen (roll), alrededor del eje vertical (yaw) y del lateral (pitch).
    let x = x0 * Math.cos(r) - y0 * Math.sin(r);
    let yy = x0 * Math.sin(r) + y0 * Math.cos(r);
    let z = z0;
    [x, z] = [x * Math.cos(y) + z * Math.sin(y), -x * Math.sin(y) + z * Math.cos(y)];
    [yy, z] = [yy * Math.cos(p) - z * Math.sin(p), yy * Math.sin(p) + z * Math.cos(p)];
    x += gauss();
    yy += gauss();
    z += gauss();
    const side = hand === 'Left' ? -1 : 1;
    return [
      center[0] + (side * x * size) / aspect,
      center[1] + yy * size,
      (z * size * zScale) / aspect,
    ];
  });
}

/**
 * Postura de una letra en imagen, con su rotación propia (G, H, P apuntan hacia un lado).
 * @param {string} name Letra o postura auxiliar.
 * @param {object} [options] Opciones de toImage.
 * @returns {number[][]} 21 puntos de imagen.
 */
export function letterImage(name, options = {}) {
  return toImage(canonicalPose(name), {
    ...options,
    roll: (LETTER_POSES[name].roll ?? 0) + (options.roll ?? 0),
  });
}

/**
 * Secuencia sintética a 30 fps: cada fotograma puede variar postura y transformación.
 * @param {(t: number, k: number) => {pose: string, options?: object}} at Postura y opciones en el
 * instante t (ms) y la fracción k (0–1) del recorrido.
 * @param {{durationMs?: number, hand?: string, fps?: number}} [options] Duración y mano.
 * @returns {object[]} Frames {t, width, height, hand, points}.
 */
export function letterSequence(at, { durationMs = 1500, hand = 'Right', fps = 30 } = {}) {
  const count = Math.round((durationMs / 1000) * fps) + 1;
  return Array.from({ length: count }, (_, index) => {
    const t = Math.round((index * 1000) / fps);
    const { pose, options = {} } = at(t, index / (count - 1));
    return { t, width: 4, height: 3, hand, points: letterImage(pose, { ...options, hand }) };
  });
}

/**
 * Convierte frames de una mano en paquetes del tracker (createHandTracker) para el reconocedor.
 * @param {object[]} frames Frames de letterSequence.
 * @param {{trackId?: string, score?: number}} [options] Identidad y confianza simuladas.
 * @returns {object[]} Paquetes con observaciones estables.
 */
export function trackerPackets(frames, { trackId = 'track_1', score = 0.95 } = {}) {
  return frames.map((frame) => ({
    t: frame.t,
    width: frame.width,
    height: frame.height,
    count: 1,
    stable: true,
    ambiguous: false,
    observations: [
      {
        points: frame.points,
        hand: frame.hand,
        rawHand: frame.hand,
        score,
        trackId,
        stable: true,
      },
    ],
  }));
}

/**
 * Variaciones reproducibles de cámara/persona para una postura.
 * @param {number} seed Semilla.
 * @returns {object} Opciones para toImage.
 */
export function variation(seed) {
  const random = seeded(seed);
  const between = (a, b) => a + (b - a) * random();
  return {
    size: between(0.15, 0.32),
    center: [between(0.35, 0.65), between(0.4, 0.65)],
    roll: between(-15, 15),
    yaw: between(-20, 20),
    pitch: between(-15, 15),
    zScale: between(0.45, 1),
    noise: 0.012,
    random,
  };
}
