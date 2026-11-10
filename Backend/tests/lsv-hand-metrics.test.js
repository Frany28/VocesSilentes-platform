import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateHands } from '../../shared/lsv/hand-metrics.js';
import { trainExperimentalModel } from '../../shared/lsv/experimental-train.js';
import { syntheticExperimental } from './fixtures/lsv-experimental-synthetic.js';
import { mirrorFrames } from '../../shared/lsv/handedness.js';
import { compareHandExperiments } from '../../shared/lsv/hand-experiments.js';

test('métricas distinguen errores, abstenciones correctas NONE y falta de soporte por mano', () => {
  // Geometrías fabricadas exclusivamente para comprobar métricas, nunca evaluar LSV.
  const [a, none] = ['A', 'NONE'].map(syntheticExperimental);
  const { model } = trainExperimentalModel([a, none]);
  const report = evaluateHands(model, [
    { ...a, id: 'false_a', label: 'NONE' },
    { ...none, id: 'correct_none' },
    { ...a, id: 'left_unsupported', frames: mirrorFrames(a.frames) },
  ]);
  assert.equal(report.byHand.Right.accuracy, 0.5);
  assert.equal(report.byHand.Right.errors, 1);
  assert.equal(report.byHand.Right.abstentions, 1);
  assert.equal(report.byHand.Right.perLetter.A.precision, 0);
  assert.equal(report.byHand.Right.perLetter.NONE.recall, 0.5);
  assert.equal(report.byHand.Right.perLetter.NONE.f1, 2 / 3);
  assert.equal(report.byHand.Right.confusionMatrix.NONE.A, 1);
  assert.equal(report.byHand.Left.accuracy, 0);
  assert.equal(report.byHand.Left.confusionMatrix.A.UNSURE, 1);
  assert.equal(report.byHand.Left.reasons.UNSUPPORTED_HAND, 1);
  assert.equal(report.byHand.Left.perLetter.A.recall, 0);
  assert.equal(report.byHand.Left.perLetter.A.precision, null);
  assert.equal(report.byHand.Left.perLetter.E.f1, null);
});

test('identidades históricas desconocidas impiden afirmar independencia aunque se reserve una prueba', () => {
  const training = ['A', 'NONE'].map((label) => ({
    ...syntheticExperimental(label),
    participantId: null,
    consent: null,
    source: {
      type: 'LOCAL_VIDEO',
      sha256: label === 'A' ? 'a'.repeat(64) : 'b'.repeat(64),
      executionId: `fixture_${label}`,
      origin: 'Software fixture',
      startMs: 0,
      endMs: 2000,
      authorizationStatus: 'PENDING',
    },
  }));
  const reserved = {
    ...syntheticExperimental(),
    id: 'heldout',
    participantId: 'other_fixture',
    evaluationPartition: 'test',
  };
  reserved.frames = reserved.frames.map((f) => ({
    ...f,
    points: f.points.map(([x, y, z]) => [x + 0.002, y, z]),
  }));
  const result = compareHandExperiments([...training, reserved]);
  assert.equal(result.evaluation.reservedTestSamples, 1);
  assert.equal(result.evaluation.independenceVerified, false);
  assert.equal(result.experiments.B.metrics.byHand.Right.accuracy, null);
});
