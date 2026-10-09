import assert from 'node:assert/strict';
import { test } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { parseEnv } from '../src/config/env.js';
import { createLogger } from '../src/lib/logger.js';

const app = createApp(parseEnv({ NODE_ENV: 'test' }), createLogger('silent'));

test('health comprueba vida del proceso sin depender de PostgreSQL', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.deepEqual(response.body, { data: { status: 'ok', service: 'vocessilentes-api' } });
  assert.equal(response.headers['x-powered-by'], undefined);
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
});

test('una ruta desconocida usa el contrato de errores', async () => {
  const response = await request(app).get('/api/no-existe').expect(404);
  assert.deepEqual(response.body, {
    error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' },
  });
});

test('CORS permite exactamente el origen configurado y el preflight', async () => {
  const response = await request(app)
    .options('/api/health')
    .set('Origin', 'http://localhost:5173')
    .set('Access-Control-Request-Method', 'GET')
    .expect(204);
  assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:5173');
});

test('CORS rechaza un origen parecido con otro dominio', async () => {
  const response = await request(app)
    .get('/api/health')
    .set('Origin', 'http://localhost:5173.ejemplo.invalid')
    .expect(403);
  assert.equal(response.body.error.code, 'ORIGIN_NOT_ALLOWED');
  assert.equal(response.headers['access-control-allow-origin'], undefined);
});

test('JSON malformado no revela contenido ni trazas', async () => {
  const response = await request(app)
    .post('/api/desconocida')
    .set('Content-Type', 'application/json')
    .send('{"private":"secret-marker"')
    .expect(400);
  assert.deepEqual(response.body, {
    error: { code: 'INVALID_INPUT', message: 'Datos de entrada inválidos' },
  });
  assert.ok(!JSON.stringify(response.body).includes('secret-marker'));
});

test('limita cuerpos JSON antes de procesar rutas', async () => {
  const response = await request(app)
    .post('/api/desconocida')
    .send({ text: 'a'.repeat(110000) })
    .expect(413);
  assert.equal(response.body.error.code, 'PAYLOAD_TOO_LARGE');
});
