import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classificationMetrics } from '../../shared/lsv/metrics.js';
import { publicationCandidates } from '../../shared/lsv/readiness.js';

// Predicciones inventadas solo para comprobar las fórmulas; no son resultados de un modelo LSV.
test('precision, recall, macro F1 y falsos positivos NONE cuentan errores y UNSURE sin ocultarlos', () => {
  const rows = [
    { expected: 'A', predicted: 'A' },
    { expected: 'A', predicted: 'UNSURE' },
    { expected: 'B', predicted: 'A' },
    { expected: 'NONE', predicted: 'B' },
    { expected: 'NONE', predicted: 'NONE' },
  ];
  const report = classificationMetrics(rows, ['A', 'B', 'NONE']);
  assert.equal(report.accuracy, 2 / 5);
  assert.equal(report.abstained, 1);
  assert.equal(report.perLetter.A.precision, 1 / 2);
  assert.equal(report.perLetter.A.recall, 1 / 2);
  assert.equal(report.perLetter.A.f1, 1 / 2);
  assert.equal(report.perLetter.B.f1, 0);
  assert.equal(report.perLetter.NONE.f1, 2 / 3);
  assert.ok(Math.abs(report.macroF1 - 7 / 18) < 1e-12);
  assert.equal(report.noneFalsePositiveRate, 1 / 2);
  assert.equal(report.confusionMatrix.A.UNSURE, 1);
  assert.equal(report.confusionMatrix.B.NONE, 0);
});

test('sin pruebas las métricas son null y una clase ausente no mejora artificialmente F1 macro', () => {
  assert.equal(classificationMetrics([], ['A', 'NONE']).accuracy, null);
  assert.equal(classificationMetrics([], ['A', 'NONE']).macroF1, null);
  const partial = classificationMetrics([{ expected: 'A', predicted: 'A' }], ['A', 'NONE']);
  assert.equal(partial.macroF1, 0.5);
  assert.equal(partial.perLetter.NONE.recall, null);
  assert.equal(partial.noneFalsePositiveRate, null);
  assert.throws(
    () => classificationMetrics([{ expected: 'B', predicted: 'B' }], ['A', 'NONE']),
    /mismo experimento/,
  );
});

test('una matriz excelente sin diversidad documentada no produce candidatas para publicación', () => {
  const result = publicationCandidates({ confusionMatrix: { A: { A: 100 }, NONE: { NONE: 100 } } });
  assert.equal(result.letters[0].status, 'INSUFFICIENT_PARTICIPANT_DATA');
});
