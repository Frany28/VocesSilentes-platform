import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sequenceFeatures } from '../../shared/lsv/sequence.js';
import { singleHandFrames } from '../../shared/lsv/hand-sequence.js';
import { trackedFixture } from './fixtures/tracked-hands.js';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { predictHandSequence } from '../../shared/lsv/sequence-inference.js';

// Geometría sintética exclusivamente para contratos; no mide precisión LSV.
test('traslación y escala conservan las características de ambas manos sin eliminar su orientación', () => {
  for (const hand of ['Left', 'Right']) {
    const frames = singleHandFrames(trackedFixture({ hand }));
    const before = structuredClone(frames);
    const moved = frames.map((frame) => ({
      ...frame,
      points: frame.points.map(([x, y, z]) => [x * 0.6 + 0.1, y * 0.6 + 0.2, z * 0.6]),
    }));
    assert.deepEqual(sequenceFeatures(moved), sequenceFeatures(frames));
    assert.deepEqual(frames, before);
    assert.equal(moved[0].hand, hand);
  }
});

test('la demo permanece idéntica y no habilita reconocimiento izquierdo por inversión implícita', async () => {
  const bytes = await readFile(
    new URL('../../Frontend/public/models/lsv-vowels-demo-v1.json', import.meta.url),
  );
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    'e129e281be5833b1df450ec207eb4f23cb0e5e8ed5347e23b5f07e5a45bc927e',
  );
  const model = JSON.parse(bytes);
  assert.equal(model.prototypes.length, 9);
  assert.deepEqual([...new Set(model.prototypes.map((item) => item.hand))], ['Right']);
  assert.equal(
    predictHandSequence(model, trackedFixture({ hand: 'Left' })).reason,
    'UNSUPPORTED_HAND',
  );
});
