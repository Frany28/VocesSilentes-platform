import { matchHandTracks } from './hand-track-matching.js';

/**
 * Estabiliza lateralidad con tres observaciones y asociación espacial; conserva puntos y etiquetas crudas.
 * @param {string} [prefix] Identificador local de sesión; no identifica biológicamente una mano.
 * @returns {{update: Function}} Adaptador de resultados MediaPipe a canales sincronizados Left/Right.
 */
export function createHandTracker(prefix = 'track') {
  let tracks = [];
  let nextId = 0;
  return {
    update(result, timing) {
      const observations = (result.landmarks ?? []).slice(0, 2).map((points, index) => {
        const category = result.handedness?.[index]?.[0];
        return {
          points: points.map(({ x, y, z }) => [x, y, z]),
          rawHand: ['Left', 'Right'].includes(category?.categoryName)
            ? category.categoryName
            : null,
          score: category?.score ?? (category?.categoryName ? 1 : 0),
        };
      });
      const matches = matchHandTracks(tracks, observations, timing.time);
      const current = observations.map((observation, index) => {
        const track = matches[index] ?? { id: `${prefix}_${++nextId}`, hand: null, votes: [] };
        const vote = observation.score >= 0.65 ? observation.rawHand : null;
        track.votes = [...track.votes, vote].slice(-3);
        if (!track.hand && vote && track.votes.length === 3 && track.votes.every((v) => v === vote))
          track.hand = vote;
        if (track.hand && vote && vote !== track.hand && track.votes.every((v) => v === vote)) {
          // Una mano sustituta o un cambio persistente exige otro ID; el intento anterior no se mezcla.
          track.id = `${prefix}_${++nextId}`;
          track.hand = vote;
        }
        const stable = Boolean(
          track.hand && vote && track.votes.filter((v) => v === track.hand).length >= 2,
        );
        Object.assign(track, { points: observation.points, time: timing.time });
        return {
          track,
          observation: {
            ...observation,
            trackId: track.id,
            hand: track.hand,
            stable,
            corrected: stable && observation.rawHand !== track.hand,
          },
        };
      });
      tracks = [
        ...current.map((item) => item.track),
        ...tracks.filter(
          (track) =>
            !current.some((item) => item.track === track) && timing.time - track.time <= 400,
        ),
      ];
      const hands = { Left: null, Right: null };
      const visible = current.map((item) => item.observation);
      let ambiguous = false;
      for (const observation of visible) {
        if (!observation.hand) continue;
        if (hands[observation.hand]) ambiguous = true;
        else hands[observation.hand] = observation;
      }
      if (
        visible.length === 2 &&
        Math.hypot(
          ...visible[0].points[0].slice(0, 2).map((v, axis) => v - visible[1].points[0][axis]),
        ) < 0.06
      )
        ambiguous = true;
      const stable = visible.length > 0 && visible.every((item) => item.stable) && !ambiguous;
      return {
        t: timing.time,
        width: timing.width,
        height: timing.height,
        hands,
        observations: visible,
        count: visible.length,
        stable,
        ambiguous,
        singleHand: stable && visible.length === 1 ? visible[0].hand : null,
      };
    },
  };
}
