import { createHandEngine } from './hand-engine.js';
import { readVideoInterval } from './video-playback.js';
import { validateVideoInterval } from '../../../../../shared/lsv/video-source.js';
import { validateFrames } from '../../../../../shared/lsv/recording.js';
import { sequenceFeatures } from '../../../../../shared/lsv/sequence.js';

/**
 * Extrae puntos reales de un intervalo local; una ejecución produce una muestra, sin completar ausencias.
 * @param {{video: HTMLVideoElement, canvas: HTMLCanvasElement, start: number, end: number,
 * signal: AbortSignal, onProgress: Function}} options Reproductor, intervalo y ciclo de vida.
 * @returns {Promise<object>} Observaciones compatibles y cantidad real de fotogramas procesados.
 * @throws {Error} Ausencias, varias manos, discontinuidad, duración o geometría incompatibles.
 */
export async function extractVideoSequence({ video, canvas, start, end, signal, onProgress }) {
  validateVideoInterval(start, end, video.duration);
  const frames = [];
  const engine = await createHandEngine(signal);
  try {
    signal.throwIfAborted();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    await readVideoInterval(video, { start, end }, signal, (image, time) => {
      signal.throwIfAborted();
      const result = engine.detect(image, time * 1000);
      const hand = result.handedness?.[0]?.[0]?.categoryName;
      if (result.landmarks.length !== 1 || !['Left', 'Right'].includes(hand))
        throw new Error(
          `En ${time.toFixed(2)} s no hay exactamente una mano detectable. Revisa el intervalo.`,
        );
      if (frames.length >= 1800) throw new Error('Demasiados fotogramas para este intervalo.');
      frames.push({
        t: (time - start) * 1000,
        hand,
        width: image.videoWidth,
        height: image.videoHeight,
        points: result.landmarks[0].map(({ x, y, z }) => [x, y, z]),
      });
      if (
        frames.at(-1).points.length !== 21 ||
        frames
          .at(-1)
          .points.some((point) =>
            point.some((coordinate) => !Number.isFinite(coordinate) || Math.abs(coordinate) > 10),
          )
      )
        throw new Error('El detector devolvió puntos incompletos. Descarta esta extracción.');
      if (frames.length > 1 && (hand !== frames[0].hand || frames.at(-1).t - frames.at(-2).t > 400))
        throw new Error(
          'La mano cambia o la secuencia tiene una interrupción. Revisa el intervalo.',
        );
      engine.draw(canvas, result);
      onProgress(Math.round(((time - start) / (end - start)) * 100));
    });
    if (!frames.length || frames[0].t > 400 || (end - start) * 1000 - frames.at(-1).t > 400)
      throw new Error('No se pudo observar el intervalo completo. Revisa sus límites.');
    // Selecciona observaciones reales, sin interpolar puntos ni convertir cada frame en otra muestra.
    const selected =
      frames.length <= 60
        ? frames
        : Array.from(
            { length: 60 },
            (_, index) => frames[Math.round((index * (frames.length - 1)) / 59)],
          );
    validateFrames(selected);
    sequenceFeatures(selected);
    return { frames: selected, decodedFrames: frames.length };
  } finally {
    engine.close();
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }
}
