// Umbrales orientativos sobre coordenadas normalizadas (0–1) de MediaPipe. Ayudan a encuadrar;
// no se calibraron con usuarios y nunca intervienen en la clasificación.
const LIMITS = { far: 0.2, near: 0.75, edge: 0.02, centerX: [0.25, 0.75], centerY: [0.2, 0.8] };

const messages = {
  none: 'No vemos tu mano. Colócala frente a la cámara.',
  many: 'Usa solo una mano para esta práctica.',
  far: 'Acerca la mano a la cámara.',
  near: 'Aleja un poco la mano.',
  edge: 'La mano se sale del encuadre. Llévala al centro.',
  offcenter: 'Mueve la mano hacia el recuadro central.',
  ok: 'Mano bien colocada. Mantén la seña quieta.',
};

/**
 * Indica cómo colocar la mano a partir de un resultado real del detector.
 * @param {{landmarks: {x: number, y: number}[][]}} result Resultado de HandLandmarker para un frame.
 * @returns {{state: string, message: string, ready: boolean}} Estado, texto para el estudiante y si está bien colocada.
 */
export function handGuidance(result) {
  const hands = result?.landmarks ?? [];
  let state = 'ok';
  if (!hands.length) state = 'none';
  else if (hands.length > 1) state = 'many';
  else {
    const xs = hands[0].map((point) => point.x);
    const ys = hands[0].map((point) => point.y);
    const [left, right, top, bottom] = [
      Math.min(...xs),
      Math.max(...xs),
      Math.min(...ys),
      Math.max(...ys),
    ];
    const size = Math.max(right - left, bottom - top);
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    if (size < LIMITS.far) state = 'far';
    else if (size > LIMITS.near) state = 'near';
    else if (
      left < LIMITS.edge ||
      top < LIMITS.edge ||
      right > 1 - LIMITS.edge ||
      bottom > 1 - LIMITS.edge
    )
      state = 'edge';
    else if (
      centerX < LIMITS.centerX[0] ||
      centerX > LIMITS.centerX[1] ||
      centerY < LIMITS.centerY[0] ||
      centerY > LIMITS.centerY[1]
    )
      state = 'offcenter';
  }
  return { state, message: messages[state], ready: state === 'ok' };
}
