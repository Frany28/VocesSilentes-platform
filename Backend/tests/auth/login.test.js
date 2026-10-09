import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { authFixture, registration, registered, csrfToken } from './fixture.js';

const fixture = authFixture();

test('login: éxito, fallo genérico, token nuevo y reset de contador concurrente', async () => {
  const { input, user, response } = await registered(fixture);
  const agent = request.agent(fixture.app);
  const csrf = await csrfToken(agent);
  const responses = await Promise.all(
    Array.from({ length: 3 }, () =>
      agent
        .post('/api/auth/login')
        .set('X-CSRF-Token', csrf)
        .send({ email: input.email, password: 'incorrect password' })
        .expect(401),
    ),
  );
  assert.equal(
    (await fixture.database.user.findUnique({ where: { id: user.id } })).failedLoginAttempts,
    3,
  );
  const missing = await agent
    .post('/api/auth/login')
    .set('X-CSRF-Token', csrf)
    .send({ email: registration().email, password: 'incorrect password' })
    .expect(401);
  assert.deepEqual(missing.body, responses[0].body);
  const success = await agent
    .post('/api/auth/login')
    .set('X-CSRF-Token', csrf)
    .send({ email: ` ${input.email.toUpperCase()} `, password: input.password })
    .expect(200);
  assert.equal(
    (await fixture.database.user.findUnique({ where: { id: user.id } })).failedLoginAttempts,
    0,
  );
  const cookie = (result) =>
    result.headers['set-cookie'].find((value) => value.startsWith('vs-session='));
  assert.notEqual(cookie(success), cookie(response));
  assert.equal((await agent.get('/api/auth/me').expect(200)).body.data.user.id, user.id);
});

test('login y /me: cuentas inactivas, eliminadas y bloqueadas son rechazadas', async () => {
  for (const data of [
    { isActive: false },
    { isDeleted: true, deletedAt: new Date() },
    { lockedUntil: new Date(Date.now() + 60000) },
  ]) {
    const { agent, input, user, csrf } = await registered(fixture);
    if (data.isDeleted) data.deletedAt = new Date();
    await fixture.database.user.update({ where: { id: user.id }, data });
    const result = await agent
      .post('/api/auth/login')
      .set('X-CSRF-Token', csrf)
      .send({ email: input.email, password: input.password })
      .expect(401);
    assert.equal(result.body.error.code, 'INVALID_CREDENTIALS');
    await agent.get('/api/auth/me').expect(401);
  }
});

test('login: bloqueo vencido permite entrar y se limpia sin alargar el bloqueo', async () => {
  const { agent, input, user, csrf } = await registered(fixture);
  await fixture.database.user.update({
    where: { id: user.id },
    data: { lockedUntil: new Date(Date.now() - 1000) },
  });
  await agent
    .post('/api/auth/login')
    .set('X-CSRF-Token', csrf)
    .send({ email: input.email, password: input.password })
    .expect(200);
  assert.equal(
    (await fixture.database.user.findUnique({ where: { id: user.id } })).lockedUntil,
    null,
  );
});
