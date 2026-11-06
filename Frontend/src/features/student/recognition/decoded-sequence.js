import { createHandEngine } from './hand-engine.js';
import { validateFrames } from '../../../../../shared/lsv/recording.js';
import { sequenceFeatures } from '../../../../../shared/lsv/sequence.js';

/**
 * Procesa PNG originales por PTS para preparación local, sin reproducción, interpolación ni etiquetas inferidas.
 * @param {number} start Inicio del recorte original en segundos.
 * @param {number} end Fin del recorte original en segundos.
 * @returns {Promise<object>} Acumulador privado; un frame ausente o una mano ambigua rechazan la muestra completa.
 */
export async function createDecodedSequence(start, end) {
  const engine = await createHandEngine(new AbortController().signal);
  const frames = [];
  const diagnostics = [];
  let decodedFrames = 0;
  let reason = null;
  return {
    async append(encoded, time) {
      const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
      const image = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
      try {
        decodedFrames += 1;
        const result = engine.detect(image, time * 1000);
        const hand = result.handedness?.[0]?.[0]?.categoryName;
        diagnostics.push({
          sourceTimeMs: time * 1000,
          hands: result.landmarks.length,
          hand: hand ?? null,
        });
        if (result.landmarks.length !== 1 || !['Left', 'Right'].includes(hand)) {
          reason ??= `En ${time.toFixed(3)} s no hay exactamente una mano detectable.`;
          return;
        }
        frames.push({
          t: (time - start) * 1000,
          hand,
          width: image.width,
          height: image.height,
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
          reason ??= `En ${time.toFixed(3)} s hay puntos incompletos.`;
      } finally {
        image.close();
      }
    },
    finish() {
      try {
        if (reason) throw new Error(reason);
        if (!frames.length || frames[0].t > 400 || (end - start) * 1000 - frames.at(-1).t > 400)
          throw new Error('No se pudo observar el intervalo completo.');
        if (
          frames.some(
            (frame, index) =>
              frame.hand !== frames[0].hand || (index > 0 && frame.t - frames[index - 1].t > 400),
          )
        )
          throw new Error('La mano cambia o la secuencia tiene una interrupción.');
        const selected =
          frames.length <= 60
            ? frames
            : Array.from(
                { length: 60 },
                (_, index) => frames[Math.round((index * (frames.length - 1)) / 59)],
              );
        validateFrames(selected);
        sequenceFeatures(selected);
        return { frames: selected, decodedFrames, diagnostics };
      } catch (error) {
        return { error: error.message, frames: [], decodedFrames, diagnostics };
      }
    },
    close: () => engine.close(),
  };
}
