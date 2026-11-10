import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trackedFixture } from './fixtures/tracked-hands.js';
import { singleHandFrames, handSequenceChannels } from '../../shared/lsv/hand-sequence.js';
import { predictHandSequence } from '../../shared/lsv/sequence-inference.js';
import { trainExperimentalModel } from '../../shared/lsv/experimental-train.js';
import { syntheticExperimental } from './fixtures/lsv-experimental-synthetic.js';

test('tracking de software estabiliza izquierda/derecha y conserva identidad/puntos sin espejarlos', () => {
  for (const hand of ['Left', 'Right']) {
    const sequence = trackedFixture({ hand });
    assert.equal(sequence.frames[0].stable, false);
    assert.equal(sequence.frames[2].singleHand, hand);
    const frames = singleHandFrames(sequence);
    assert.equal(frames.length, 18);
    assert.equal(new Set(frames.map((f) => f.trackId)).size, 1);
    assert.deepEqual(frames[0].points, sequence.frames[2].observations[0].points);
  }
});

test('una inversión aislada conserva etiqueta cruda; inversiones persistentes invalidan inferencia', () => {
  const isolated = trackedFixture({
    transform: (raw, index) => {
      if (index === 8) raw.handedness[0][0].categoryName = 'Left';
      return raw;
    },
  });
  const frames = singleHandFrames(isolated);
  assert.equal(frames[6].hand, 'Right');
  assert.equal(frames[6].rawHand, 'Left');
  assert.equal(frames[6].handednessCorrected, true);
  assert.equal(frames.filter((f) => f.handednessCorrected).length, 1);
  const persistent = trackedFixture({
    transform: (raw, index) => {
      if (index >= 8) raw.handedness[0][0].categoryName = 'Left';
      return raw;
    },
  });
  assert.throws(() => singleHandFrames(persistent), /inestable/);
  assert.equal(persistent.frames.at(-1).singleHand, 'Left');
  assert.notEqual(
    persistent.frames[5].hands.Right.trackId,
    persistent.frames.at(-1).hands.Left.trackId,
  );
});

test('dos manos siguen asociadas al intercambiar el índice; no se descarta ningún canal', () => {
  const sequence = trackedFixture({
    both: true,
    transform: (raw, index) => {
      if (index % 2) {
        raw.landmarks.reverse();
        raw.handedness.reverse();
      }
      return raw;
    },
  });
  const channels = handSequenceChannels(sequence);
  assert.equal(channels.Left[0].present, null);
  assert.equal(channels.Left.length, 20);
  assert.equal(channels.Right.length, 20);
  assert.equal(channels.Left[4].present, true);
  assert.equal(channels.Right[4].present, true);
  assert.notEqual(channels.Left[4].observation.trackId, channels.Right[4].observation.trackId);
  assert.equal(channels.Left[4].observation.trackId, channels.Left[5].observation.trackId);
  assert.throws(() => singleHandFrames(sequence), /solo una mano/);
  assert.equal(predictHandSequence(null, sequence).reason, 'SINGLE_HAND_REQUIRED');
  assert.equal(
    predictHandSequence(null, sequence, { expectedHands: 2 }).reason,
    'TWO_HAND_MODEL_REQUIRED',
  );
});

test('el modelo previo intenta inferencia de ambas manos y se abstiene cuando no tiene prototipos', () => {
  const recordings = ['A', 'NONE'].map((label) => ({
    ...syntheticExperimental(label),
    frames: singleHandFrames(trackedFixture({ label })),
  }));
  const { model } = trainExperimentalModel(recordings);
  assert.equal(predictHandSequence(model, trackedFixture()).label, 'A');
  assert.equal(
    predictHandSequence(model, trackedFixture({ hand: 'Left' })).reason,
    'UNSUPPORTED_HAND',
  );
});
