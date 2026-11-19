import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sequenceFeatures } from '../../shared/lsv/sequence.js';
import { trainingSequence } from '../../shared/lsv/sequence-quality.js';
import { assertIndependentSample } from '../../shared/lsv/sample-conflicts.js';
import { predictSequence } from '../../shared/lsv/classifier.js';
import { trainLsvModel } from '../../shared/lsv/train.js';
import { prepareTrainingData } from '../../shared/lsv/training-data.js';
import { syntheticRecording, syntheticDataset } from './fixtures/lsv-synthetic.js';

test('rechaza copias trasladadas/escaladas con otros IDs y timestamps después de normalizar', () => {
  const original = syntheticRecording('A', 'train');
  const copy = {
    ...original,
    id: 'transformed_copy',
    participantId: 'another_code',
    frames: original.frames.map((frame) => ({
      ...frame,
      t: frame.t * 1.05,
      points: frame.points.map((point) => point.map((value) => value * 1.2 + 0.02)),
    })),
  };
  assert.deepEqual(sequenceFeatures(copy.frames), sequenceFeatures(original.frames));
  assert.throws(() => assertIndependentSample(copy, [original]), /repetidas/);
});

test('detecta una palma degenerada en un solo frame y saltos sin cambiar la normalización de la demo', () => {
  const sample = syntheticRecording('A', 'train');
  assert.deepEqual(trainingSequence(sample), sequenceFeatures(sample.frames));
  const broken = structuredClone(sample);
  broken.frames[8].points[9] = [...broken.frames[8].points[0]];
  assert.throws(() => trainingSequence(broken), /palma degenerada/);
  const jumped = structuredClone(sample);
  jumped.frames[8].points = jumped.frames[8].points.map(([x, y, z]) => [x + 0.4, y, z]);
  assert.throws(() => trainingSequence(jumped), /Salto de muñeca/);
});

test('una imagen congelada de una letra temporal no se convierte en una secuencia válida para entrenar', () => {
  for (const label of ['J', 'Ñ', 'Z']) {
    const sample = syntheticRecording(label, 'train');
    sample.frames = sample.frames.map((frame) => ({ ...frame, points: sample.frames[0].points }));
    assert.throws(() => trainingSequence(sample), /postura congelada/);
  }
});

test('la inferencia se abstiene ante secuencias incompatibles en lugar de devolver un candidato', () => {
  const { model } = trainLsvModel(prepareTrainingData(syntheticDataset()), ['A', 'NONE']);
  for (const sequence of [null, [], [[NaN]], Array(16).fill(Array(66).fill(Infinity))])
    assert.equal(predictSequence(model, sequence, 'Right').reason, 'INVALID_SEQUENCE');
});
