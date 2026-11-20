import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { predictSequence, validateModel } from '../../shared/lsv/classifier.js';

const model = validateModel(
  JSON.parse(
    await readFile(
      new URL('../../Frontend/public/models/lsv-vowels-demo-v1.json', import.meta.url),
      'utf8',
    ),
  ),
);

// Reutiliza referencias de entrenamiento publicadas: comprueba contratos, no precisión independiente LSV.
for (const letter of 'AEIOU') {
  const reference = model.prototypes.find((item) => item.label === letter && item.hand === 'Right');
  test(`${letter}: el modelo conserva la candidata derecha con su evidencia de referencia`, () => {
    assert.ok(reference);
    assert.deepEqual(predictSequence(model, reference.sequence, 'Right'), {
      label: letter,
      distance: 0,
      reason: 'CANDIDATE',
    });
  });
  test(`${letter}: no inventa cobertura izquierda a partir de la referencia derecha`, () => {
    assert.equal(predictSequence(model, reference.sequence, 'Left').reason, 'UNSUPPORTED_HAND');
    assert.equal(predictSequence(model, reference.sequence, 'Left').label, null);
  });
}
