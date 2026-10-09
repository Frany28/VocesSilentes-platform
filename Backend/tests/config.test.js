import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ConfigurationError, parseEnv } from '../src/config/env.js';

test('convierte puerto y orígenes y permite desarrollo sin base de datos', () => {
  const config = parseEnv({
    PORT: '3100',
    CORS_ORIGINS: 'http://localhost:5173, https://example.invalid',
    DATABASE_URL: '',
  });
  assert.equal(config.port, 3100);
  assert.deepEqual(config.corsOrigins, ['http://localhost:5173', 'https://example.invalid']);
  assert.equal(config.databaseUrl, undefined);
  assert.ok(Object.isFrozen(config));
});

for (const port of ['', '0', '65536', '3.5', 'no-number']) {
  test(`rechaza puerto inválido: ${JSON.stringify(port)}`, () => {
    assert.throws(() => parseEnv({ PORT: port }), ConfigurationError);
  });
}

for (const origin of [
  '*',
  '',
  'https://example.invalid/path',
  'https://user:pass@example.invalid',
]) {
  test(`rechaza origen inválido: ${origin}`, () => {
    assert.throws(() => parseEnv({ CORS_ORIGINS: origin }), /CORS_ORIGINS/);
  });
}

test('producción requiere orígenes explícitos', () => {
  assert.throws(() => parseEnv({ NODE_ENV: 'production' }), /CORS_ORIGINS/);
  assert.equal(
    parseEnv({ NODE_ENV: 'production', CORS_ORIGINS: 'https://example.invalid' }).nodeEnv,
    'production',
  );
});

test('rechaza entorno y nivel de log desconocidos', () => {
  assert.throws(
    () => parseEnv({ NODE_ENV: 'invalid', LOG_LEVEL: 'verbose' }),
    (error) => {
      assert.match(error.message, /NODE_ENV/);
      assert.match(error.message, /LOG_LEVEL/);
      return true;
    },
  );
});

test('valida PostgreSQL y nunca muestra el valor secreto de una variable inválida', () => {
  assert.throws(() => parseEnv({ DATABASE_URL: 'secret-marker' }), /DATABASE_URL/);
  const url = 'postgresql://local:example-password@localhost:5432/vocessilentes';
  assert.equal(parseEnv({ DATABASE_URL: url }).databaseUrl, url);
  assert.throws(
    () => parseEnv({ DATABASE_URL: 'mysql://local:secret-marker@localhost/db' }),
    (error) => {
      assert.equal(error.message, 'Configuración inválida: DATABASE_URL');
      assert.ok(!error.message.includes('secret-marker'));
      return true;
    },
  );
});
