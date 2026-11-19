const tips = [4, 8, 12, 16, 20];

/**
 * Describe problemas observables en una captura sincronizada validada, sin interpretar una seña.
 * No diagnostica oclusión de dedos a partir de puntos inferidos ni velocidad lingüística incorrecta.
 * @param {object|null} sequence Captura v2 validada; null si no hay información temporal.
 * @returns {string|null} Indicación de encuadre/movimiento o null sin evidencia suficiente.
 */
export function captureFeedback(sequence) {
  const frames = sequence?.frames;
  if (!frames?.length) return null;
  if (frames.every((frame) => frame.count === 0)) return 'NO_HAND';
  let edgeRun = 0;
  let rapidMs = 0;
  let previous = null;
  let rapid = false;
  for (const frame of frames) {
    const item = frame.singleHand && frame.hands[frame.singleHand];
    if (!frame.stable || !item) {
      previous = null;
      edgeRun = 0;
      rapidMs = 0;
      continue;
    }
    // Tres observaciones junto al borde solicitan visibilidad, sin afirmar una oclusión.
    const edge = tips.some((index) =>
      item.points[index].slice(0, 2).some((value) => value <= 0.01 || value >= 0.99),
    );
    edgeRun = edge ? edgeRun + 1 : 0;
    if (edgeRun >= 3) return 'PARTIAL_HAND';
    const elapsed = previous ? frame.t - previous.t : 0;
    if (previous && item.trackId === previous.item.trackId && elapsed >= 40 && elapsed <= 200) {
      const aspect = frame.width / frame.height;
      const displacement = Math.sqrt(
        item.points.reduce((sum, point, index) => {
          const before = previous.item.points[index];
          return sum + ((point[0] - before[0]) * aspect) ** 2 + (point[1] - before[1]) ** 2;
        }, 0) / 21,
      );
      // Ayuda visual heurística: >2 alturas de imagen/s sostenidas durante 200 ms.
      // No modifica DTW ni diagnostica una velocidad incorrecta de LSV.
      rapidMs = displacement / (elapsed / 1000) > 2 ? rapidMs + elapsed : 0;
      if (rapidMs >= 200) rapid = true;
    } else rapidMs = 0;
    previous = { item, t: frame.t };
  }
  return rapid ? 'RAPID_MOVEMENT' : null;
}
