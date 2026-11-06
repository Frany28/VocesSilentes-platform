import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { createDemoRelease } from '../../shared/lsv/demo-release.js';
import { trainExperimentalModel } from '../../shared/lsv/experimental-train.js';
import { validateModel, predictSequence } from '../../shared/lsv/classifier.js';
import { sequenceFeatures } from '../../shared/lsv/sequence.js';
import { syntheticExperimental } from './fixtures/lsv-experimental-synthetic.js';

test('publicación educativa conserva predicción y abstención; excluye auditoría, identidades y datos originales', () => {
  const samples = ['A', 'NONE'].map((label) => syntheticExperimental(label));
  const { model } = trainExperimentalModel(samples);
  const before = JSON.stringify(model);
  const release = createDemoRelease(model);
  assert.equal(release.usage, 'EDUCATIONAL_DEMONSTRATION');
  assert.equal(release.status, 'EXPERIMENTAL');
  assert.equal(release.documentation.academicGrading, false);
  assert.equal(release.documentation.expertLsvReview, 'PENDING');
  assert.equal(release.documentation.sourceAuthorization, 'DECLARED_PENDING_EVIDENCE');
  assert.equal(release.sampleAudit, undefined);
  assert.doesNotMatch(
    JSON.stringify(release),
    /participantId|sessionId|observedSignant|reviewerId|frames/,
  );
  assert.equal(JSON.stringify(model), before);
  for (const sample of samples) {
    const sequence = sequenceFeatures(sample.frames);
    assert.deepEqual(
      predictSequence(release, sequence, 'Right'),
      predictSequence(model, sequence, 'Right'),
    );
  }
  assert.throws(() => validateModel({ ...release, metrics: { accuracy: 1 } }));
  assert.throws(() => validateModel({ ...release, documentation: { academicGrading: true } }));
});

test('artefacto distribuido: nueve prototipos y seis etiquetas, con origen provisional conservado', async () => {
  const release = validateModel(
    JSON.parse(
      await readFile(
        new URL('../../Frontend/public/models/lsv-vowels-demo-v1.json', import.meta.url),
        'utf8',
      ),
    ),
  );
  assert.equal(release.prototypes.length, 9);
  assert.deepEqual([...release.labels].sort(), ['A', 'E', 'I', 'NONE', 'O', 'U']);
  assert.equal(release.partitions, null);
  assert.equal(release.metrics, null);
  assert.equal(release.documentation.independentEvaluation, false);
});
