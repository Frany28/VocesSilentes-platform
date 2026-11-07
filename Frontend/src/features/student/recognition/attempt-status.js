/**
 * Texto del estado del intento, en orden de prioridad: cuenta atrás, captura, resultado, preparación,
 * fase de la captura automática y estado de la cámara.
 * @param {{count: number | null, pending: boolean, frames: object[] | null, preparing: boolean,
 * live: boolean, auto: boolean, phase: string}} state Estado actual del intento.
 * @returns {string} Indicación para el estudiante.
 */
export function attemptStatus({ count, pending, frames, preparing, live, auto, phase }) {
  if (count !== null) return `Prepárate: la captura empieza en ${count}…`;
  if (pending) return 'Capturando… mantén la seña quieta.';
  if (preparing) return 'Espera a que el reconocimiento esté listo.';
  if (!live) return 'Activa la cámara para hacer un intento.';
  if (auto && phase === 'holding')
    return 'Mano detectada: mantén la seña, la captura empieza sola…';
  if (auto && phase === 'rest' && frames)
    return `Intento capturado: ${frames.length} frames reales. Para otro intento, baja la mano y vuelve a formar la seña.`;
  if (frames) return `Intento capturado: ${frames.length} frames reales.`;
  if (auto && phase === 'rest')
    return 'Baja la mano y vuelve a formar la seña para intentarlo de nuevo.';
  if (auto) return 'Forma la seña dentro del recuadro: la captura empieza sola.';
  return 'Forma la seña y pulsa Capturar intento.';
}
