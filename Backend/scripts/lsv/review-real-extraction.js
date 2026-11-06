import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { createLocalVideoSession } from './local-video-session.js';
import { extractDecodedCandidate } from './extract-decoded-candidate.js';
import { validateFrames } from '../../../shared/lsv/recording.js';
import { sequenceFeatures } from '../../../shared/lsv/sequence.js';
import { predictSequence } from '../../../shared/lsv/classifier.js';

/**
 * Reextrae un recorte real ya usado para entrenar; comprueba integración, nunca generalización.
 * @param {string} output Directorio privado de la ejecución.
 * @param {object} model Modelo provisional entrenado con las nueve etiquetas confirmadas.
 * @returns {Promise<object>} Fuente original y evidencia técnica de una extracción MediaPipe nueva.
 */
export async function reviewRealExtraction(output, model) {
  const data = JSON.parse(
    await readFile('datos-entrenamiento/preparado/candidate-observations.json', 'utf8'),
  );
  const manifest = JSON.parse(await readFile('datos-entrenamiento/manifest.json', 'utf8'));
  const candidate = data.candidates.find((item) => item.id === 'video_01_take_1');
  const source = manifest.sources.find((item) => item.id === candidate.videoId);
  const file = resolve('datos-entrenamiento', source.file);
  assert.equal(
    createHash('sha256')
      .update(await readFile(file))
      .digest('hex'),
    source.sha256,
  );
  const session = await createLocalVideoSession(output);
  try {
    const result = await extractDecodedCandidate(session.page, { ...source, file }, candidate);
    const frames = validateFrames(result.frames);
    const prediction = predictSequence(model, sequenceFeatures(frames), frames[0].hand);
    assert.equal(prediction.label, candidate.label);
    await writeFile(
      join(output, 'real-extraction.json'),
      JSON.stringify({
        id: candidate.id,
        extraction: 'FFMPEG_PNG_PTS_MEDIAPIPE',
        frames,
        prediction,
        reusedTrainingExecution: true,
        independentEvaluation: false,
      }),
    );
    return { file, candidate, observations: frames.length, prediction };
  } finally {
    await session.close();
  }
}
