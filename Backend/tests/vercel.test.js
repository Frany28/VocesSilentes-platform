import { test } from 'node:test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execute = promisify(execFile);
const cwd = fileURLToPath(new URL('../', import.meta.url));
const env = {
  ...process.env,
  NODE_ENV: 'production',
  CORS_ORIGINS: 'https://frontend.example.invalid',
  CSRF_SECRET: 'd'.repeat(64),
  DATABASE_URL: '',
  TRUST_PROXY_IPS: '',
  SESSION_SAME_SITE: 'none',
  LOG_LEVEL: 'silent',
};
const imports = `
  import assert from 'node:assert/strict';
  import request from 'supertest';
  import app from './app.js';
`;

test('Vercel: entrada real conserva rutas, CORS, errores y cookies HTTPS sin PostgreSQL', async () => {
  await execute(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `${imports}
    const health = await request(app).get('/api/health').expect(200);
    assert.equal(health.body.data.status, 'ok');
    assert.equal(health.headers['x-powered-by'], undefined);
    await request(app).get('/api/no-existe').expect(404);
    await request(app).get('/api/health').set('Origin', 'https://otro.invalid').expect(403);
    const preflight = await request(app).options('/api/auth/login')
      .set('Origin', 'https://frontend.example.invalid')
      .set('Access-Control-Request-Method', 'POST').expect(204);
    assert.equal(preflight.headers['access-control-allow-credentials'], 'true');
    assert.equal(preflight.headers['access-control-allow-origin'], 'https://frontend.example.invalid');
    const csrf = await request(app).get('/api/auth/csrf')
      .set('X-Forwarded-Proto', 'https').set('X-Forwarded-For', '203.0.113.10').expect(200);
    assert.ok(csrf.body.data.csrfToken);
    for (const cookie of csrf.headers['set-cookie']) {
      assert.match(cookie, /^__Host-vs-/);
      assert.match(cookie, /; Secure/);
      assert.match(cookie, /; HttpOnly/);
      assert.match(cookie, /; SameSite=None/);
      assert.doesNotMatch(cookie, /Domain=/i);
    }
    await request(app).get('/api/auth/csrf').set('X-Forwarded-Proto', 'http').expect(403);
    const me = await request(app).get('/api/auth/me').set('X-Forwarded-Proto', 'https').expect(503);
    assert.equal(me.body.error.code, 'AUTH_UNAVAILABLE');
  `,
    ],
    { cwd, env: { ...env, VERCEL: '1' }, timeout: 15000 },
  );
});

test('fuera de Vercel, sus headers no habilitan confianza de proxy ni cookies seguras', async () => {
  await execute(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `${imports}
    const response = await request(app).get('/api/auth/csrf')
      .set('X-Forwarded-Proto', 'https').set('X-Vercel-Id', 'arbitrary').expect(403);
    assert.equal(response.body.error.code, 'HTTPS_REQUIRED');
    assert.equal(response.headers['set-cookie'], undefined);
  `,
    ],
    { cwd, env: { ...env, VERCEL: '' }, timeout: 15000 },
  );
});
