import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mirrorFrames, createHandContinuity } from '../../shared/lsv/handedness.js';
import { sequenceFeatures } from '../../shared/lsv/sequence.js';
import { augmentTraining } from '../../shared/lsv/augmentation.js';
import { trainExperimentalModel } from '../../shared/lsv/experimental-train.js';
import { compareHandExperiments } from '../../shared/lsv/hand-experiments.js';
import { evaluateHands } from '../../shared/lsv/hand-metrics.js';
import { syntheticExperimental } from './fixtures/lsv-experimental-synthetic.js';
import { predictSequence } from '../../shared/lsv/classifier.js';

// Exclusivamente pruebas de software: estas geometrías no son grabaciones de LSV.
const policy = {
  version: 1,
  transform: 'HORIZONTAL_REFLECTION',
  status: 'VALIDATED_FOR_EXPERIMENT',
  reviewerId: 'software_fixture',
  evidenceReference: 'TEST_ONLY',
  reviewedAt: '2026-11-09',
  labels: ['A', 'NONE'],
};

test('reflejo invierte x y mano, conserva z/orden/tiempo y transforma pose y trayectoria coherentemente', () => {
  const original = syntheticExperimental().frames;
  const before = structuredClone(original);
  const mirrored = mirrorFrames(original);
  assert.equal(mirrored[0].hand, 'Left');
  assert.deepEqual(mirrored[0].points[8], [
    1 - original[0].points[8][0],
    ...original[0].points[8].slice(1),
  ]);
  const a = sequenceFeatures(original);
  const b = sequenceFeatures(mirrored);
  a.forEach((frame, i) =>
    frame.forEach((value, axis) => {
      assert.ok(Math.abs(b[i][axis] - (axis % 3 === 0 ? -value : value)) < 0.00002);
    }),
  );
  assert.deepEqual(original, before);
});

test('ambas manos aprenden datos auténticos de entrada sin reflejo implícito; aumentos requieren validación', () => {
  const right = ['A', 'NONE'].map(syntheticExperimental);
  const left = right.map((s) => ({ ...s, id: `${s.id}_left`, frames: mirrorFrames(s.frames) }));
  const { model } = trainExperimentalModel([...right, ...left]);
  assert.equal(predictSequence(model, sequenceFeatures(left[0].frames), 'Left').label, 'A');
  assert.equal(model.augmentedAudit.length, 0);
  assert.deepEqual(augmentTraining(right), []);
  assert.throws(() => augmentTraining(right, {}), /validación/);
  const augmented = augmentTraining(right, policy);
  assert.equal(augmented[0].parentId, right[0].id);
  assert.equal(augmented[0].sampleKind, 'AUGMENTED');
  assert.equal(augmented[0].reviewStatus, right[0].reviewStatus);
  assert.throws(() => evaluateHands(model, augmented), /reales/);
  assert.throws(() => trainExperimentalModel(augmented), /reales/);
});

test('comparaciones reservan personas y reflejos; métricas vacías son null y C se bloquea sin validación', () => {
  const training = ['A', 'NONE'].map(syntheticExperimental);
  const empty = compareHandExperiments(training);
  assert.equal(empty.experiments.A.metrics.byHand.Left.accuracy, null);
  assert.equal(empty.experiments.C.status, 'BLOCKED');
  const test = training.map((s) => ({
    ...s,
    id: `${s.id}_test`,
    participantId: 'independent_fixture',
    evaluationPartition: 'test',
    frames: s.frames.map((f) => ({ ...f, points: f.points.map(([x, y, z]) => [x + 0.001, y, z]) })),
  }));
  const result = compareHandExperiments([...training, ...test], policy);
  assert.equal(result.experiments.A.metrics.byHand.Right.total, 2);
  assert.equal(result.experiments.C.report.augmentedSamples, 2);
  assert.ok(result.experiments.A.metrics.byHand.Right.inferenceMs.mean >= 0);
  assert.throws(
    () =>
      compareHandExperiments([
        ...training,
        { ...test[0], participantId: training[0].participantId },
      ]),
    /persona/,
  );
  assert.throws(
    () =>
      compareHandExperiments([
        ...training,
        { ...test[0], frames: mirrorFrames(training[0].frames) },
      ]),
    /reflejo/,
  );
  assert.throws(() => trainExperimentalModel(test), /reservada/);
});

test('continuidad rechaza mano distinta, pérdida, salto y cambio de lateralidad sin cambiar índices anatómicos', () => {
  const frame = syntheticExperimental().frames[0];
  assert.throws(() => createHandContinuity('Left')(frame), /lateralidad/);
  assert.throws(() => createHandContinuity()(null), /visible/);
  const check = createHandContinuity();
  check(frame);
  assert.throws(() => check({ ...frame, t: 100, hand: 'Left' }), /Continuidad/);
  const other = createHandContinuity();
  other(frame);
  assert.throws(() => other({ ...frame, t: 500 }), /Continuidad/);
});
