import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trainingCoverage, PILOT_LABELS, DATA_PARTITIONS } from '../../shared/lsv/coverage.js';
import { LSV_LABELS } from '../../shared/lsv/labels.js';
import { syntheticVideoRecording } from './fixtures/lsv-video-synthetic.js';

test('cobertura: cuenta ejecuciones revisadas, no frames, e identifica etiquetas/grupos/personas faltantes', () => {
  const pending = { ...syntheticVideoRecording(), reviewStatus: 'PENDING_LSV_REVIEW' };
  const initial = trainingCoverage([pending]);
  assert.equal(initial.minimumCovered, false);
  assert.equal(initial.labels[0].groups[0].pending, 1);
  assert.equal(initial.labels[0].groups[0].reviewed, 0);
  assert.deepEqual(initial.people[0].missing, LSV_LABELS);
  const complete = DATA_PARTITIONS.flatMap((partition, group) =>
    PILOT_LABELS.map((label, index) => {
      const sample = syntheticVideoRecording(label, partition, (group * 6 + index) * 0.001);
      sample.source.startMs = index * 2500;
      sample.source.endMs = index * 2500 + 2000;
      return sample;
    }),
  );
  const result = trainingCoverage(complete, PILOT_LABELS);
  assert.equal(result.minimumCovered, true);
  assert.equal(result.people.length, 3);
  assert.ok(result.people.every((person) => person.missing.length === 0));
  assert.equal(trainingCoverage(complete.slice(1), PILOT_LABELS).minimumCovered, false);
});
