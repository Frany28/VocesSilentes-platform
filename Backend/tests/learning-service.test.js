import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLearningService } from '../src/modules/learning/learning.service.js';

test('un esquema pendiente devuelve indisponibilidad controlada, sin catálogo vacío ni error SQL privado', async () => {
  const database = {
    module: {
      findMany: async () => {
        throw Object.assign(new Error('Detalle SQL interno de prueba'), { code: 'P2022' });
      },
    },
  };
  const service = createLearningService(database);
  await assert.rejects(service.snapshot('fixture-user'), (error) => {
    assert.equal(error.status, 503);
    assert.equal(error.code, 'LEARNING_UNAVAILABLE');
    assert.equal(error.message, 'El catálogo está pendiente de actualización.');
    return true;
  });
});

test('un fallo inesperado de catálogo se propaga y nunca se sustituye por progreso demostrativo', async () => {
  const failure = new Error('Transporte local de prueba');
  const database = {
    module: {
      findMany: async () => {
        throw failure;
      },
    },
  };
  await assert.rejects(
    createLearningService(database).snapshot('fixture-user'),
    (error) => error === failure,
  );
});
