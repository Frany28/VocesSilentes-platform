/**
 * Busca un tiempo local y espera la decodificación, con cancelación y limpieza de listeners.
 * @param {HTMLVideoElement} video Reproductor del archivo local.
 * @param {number} time Tiempo en segundos.
 * @param {AbortSignal} signal Cancelación.
 * @returns {Promise<void>} Fotograma disponible; rechaza errores, bloqueo o cancelación.
 */
export function seekLocalVideo(video, time, signal) {
  signal.throwIfAborted();
  if (Math.abs(video.currentTime - time) < 0.001 && video.readyState >= 2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const done = (error) => {
      clearTimeout(timer);
      video.removeEventListener('seeked', ready);
      video.removeEventListener('error', failed);
      signal.removeEventListener('abort', aborted);
      if (error) reject(error);
      else resolve();
    };
    const ready = () => done();
    const failed = () => done(new Error('El navegador no pudo decodificar este video.'));
    const aborted = () => done(signal.reason);
    const timer = setTimeout(failed, 10000);
    video.addEventListener('seeked', ready, { once: true });
    video.addEventListener('error', failed, { once: true });
    signal.addEventListener('abort', aborted, { once: true });
    video.currentTime = time;
  });
}

/**
 * Procesa cada fotograma presentado durante un intervalo; rechaza saltos, sin inventar observaciones perdidas.
 * @param {HTMLVideoElement} video Reproductor visible, sin espejo.
 * @param {{start: number, end: number}} range Intervalo marcado en segundos.
 * @param {AbortSignal} signal Cancelación.
 * @param {Function} onFrame Recibe video y timestamp real de presentación en segundos.
 * @returns {Promise<void>} Reproducción pausada y callbacks liberados al terminar o fallar.
 */
export async function readVideoInterval(video, range, signal, onFrame) {
  if (!video.requestVideoFrameCallback)
    throw new Error(
      'Tu navegador necesita requestVideoFrameCallback para procesar videos locales.',
    );
  video.pause();
  await seekLocalVideo(video, range.start, signal);
  signal.throwIfAborted();
  const previousRate = video.playbackRate;
  video.playbackRate = 0.25;
  try {
    await new Promise((resolve, reject) => {
      let callback;
      let finished = false;
      let lastTime = -1;
      let presented = null;
      const done = (error) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        video.cancelVideoFrameCallback(callback);
        video.removeEventListener('ended', ended);
        video.removeEventListener('error', failed);
        signal.removeEventListener('abort', aborted);
        video.pause();
        if (error) reject(error);
        else resolve();
      };
      const ended = () => done();
      const failed = () => done(new Error('Falló la reproducción o decodificación del video.'));
      const aborted = () => done(signal.reason);
      const timer = setTimeout(failed, (range.end - range.start) * 6000 + 15000);
      const frame = (_now, metadata) => {
        if (finished) return;
        try {
          const time = metadata.mediaTime;
          if (!Number.isFinite(time)) throw new Error('Falta el tiempo real del fotograma.');
          if (time > range.end) return done();
          if (time >= range.start && time > lastTime) {
            if (presented !== null && metadata.presentedFrames - presented > 1)
              throw new Error(
                'Se perdieron fotogramas. Cierra otras tareas y vuelve a procesar el intervalo.',
              );
            onFrame(video, time);
            lastTime = time;
            presented = metadata.presentedFrames;
          }
          callback = video.requestVideoFrameCallback(frame);
        } catch (error) {
          done(error);
        }
      };
      video.addEventListener('ended', ended, { once: true });
      video.addEventListener('error', failed, { once: true });
      signal.addEventListener('abort', aborted, { once: true });
      callback = video.requestVideoFrameCallback(frame);
      video.play().catch(failed);
    });
  } finally {
    video.pause();
    video.playbackRate = previousRate;
  }
}
