import assert from 'node:assert/strict';
import { test } from 'node:test';
import { z } from 'zod';
import { errorHandler } from '../src/middlewares/errors.js';

function capture(error) {
  let status;
  let body;
  let logged;
  errorHandler(
    error,
    {
      log: {
        error: (entry) => {
          logged = entry;
        },
      },
    },
    {
      status(value) {
        status = value;
        return this;
      },
      json(value) {
        body = value;
      },
    },
    () => assert.fail('No debe delegar sin cabeceras enviadas'),
  );
  return { status, body, logged };
}

test('un fallo inesperado se registra sin exponer sus detalles al cliente', () => {
  const error = new Error('secret-marker');
  const result = capture(error);
  assert.equal(result.status, 500);
  assert.deepEqual(result.body, {
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
  });
  assert.equal(result.logged.err, error);
});

test('las validaciones Zod tienen un mensaje público uniforme', () => {
  const parsed = z.object({ name: z.string() }).safeParse({ name: 10 });
  assert.equal(capture(parsed.error).body.error.code, 'INVALID_INPUT');
});

test('si ya se enviaron cabeceras delega a Express', () => {
  const error = new Error('stream closed');
  let delegated;
  errorHandler(error, {}, { headersSent: true }, (value) => {
    delegated = value;
  });
  assert.equal(delegated, error);
});
