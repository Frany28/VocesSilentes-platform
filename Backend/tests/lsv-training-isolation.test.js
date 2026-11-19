import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prepareTrainingData } from '../../shared/lsv/training-data.js';
import { trainLsvModel } from '../../shared/lsv/train.js';
import { trainingFingerprint } from '../scripts/lsv/training-fingerprint.js';
import { syntheticDataset } from './fixtures/lsv-synthetic.js';

test('test no selecciona prototipos ni calibra radios; su huella identifica el mismo conjunto reservado', () => {
  const samples = syntheticDataset();
  const original = prepareTrainingData(samples);
  const first = trainLsvModel(original, ['A', 'NONE']);
  const altered = structuredClone(samples);
  for (const sample of altered.filter((record) => record.partition === 'test'))
    for (const frame of sample.frames) frame.points[20][1] += 0.1;
  const changed = prepareTrainingData(altered);
  const second = trainLsvModel(changed, ['A', 'NONE']);
  assert.deepEqual(first.model, second.model);
  assert.notEqual(first.report.accuracy, second.report.accuracy);
  assert.notEqual(
    trainingFingerprint(original, first.model).testSetSha256,
    trainingFingerprint(changed, second.model).testSetSha256,
  );
  const reordered = prepareTrainingData([...samples].reverse());
  assert.deepEqual(
    trainLsvModel(reordered, ['A', 'NONE']).model.prototypes,
    first.model.prototypes,
  );
  assert.equal(
    trainingFingerprint(reordered, first.model).testSetSha256,
    trainingFingerprint(original, first.model).testSetSha256,
  );
  assert.equal(first.report.byHand.Left.total, 0);
  assert.equal(first.report.byHand.Left.accuracy, null);
  assert.equal(first.report.dataReadiness[0].status, 'INSUFFICIENT_DATA');
});
