import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEnv } from '../src/config/env.js';
import { authCookies } from '../src/modules/auth/auth.cookies.js';

test('configuración: duración/límites/proxy validados, sin valores privados en errores', () => {
  for (const values of [
    { SESSION_DURATION_SECONDS: '0' },
    { LOGIN_IP_LIMIT: '-1' },
    { SESSION_SAME_SITE: 'none' },
    { TRUST_PROXY_IPS: 'true' },
    { TRUST_PROXY_IPS: '*' },
    { CSRF_SECRET: 'private-invalid-value' },
    { CORS_ORIGINS: 'http://remote.invalid' },
  ]) {
    assert.throws(
      () => parseEnv(values),
      (error) => {
        assert.equal(error.name, 'Error');
        assert.ok(!error.message.includes(Object.values(values)[0]));
        return true;
      },
    );
  }
});

test('producción: HTTPS, secreto compartido y cookies __Host sin Domain', () => {
  assert.throws(
    () => parseEnv({ NODE_ENV: 'production', CORS_ORIGINS: 'https://example.invalid' }),
    /CSRF_SECRET/,
  );
  const config = parseEnv({
    NODE_ENV: 'production',
    CORS_ORIGINS: 'https://example.invalid',
    CSRF_SECRET: 'b'.repeat(64),
    SESSION_SAME_SITE: 'none',
    TRUST_PROXY_IPS: '127.0.0.1',
  });
  const cookies = authCookies(config.auth);
  assert.equal(cookies.session, '__Host-vs-session');
  assert.deepEqual(cookies.options, { secure: true, httpOnly: true, sameSite: 'none', path: '/' });
  assert.deepEqual(config.auth.trustProxyIps, ['127.0.0.1']);
});
