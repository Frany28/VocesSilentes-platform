import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRecording } from '../../shared/lsv/recording.js';
import { validateVideoInterval } from '../../shared/lsv/video-source.js';
import { assertIndependentSample } from '../../shared/lsv/sample-conflicts.js';
import { prepareTrainingData } from '../../shared/lsv/training-data.js';
import { trainingCoverage, PILOT_LABELS, DATA_PARTITIONS } from '../../shared/lsv/coverage.js';
import { syntheticVideoRecording } from './fixtures/lsv-video-synthetic.js';

test('video: conserva procedencia permitida y exige autorización, ejecución e intervalo reales', () => {
  const original = syntheticVideoRecording();
  const valid = validateRecording({
    ...original,
    source: { ...original.source, privatePath: 'not-exported' },
  });
  assert.deepEqual(valid.source, original.source);
  assert.equal(valid.source.privatePath, undefined);
  for (const change of [
    { authorized: false },
    { sha256: 'bad' },
    { origin: '' },
    { authorization: '' },
    { executionId: undefined },
    { startMs: -1 },
    { endMs: 1500 },
  ]) {
    assert.throws(() =>
      validateRecording({ ...original, source: { ...original.source, ...change } }),
    );
  }
  for (const range of [
    [NaN, 2, 5],
    [0, 7, 10],
    [2, 1, 5],
    [0, 2, 1],
    [0, 1, 3],
  ])
    assert.throws(() => validateVideoInterval(...range));
  validateVideoInterval(0, 2, 3);
});

test('video: bloquea solapamientos, ejecuciones reetiquetadas y personas cruzadas antes de entrenar', () => {
  const first = syntheticVideoRecording();
  const next = syntheticVideoRecording('NONE');
  assertIndependentSample(next, [first]);
  assert.throws(
    () =>
      assertIndependentSample({ ...next, source: { ...next.source, startMs: 1000, endMs: 3000 } }, [
        first,
      ]),
    /solapa/,
  );
  assert.throws(
    () =>
      assertIndependentSample(
        { ...next, source: { ...next.source, executionId: first.source.executionId } },
        [first],
      ),
    /ejecución/,
  );
  assert.throws(
    () => assertIndependentSample({ ...next, frames: first.frames }, [first]),
    /repetidas/,
  );
  assert.throws(
    () =>
      assertIndependentSample(
        { ...next, participantId: first.participantId.toUpperCase(), partition: 'test' },
        [first],
      ),
    /partición/,
  );
});

test('video: la CLI comparte los bloqueos y nunca promueve una muestra pendiente', () => {
  const pending = { ...syntheticVideoRecording(), reviewStatus: 'PENDING_LSV_REVIEW' };
  assert.throws(() => prepareTrainingData([pending]), /pendientes/);
  const next = syntheticVideoRecording('NONE');
  next.source.startMs = 1000;
  next.source.endMs = 3000;
  assert.throws(() => prepareTrainingData([syntheticVideoRecording(), next]), /solapa/);
});

test('cobertura: cuenta ejecuciones revisadas, no frames, e identifica etiquetas/grupos/personas faltantes', () => {
  const pending = { ...syntheticVideoRecording(), reviewStatus: 'PENDING_LSV_REVIEW' };
  const initial = trainingCoverage([pending]);
  assert.equal(initial.minimumCovered, false);
  assert.equal(initial.labels[0].groups[0].pending, 1);
  assert.equal(initial.labels[0].groups[0].reviewed, 0);
  assert.deepEqual(initial.people[0].missing, PILOT_LABELS);
  const complete = DATA_PARTITIONS.flatMap((partition) =>
    PILOT_LABELS.map((label) => syntheticVideoRecording(label, partition)),
  );
  const result = trainingCoverage(complete);
  assert.equal(result.minimumCovered, true);
  assert.equal(result.people.length, 3);
  assert.ok(result.people.every((person) => person.missing.length === 0));
  assert.equal(trainingCoverage(complete.slice(1)).minimumCovered, false);
});
