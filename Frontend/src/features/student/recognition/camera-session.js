import { createHandEngine } from './hand-engine.js';

/**
 * Abre una sesión de cámara por acción del usuario y libera recursos incluso si su arranque termina tarde.
 * @param {{video: HTMLVideoElement, canvas: HTMLCanvasElement, signal: AbortSignal,
 * onState: Function, onFrame: Function, onError: Function, createEngine?: Function}} options Ciclo de vida e inferencia.
 * @returns {Promise<void>} Cámara lista; las pistas/tarea se cierran al abortar o fallar.
 * @throws {Error} Cámara, permisos, reproducción o modelo no disponibles.
 */
export async function startCameraSession({
  video,
  canvas,
  signal,
  onState,
  onFrame,
  onError,
  createEngine = createHandEngine,
}) {
  let stream;
  let engine;
  let frameId;
  let running = true;
  let lastTime = -1;
  let lastRun = -Infinity;
  const release = () => {
    running = false;
    cancelAnimationFrame(frameId);
    const owned = stream;
    stream = null;
    if (owned && video.srcObject === owned) {
      video.pause();
      video.srcObject = null;
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    }
    owned?.getTracks().forEach((track) => track.stop());
    const task = engine;
    engine = null;
    task?.close();
  };
  signal.addEventListener('abort', release, { once: true });
  const fail = (error) => {
    release();
    signal.removeEventListener('abort', release);
    if (!signal.aborted) onError(error);
  };
  try {
    signal.throwIfAborted();
    onState('permission');
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    });
    if (signal.aborted) {
      release();
      signal.throwIfAborted();
    }
    video.srcObject = stream;
    await video.play();
    if (signal.aborted) {
      release();
      signal.throwIfAborted();
    }
    onState('loading');
    engine = await createEngine(signal);
    if (signal.aborted) {
      release();
      signal.throwIfAborted();
    }
    stream
      .getVideoTracks()
      .forEach((track) => track.addEventListener('ended', () => fail(new Error('CAMERA_ENDED'))));
    onState('live');
    const tick = (now) => {
      if (!running || signal.aborted) return;
      try {
        if (video.readyState >= 2 && video.currentTime !== lastTime && now - lastRun >= 100) {
          lastTime = video.currentTime;
          lastRun = now;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const result = engine.detect(video, now);
          engine.draw(canvas, result);
          onFrame(result, { time: now, width: video.videoWidth, height: video.videoHeight });
        }
        frameId = requestAnimationFrame(tick);
      } catch (error) {
        fail(error);
      }
    };
    frameId = requestAnimationFrame(tick);
  } catch (error) {
    release();
    signal.removeEventListener('abort', release);
    throw error;
  }
}
