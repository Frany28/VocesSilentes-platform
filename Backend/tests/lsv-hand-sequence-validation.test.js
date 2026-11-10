import assert from 'node:assert/strict';
import { test } from 'node:test';
import { trackedFixture } from './fixtures/tracked-hands.js';
import { validateHandSequence, singleHandFrames } from '../../shared/lsv/hand-sequence.js';

test('contrato sincronizado rechaza dimensiones, tiempos, canales y estabilidad contradictorios', () => {
  for (const mutate of [
    (s) => {
      s.frames[0].t = -1;
    },
    (s) => {
      s.frames[4].t = s.frames[3].t;
    },
    (s) => {
      s.frames[4].width = 100;
    },
    (s) => {
      s.frames[4].count = 2;
    },
    (s) => {
      s.frames[4].singleHand = 'Left';
    },
    (s) => {
      s.frames[4].hands.Right.points[3][0] = NaN;
    },
  ]) {
    const sequence = structuredClone(trackedFixture());
    mutate(sequence);
    assert.throws(() => validateHandSequence(sequence));
  }
});

test('una pérdida real queda registrada y no se interpola para producir una candidata', () => {
  const sequence = trackedFixture({
    transform: (raw, index) => (index === 10 ? { landmarks: [], handedness: [] } : raw),
  });
  assert.equal(validateHandSequence(sequence).frames[10].count, 0);
  assert.equal(sequence.frames[10].hands.Left, null);
  assert.equal(sequence.frames[10].hands.Right, null);
  assert.throws(() => singleHandFrames(sequence), /continuidad/);
});
