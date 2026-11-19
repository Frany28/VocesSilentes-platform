const validCode = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(value);

/**
 * Comprueba continuidad, duración y geometría de una secuencia capturada, sin asignarle una letra.
 * @param {unknown} frames Observaciones reales del detector.
 * @returns {object[]} Frames compatibles con el extractor de características.
 * @throws {Error} Mano ausente, cambio de lateralidad, pausas largas o coordenadas inválidas.
 */
export function validateFrames(frames) {
  if (!Array.isArray(frames) || frames.length < 16 || frames.length > 60)
    throw new Error('Se necesitan entre 16 y 60 frames reales de una sola mano');
  let previous = -1;
  for (const frame of frames) {
    if (
      !frame ||
      !Number.isFinite(frame.t) ||
      frame.t < 0 ||
      frame.t <= previous ||
      (previous >= 0 && frame.t - previous > 400) ||
      !['Left', 'Right'].includes(frame.hand) ||
      frame.hand !== frames[0].hand ||
      frame.trackId !== frames[0].trackId ||
      (frame.trackId !== undefined && !validCode(frame.trackId)) ||
      !Number.isInteger(frame.width) ||
      !Number.isInteger(frame.height) ||
      frame.width < 16 ||
      frame.height < 16 ||
      frame.width > 4096 ||
      frame.height > 4096 ||
      frame.width !== frames[0].width ||
      frame.height !== frames[0].height ||
      !Array.isArray(frame.points) ||
      frame.points.length !== 21 ||
      frame.points.some(
        (point) =>
          !Array.isArray(point) ||
          point.length !== 3 ||
          point.some((coordinate) => !Number.isFinite(coordinate) || Math.abs(coordinate) > 10),
      )
    )
      throw new Error(
        'Muestra incompleta: mantén una mano visible, sin interrupciones ni cambio de cámara',
      );
    previous = frame.t;
  }
  const duration = frames.at(-1).t - frames[0].t;
  if (duration < 1500 || duration > 6000)
    throw new Error('La muestra debe durar entre 1,5 y 6 segundos');
  return frames.map(
    ({
      t,
      hand,
      width,
      height,
      points,
      trackId,
      rawHand,
      handednessScore,
      handednessCorrected,
    }) => ({
      t,
      hand,
      width,
      height,
      points,
      ...(trackId ? { trackId } : {}),
      ...(rawHand !== undefined ? { rawHand, handednessScore, handednessCorrected } : {}),
    }),
  );
}
