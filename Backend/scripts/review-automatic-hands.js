import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { createLocalVideoSession } from './lsv/local-video-session.js';
import { extractDecodedCandidate } from './lsv/extract-decoded-candidate.js';
import { createHandClip } from './lsv/create-hand-clip.js';
import { handTrackingMetrics } from '../../shared/lsv/tracking-metrics.js';
import { predictHandSequence } from '../../shared/lsv/sequence-inference.js';

// Reutiliza metraje privado de entrenamiento; los reflejos y composiciones son diagnósticos, no datos LSV nuevos.
const output = resolve('.local/lsv-automatic-hands', String(Date.now()));
await mkdir(output, { recursive: true });
const { samples } = JSON.parse(
  await readFile('.local/lsv-experimental/experimental-samples.json', 'utf8'),
);
const model = JSON.parse(
  await readFile('.local/lsv-experimental/lsv-experimental-model.json', 'utf8'),
);
const manifest = JSON.parse(await readFile('datos-entrenamiento/manifest.json', 'utf8'));
const session = await createLocalVideoSession(output);
const runs = [];
try {
  for (const label of ['A', 'E', 'I', 'O', 'U', 'NONE']) {
    const sample = samples.find((s) => s.label === label);
    const source = manifest.sources.find((s) => s.sha256 === sample.source.sha256);
    const file = resolve('datos-entrenamiento', source.file);
    if (
      createHash('sha256')
        .update(await readFile(file))
        .digest('hex') !== source.sha256
    )
      throw new Error('El video original cambió');
    for (const mode of label === 'A'
      ? ['ORIGINAL', 'MIRROR', 'COMPOSITE']
      : ['ORIGINAL', 'MIRROR']) {
      const target = join(output, `${label}-${mode}.mp4`);
      createHandClip(file, sample.source, target, mode);
      const result = await extractDecodedCandidate(
        session.page,
        { file: target },
        {
          startMs: 0,
          endMs: sample.source.endMs - sample.source.startMs,
        },
        true,
      );
      const start = performance.now();
      let prediction;
      try {
        const { label: candidate, reason } = predictHandSequence(model, result.sequence);
        prediction = { candidate, reason };
      } catch (error) {
        prediction = { candidate: null, reason: 'INVALID_CONTINUITY', detail: error.message };
      }
      const inferenceMs = performance.now() - start;
      const run = {
        sourceLabel: label,
        parentId: sample.id,
        mode,
        sourceHandAnnotation: sample.frames[0].hand,
        sampleKind:
          mode === 'ORIGINAL' ? 'REUSED_REAL_TRAINING_RECORDING' : 'DERIVED_TECHNICAL_ONLY',
        metrics: handTrackingMetrics(result.sequence),
        prediction,
        inferenceMs,
        decodedFrames: result.decodedFrames,
      };
      runs.push(run);
      await writeFile(
        join(output, `${label}-${mode}-sequence.json`),
        JSON.stringify(result.sequence),
      );
      console.log(JSON.stringify(run));
    }
  }
} finally {
  await session.close();
  await writeFile(
    join(output, 'results.json'),
    JSON.stringify(
      {
        physicalCamera: false,
        independentEvaluation: false,
        authenticLeftRecordings: 0,
        validatedBimanualSigns: 0,
        linguisticAccuracy: null,
        sourceAnatomicalHandVerified: false,
        modelUnchanged: true,
        usedForTraining: false,
        runs,
      },
      null,
      2,
    ),
  );
}
