const pointsValid = (points) =>
  Array.isArray(points) &&
  points.length === 21 &&
  points.every(
    (point) =>
      Array.isArray(point) &&
      point.length === 3 &&
      point.every((v) => Number.isFinite(v) && Math.abs(v) <= 10),
  );
const handValid = (item) =>
  item &&
  /^[a-zA-Z0-9_-]{1,64}$/.test(item.trackId) &&
  [null, 'Left', 'Right'].includes(item.hand) &&
  [null, 'Left', 'Right'].includes(item.rawHand) &&
  Number.isFinite(item.score) &&
  item.score >= 0 &&
  item.score <= 1 &&
  typeof item.stable === 'boolean' &&
  typeof item.corrected === 'boolean' &&
  pointsValid(item.points);

/**
 * Valida canales y observaciones sincronizados, con ausencia explícita y geometría original verificable.
 * @param {object} sequence Captura multimanual versión 2.
 * @returns {object} Captura válida sin interpolar ni eliminar observaciones.
 * @throws {Error} Formato, puntos, tiempos, canales contradictorios o dimensiones inválidos.
 */
export function validateHandSequence(sequence) {
  if (
    sequence?.version !== 2 ||
    sequence.coordinateConvention !== 'MEDIAPIPE_UNMIRRORED' ||
    !Array.isArray(sequence.frames) ||
    sequence.frames.length < 16 ||
    sequence.frames.length > 60
  )
    throw new Error('Se necesitan entre 16 y 60 frames sincronizados');
  let previous = -1;
  for (const frame of sequence.frames) {
    if (
      !Number.isFinite(frame.t) ||
      frame.t < 0 ||
      frame.t <= previous ||
      (previous >= 0 && frame.t - previous > 400) ||
      !Number.isInteger(frame.width) ||
      !Number.isInteger(frame.height) ||
      frame.width < 16 ||
      frame.height < 16 ||
      frame.width > 4096 ||
      frame.height > 4096 ||
      frame.width !== sequence.frames[0].width ||
      frame.height !== sequence.frames[0].height ||
      !frame.hands ||
      !('Left' in frame.hands) ||
      !('Right' in frame.hands) ||
      !Array.isArray(frame.observations) ||
      ![0, 1, 2].includes(frame.count) ||
      frame.count !== frame.observations.length ||
      new Set(frame.observations.map((item) => item.trackId)).size !== frame.count ||
      frame.observations.some((item) => !handValid(item)) ||
      typeof frame.ambiguous !== 'boolean' ||
      typeof frame.stable !== 'boolean'
    )
      throw new Error('Captura sincronizada interrumpida o puntos/dimensiones inválidos');
    if (
      frame.stable !==
      (frame.count > 0 && frame.observations.every((item) => item.stable) && !frame.ambiguous)
    )
      throw new Error('Estabilidad de canales contradictoria');
    const expected = frame.stable && frame.count === 1 ? frame.observations[0].hand : null;
    if (frame.singleHand !== expected) throw new Error('Lateralidad de frame contradictoria');
    for (const hand of ['Left', 'Right']) {
      const item = frame.hands[hand];
      const original = frame.observations.find((observation) => observation.hand === hand);
      if (
        (item === null) !== !original ||
        (item !== null &&
          (!handValid(item) ||
            item.hand !== hand ||
            item.trackId !== original.trackId ||
            JSON.stringify(item.points) !== JSON.stringify(original.points)))
      )
        throw new Error('Canal de mano incompleto o distinto de la observación');
    }
    previous = frame.t;
  }
  const duration = sequence.frames.at(-1).t - sequence.frames[0].t;
  if (duration < 1500 || duration > 6000)
    throw new Error('La captura debe durar entre 1,5 y 6 segundos');
  return sequence;
}
