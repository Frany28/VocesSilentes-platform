/**
 * Asigna hasta dos observaciones a tracks por muñeca, sin depender del índice de salida de MediaPipe.
 * @param {object[]} tracks Tracks anteriores.
 * @param {object[]} observations Observaciones del frame actual.
 * @param {number} time Instante monotónico en milisegundos.
 * @returns {Array<object|null>} Coincidencias únicas; descarta saltos >0,3 o ausencias >400 ms.
 */
export function matchHandTracks(tracks, observations, time) {
  let best = { cost: Infinity, matches: [] };
  const visit = (index, used, matches, cost) => {
    if (index === observations.length) {
      if (cost < best.cost) best = { cost, matches };
      return;
    }
    visit(index + 1, used, [...matches, null], cost + 0.31);
    for (const track of tracks) {
      if (used.has(track) || time - track.time > 400) continue;
      const distance = Math.hypot(
        ...observations[index].points[0].slice(0, 2).map((v, axis) => v - track.points[0][axis]),
      );
      if (distance > 0.3) continue;
      visit(index + 1, new Set([...used, track]), [...matches, track], cost + distance);
    }
  };
  visit(0, new Set(), [], 0);
  return best.matches;
}
