import { expect, test } from 'vitest';
import { captureFeedback } from '../features/student/recognition/capture-feedback.js';
import {
  practiceAdvice,
  practiceOutcome,
  practiceMessages,
} from '../features/student/recognition/practice-feedback.js';
import { trackedFixture } from '../../../Backend/tests/fixtures/tracked-hands.js';

// Solo geometría de software: no representa ejecuciones LSV ni participantes reales.
test.each(['Left', 'Right'])('la ayuda geométrica trata %s sin exigir cambiar de mano', (hand) => {
  const sequence = trackedFixture({ hand });
  expect(captureFeedback(sequence)).toBeNull();
  for (const frame of sequence.frames) {
    const item = frame.observations[0];
    item.points[8][0] = hand === 'Left' ? 0.005 : 0.995;
  }
  expect(captureFeedback(sequence)).toBe('PARTIAL_HAND');
  expect(practiceAdvice({ captureIssue: captureFeedback(sequence) })).toBe(
    practiceMessages.PARTIAL_HAND,
  );
});

test('ausencia comprobada difiere de pérdida parcial o inestabilidad de la captura', () => {
  const sequence = trackedFixture();
  for (const frame of sequence.frames) {
    frame.count = 0;
    frame.observations = [];
    frame.stable = false;
    frame.singleHand = null;
    frame.hands = { Left: null, Right: null };
  }
  expect(captureFeedback(sequence)).toBe('NO_HAND');
  expect(captureFeedback(null)).toBeNull();
  sequence.frames[5] = trackedFixture().frames[5];
  expect(captureFeedback(sequence)).toBeNull();
  expect(practiceAdvice({ reason: 'INVALID_SEQUENCE' })).toBe(practiceMessages.UNCERTAIN);
});

test('movimiento sostenido rápido exige continuidad; un salto o una detección perdida no lo demuestra', () => {
  const moving = trackedFixture();
  moving.frames.forEach((frame, index) => {
    const x = [0.15, 0.4, 0.65, 0.4][index % 4];
    frame.t = index * 100;
    frame.observations[0].points = frame.observations[0].points.map((p) => [x, p[1], p[2]]);
  });
  expect(captureFeedback(moving)).toBe('RAPID_MOVEMENT');
  moving.frames.forEach((frame, index) => {
    frame.observations[0].trackId = `different_${index}`;
  });
  expect(captureFeedback(moving)).toBeNull();
});

test.each([
  'CANDIDATE',
  'BACKGROUND',
  'AMBIGUOUS',
  'OUT_OF_DISTRIBUTION',
  'UNSUPPORTED_HAND',
  'INVALID_SEQUENCE',
])('%s nunca confirma un error o acierto ni inventa una causa de captura', (reason) => {
  for (const label of [null, 'A', 'E']) {
    const result = { reason, label, confirmed: true };
    expect(practiceOutcome(result)).toBe('UNCERTAIN');
    expect(practiceAdvice(result)).toBe(practiceMessages.UNCERTAIN);
    expect(practiceAdvice(result)).not.toMatch(
      /entrenamiento|muestras|prototipos|dataset|incorrect|dedos|despacio/i,
    );
  }
});
