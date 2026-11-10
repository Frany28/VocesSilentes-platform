import { createHandEngine } from './hand-engine.js';
import { createHandTracker } from '../../../../../shared/lsv/hand-tracker.js';
import { validateHandSequence } from '../../../../../shared/lsv/hand-sequence.js';

/**
 * Extrae ambos canales desde PNG decodificados para comprobar el detector real sin pedir cámara.
 * @param {number} start Inicio del recorte en segundos.
 * @param {number} end Fin del recorte en segundos.
 * @returns {Promise<object>} Acumulador técnico local; conserva ausencias y ambigüedad sin clasificar señas.
 */
export async function createTrackedDecodedSequence(start, end) {
  const engine = await createHandEngine(new AbortController().signal);
  const tracker = createHandTracker('decoded');
  const frames = [];
  return {
    async append(encoded, time) {
      const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
      const image = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
      try {
        if (frames.length >= 1800) throw new Error('Demasiados frames para la captura');
        const result = engine.detect(image, time * 1000);
        frames.push(
          tracker.update(result, {
            time: (time - start) * 1000,
            width: image.width,
            height: image.height,
          }),
        );
      } finally {
        image.close();
      }
    },
    finish() {
      if (!frames.length || frames[0].t > 400 || (end - start) * 1000 - frames.at(-1).t > 400)
        throw new Error('No se pudo observar el intervalo completo');
      const selected =
        frames.length <= 60
          ? frames
          : Array.from(
              { length: 60 },
              (_, i) => frames[Math.round((i * (frames.length - 1)) / 59)],
            );
      return {
        sequence: validateHandSequence({
          version: 2,
          coordinateConvention: 'MEDIAPIPE_UNMIRRORED',
          frames: selected,
        }),
        decodedFrames: frames.length,
      };
    },
    close: () => engine.close(),
  };
}
