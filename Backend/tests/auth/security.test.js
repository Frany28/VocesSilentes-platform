import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { authFixture, registration, registered, csrfToken } from './fixture.js';

const fixture = authFixture();

test('CSRF: registro, login y logout rechazan ausencia, token inválido y token ajeno', async () => {
  const stranger = request.agent(fixture.app);
  const strangerCsrf = await csrfToken(stranger);
  const agent = request.agent(fixture.app);
  await csrfToken(agent);
  for (const path of ['register', 'login', 'logout']) {
    const input =
      path === 'register'
        ? registration()
        : { email: 'nobody@example.invalid', password: 'irrelevant' };
    await agent.post(`/api/auth/${path}`).send(input).expect(403);
    for (const token of ['invalid', strangerCsrf]) {
      const response = await agent
        .post(`/api/auth/${path}`)
        .set('X-CSRF-Token', token)
        .send(input)
        .expect(403);
      assert.equal(response.body.error.code, 'CSRF_INVALID');
    }
  }
});

test('CSRF: login rota contexto/token y un 403 no revoca la sesión', async () => {
  const agent = request.agent(fixture.app);
  const oldCsrf = await csrfToken(agent);
  const response = await agent
    .post('/api/auth/register')
    .set('X-CSRF-Token', oldCsrf)
    .send(registration())
    .expect(201);
  const fresh = response.body.data.csrfToken;
  assert.notEqual(oldCsrf, fresh);
  await agent.post('/api/auth/logout').set('X-CSRF-Token', oldCsrf).send({}).expect(403);
  await agent.get('/api/auth/me').expect(200);
  assert.equal(await csrfToken(agent), fresh);
});

test('CORS con credenciales: lista exacta, preflight CSRF y ausencia de wildcard', async () => {
  const response = await request(fixture.app)
    .options('/api/auth/login')
    .set('Origin', 'http://localhost:5173')
    .set('Access-Control-Request-Method', 'POST')
    .set('Access-Control-Request-Headers', 'content-type,x-csrf-token')
    .expect(204);
  assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:5173');
  assert.equal(response.headers['access-control-allow-credentials'], 'true');
  assert.match(response.headers['access-control-allow-headers'], /X-CSRF-Token/i);
  await request(fixture.app)
    .get('/api/auth/csrf')
    .set('Origin', 'https://untrusted.invalid')
    .expect(403);
});

test('respuestas de autenticación no son cacheables', async () => {
  const { agent } = await registered(fixture);
  for (const path of ['csrf', 'me']) {
    const response = await agent.get(`/api/auth/${path}`).expect(200);
    assert.equal(response.headers['cache-control'], 'no-store');
  }
});

test('CSRF: bootstrap recupera una cookie obsoleta sin omitir validación posterior', async () => {
  const agent = request.agent(fixture.app);
  await csrfToken(agent);
  const response = await agent.get('/api/auth/csrf').set('Cookie', 'vs-csrf=invalid').expect(200);
  const token = response.body.data.csrfToken;
  assert.equal(await csrfToken(agent), token);
  const login = await agent
    .post('/api/auth/login')
    .set('X-CSRF-Token', token)
    .send({ email: 'nobody@example.invalid', password: 'incorrect' })
    .expect(401);
  assert.equal(login.body.error.code, 'INVALID_CREDENTIALS');
});
