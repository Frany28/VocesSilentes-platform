import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createLocalVideoSession } from './lsv/local-video-session.js';
import { extractDecodedCandidate } from './lsv/extract-decoded-candidate.js';
import { mirrorFrames } from '../../shared/lsv/handedness.js';
import { sequenceFeatures } from '../../shared/lsv/sequence.js';
import { predictSequence } from '../../shared/lsv/classifier.js';

// Prueba técnica con imágenes reflejadas, nunca grabaciones auténticas izquierdas ni validación lingüística.
const output = resolve('.local/lsv-bilateral-geometry', String(Date.now()));
await mkdir(output, { recursive: true });
const { samples } = JSON.parse(
  await readFile('.local/lsv-experimental/experimental-samples.json', 'utf8'),
);
const model = JSON.parse(
  await readFile('.local/lsv-experimental/lsv-experimental-model.json', 'utf8'),
);
const manifest = JSON.parse(await readFile('datos-entrenamiento/manifest.json', 'utf8'));
const session = await createLocalVideoSession(output);
const observations = [];
try {
  for (const label of ['A', 'E', 'I', 'O', 'U', 'NONE']) {
    const sample = samples.find((s) => s.label === label);
    const source = manifest.sources.find((s) => s.sha256 === sample.source.sha256);
    const file = resolve('datos-entrenamiento', source.file);
    const hash = createHash('sha256')
      .update(await readFile(file))
      .digest('hex');
    if (hash !== source.sha256) throw new Error('El video original cambió');
    const target = join(output, `${label}-mirrored.mp4`);
    const duration = sample.source.endMs - sample.source.startMs;
    const clip = spawnSync(
      'ffmpeg',
      [
        '-hide_banner',
        '-loglevel',
        'error',
        '-ss',
        String(sample.source.startMs / 1000),
        '-i',
        file,
        '-t',
        String(duration / 1000),
        '-vf',
        'hflip',
        '-an',
        target,
      ],
      { encoding: 'utf8', windowsHide: true },
    );
    if (clip.status !== 0) throw new Error('FFmpeg no pudo reflejar el recorte');
    const result = await extractDecodedCandidate(
      session.page,
      { file: target },
      { startMs: 0, endMs: duration },
    );
    const frames = result.frames;
    observations.push({
      label,
      parentId: sample.id,
      sampleKind: 'AUGMENTED_TECHNICAL_ONLY',
      originalHand: sample.frames[0].hand,
      detectedHand: frames[0]?.hand ?? null,
      frames: frames.length,
      error: result.error ?? null,
      originalPrediction: predictSequence(
        model,
        sequenceFeatures(sample.frames),
        sample.frames[0].hand,
      ),
      mirroredPrediction: frames.length
        ? predictSequence(model, sequenceFeatures(frames), frames[0].hand)
        : null,
      // Diagnóstico geométrico únicamente; la inferencia pública no hace esta conversión implícita.
      roundTripPrediction: frames.length
        ? predictSequence(
            model,
            sequenceFeatures(mirrorFrames(frames)),
            frames[0].hand === 'Left' ? 'Right' : 'Left',
          )
        : null,
    });
    console.log(JSON.stringify(observations.at(-1)));
  }
} finally {
  await session.close();
  await writeFile(
    join(output, 'results.json'),
    JSON.stringify(
      {
        physicalCamera: false,
        authenticLeftRecordings: 0,
        independentEvaluation: false,
        usedForTraining: false,
        observations,
      },
      null,
      2,
    ),
  );
}
