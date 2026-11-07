import { test } from 'node:test';
import assert from 'node:assert/strict';
import { letterReadiness, publicationCandidates } from '../../shared/lsv/readiness.js';

// Solo metadatos para contar; no son muestras de entrenamiento ni contienen puntos.
function meta(label, partition, participantId, hand = 'Right', reviewStatus = 'APPROVED_LSV') {
  return { label, partition, participantId, hand, reviewStatus };
}

function repeat(count, ...args) {
  return Array.from({ length: count }, () => meta(...args));
}

test('preparación: sin muestras revisadas todas las letras quedan NO_DATA; J, Ñ y Z se marcan con movimiento', () => {
  const rows = letterReadiness([meta('A', 'train', 'p1', 'Right', 'PENDING_LSV_REVIEW')]);
  assert.equal(rows.length, 27);
  assert.ok(rows.every((row) => row.status === 'NO_DATA'));
  assert.deepEqual(
    rows.filter((row) => row.motion).map((row) => row.label),
    ['J', 'Ñ', 'Z'],
  );
});

test('preparación: el modelo de demostración actual (una persona, mano derecha) es insuficiente', () => {
  const samples = [
    ...repeat(2, 'A', 'train', 'owner'),
    meta('A', 'validation', 'owner'),
    meta('A', 'test', 'owner'),
  ];
  const row = letterReadiness(samples).find((item) => item.label === 'A');
  assert.equal(row.status, 'INSUFFICIENT_DATA');
  assert.ok(row.missing.includes('train: 0/6 personas con 3+ muestras'));
  assert.ok(row.missing.includes('Sin ejemplos con mano Left'));
});

test('preparación: personas, repeticiones y lateralidades suficientes permiten evaluar', () => {
  const samples = [];
  for (let person = 0; person < 6; person += 1)
    samples.push(...repeat(3, 'E', 'train', `t${person}`, person % 2 ? 'Left' : 'Right'));
  for (const partition of ['validation', 'test'])
    for (let person = 0; person < 2; person += 1)
      samples.push(...repeat(3, 'E', partition, `${partition}${person}`));
  assert.equal(
    letterReadiness(samples).find((item) => item.label === 'E').status,
    'READY_FOR_EVALUATION',
  );
});

test('publicación: exige muestras de prueba, sensibilidad y pocos falsos positivos sobre NONE', () => {
  const report = {
    confusionMatrix: {
      A: { A: 19, UNSURE: 1 },
      E: { E: 15, A: 5 },
      I: { I: 5 },
      NONE: { NONE: 39, A: 1 },
    },
  };
  const result = publicationCandidates(report);
  assert.equal(result.noneFalsePositiveRate, 1 / 40);
  assert.deepEqual(Object.fromEntries(result.letters.map((row) => [row.label, row.status])), {
    A: 'CANDIDATE_FOR_LSV_REVIEW',
    E: 'BELOW_THRESHOLD',
    I: 'INSUFFICIENT_TEST_DATA',
  });
  const noisy = publicationCandidates({
    confusionMatrix: { ...report.confusionMatrix, NONE: { NONE: 30, A: 10 } },
  });
  assert.equal(noisy.letters.find((row) => row.label === 'A').status, 'BELOW_THRESHOLD');
});
