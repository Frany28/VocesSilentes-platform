import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { parseEnv } from '../src/config/env.js';
import { createLogger } from '../src/lib/logger.js';

const production = {
  NODE_ENV: 'production',
  CORS_ORIGINS: 'https://example.invalid',
  CSRF_SECRET: 'c'.repeat(64),
};

test('transporte: X-Forwarded-Proto arbitrario no habilita HTTP en producción', async () => {
  const app = createApp(parseEnv(production), createLogger('silent'));
  const response = await request(app)
    .get('/api/auth/csrf')
    .set('X-Forwarded-Proto', 'https')
    .expect(403);
  assert.equal(response.body.error.code, 'HTTPS_REQUIRED');
  assert.equal(response.headers['set-cookie'], undefined);
});

test('transporte: proxy explícito emite cookies Secure/HttpOnly/__Host sin Domain', async () => {
  const config = parseEnv({ ...production, TRUST_PROXY_IPS: '127.0.0.1,::1' });
  const app = createApp(config, createLogger('silent'));
  const response = await request(app)
    .get('/api/auth/csrf')
    .set('X-Forwarded-Proto', 'https')
    .expect(200);
  for (const cookie of response.headers['set-cookie']) {
    assert.match(cookie, /^__Host-vs-/);
    assert.match(cookie, /; Secure/);
    assert.match(cookie, /; HttpOnly/);
    assert.match(cookie, /; Path=\//);
    assert.match(cookie, /; SameSite=Lax/);
    assert.doesNotMatch(cookie, /Domain=/i);
  }
});
