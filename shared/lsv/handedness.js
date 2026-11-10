/**
 * Refleja coordenadas de imagen normalizadas y lateralidad; conserva profundidad y orden anatómico.
 * @param {object[]} frames Observaciones MediaPipe, sin modificar el original.
 * @returns {object[]} Copia geométrica; no afirma equivalencia lingüística.
 */
export function mirrorFrames(frames) {
  return frames.map((frame) => ({
    ...frame,
    hand: frame.hand === 'Right' ? 'Left' : 'Right',
    points: frame.points.map(([x, y, z]) => [1 - x, y, z]),
  }));
}

/**
 * Conserva metadatos de capturas auténticas; rechaza aumentos importados como observaciones reales.
 * @param {object} sample Registro original.
 * @param {object[]} frames Secuencia validada.
 * @returns {object} Lateralidad observada y origen real explícitos, compatibles con exportaciones previas.
 * @throws {Error} Origen artificial, convención desconocida o lateralidad contradictoria.
 */
export function recordingHandMetadata(sample, frames) {
  if (sample.sampleKind !== undefined && sample.sampleKind !== 'REAL')
    throw new Error(
      'Importa solo capturas reales; los aumentos se generan después de separar los datos',
    );
  if (sample.observedHand !== undefined && sample.observedHand !== frames[0].hand)
    throw new Error('La lateralidad declarada no coincide con los puntos observados');
  if (
    sample.requestedHand !== undefined &&
    !['Left', 'Right', 'AUTO'].includes(sample.requestedHand)
  )
    throw new Error('Selector de lateralidad incompatible');
  if (
    sample.requestedHand &&
    sample.requestedHand !== 'AUTO' &&
    sample.requestedHand !== frames[0].hand
  )
    throw new Error('La captura no coincide con la mano seleccionada');
  if (
    sample.coordinateConvention !== undefined &&
    sample.coordinateConvention !== 'MEDIAPIPE_UNMIRRORED'
  )
    throw new Error('Convención de coordenadas incompatible');
  return {
    sampleKind: 'REAL',
    dataOrigin:
      sample.source?.type ??
      (sample.captureOrigin === 'LIVE_CAMERA' ? 'CAMERA' : 'LEGACY_UNSPECIFIED'),
    processing: frames.some((frame) => frame.handednessCorrected)
      ? 'STABILISED_HANDEDNESS'
      : 'ORIGINAL_LANDMARKS',
    observedHand: frames[0].hand,
    coordinateConvention: 'MEDIAPIPE_UNMIRRORED',
    requestedHand: sample.requestedHand ?? 'AUTO',
    ...(sample.captureOrigin === 'LIVE_CAMERA' ? { captureOrigin: 'LIVE_CAMERA' } : {}),
  };
}

/**
 * Comprueba continuidad conservadora de una sola mano; MediaPipe no expone un identificador persistente.
 * @param {string} [requestedHand] Lateralidad requerida o AUTO.
 * @returns {Function} Validador incremental; lanza un error al perder o cambiar la mano.
 */
export function createHandContinuity(requestedHand = 'AUTO') {
  let previous;
  return (frame) => {
    if (!frame || !['Left', 'Right'].includes(frame.hand))
      throw new Error('Mantén exactamente una mano visible durante toda la captura.');
    if (requestedHand !== 'AUTO' && requestedHand !== frame.hand)
      throw new Error('La mano detectada no coincide con la lateralidad seleccionada.');
    if (previous) {
      const jump = Math.hypot(
        ...frame.points[0].slice(0, 2).map((v, i) => v - previous.points[0][i]),
      );
      if (frame.hand !== previous.hand || frame.t - previous.t > 400 || jump > 0.3)
        throw new Error(
          'Continuidad perdida: cambió la mano, saltó de posición o dejó de detectarse.',
        );
    }
    previous = frame;
  };
}
