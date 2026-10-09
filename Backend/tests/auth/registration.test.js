import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import argon2 from 'argon2';
import { authFixture, registration, registered, csrfToken } from './fixture.js';

const fixture = authFixture();

test('registro HTTP: normalización, USER, correo pendiente, Argon2id y sesión solo hasheada', async () => {
  const { agent, input, response, user } = await registered(fixture);
  assert.equal(user.role, 'USER');
  assert.equal(user.emailVerified, false);
  const stored = await fixture.database.user.findUnique({ where: { id: user.id } });
  assert.ok(stored.passwordHash.startsWith('$argon2id$v=19$'));
  assert.deepEqual(
    Object.fromEntries(
      stored.passwordHash
        .split('$')[3]
        .split(',')
        .map((item) => item.split('=')),
    ),
    { m: '19456', t: '2', p: '1' },
  );
  assert.ok(await argon2.verify(stored.passwordHash, input.password));
  assert.equal(await argon2.verify(stored.passwordHash, input.password.trim()), false);
  const session = await fixture.database.session.findFirst({ where: { userId: user.id } });
  assert.match(session.tokenHash, /^[0-9a-f]{64}$/);
  assert.equal(session.expiresAt.getTime() - session.createdAt.getTime(), 86400000);
  const cookie = response.headers['set-cookie'].find((value) => value.startsWith('vs-session='));
  assert.ok(
    cookie.includes('HttpOnly') && cookie.includes('SameSite=Lax') && cookie.includes('Path=/'),
  );
  assert.equal(cookie.includes('Domain='), false);
  assert.equal(JSON.stringify(response.body).includes(stored.passwordHash), false);
  assert.equal(JSON.stringify(response.body).includes(session.tokenHash), false);
  assert.equal(JSON.stringify(response.body).includes(cookie.split(';')[0].split('=')[1]), false);
  assert.equal((await agent.get('/api/auth/me').expect(200)).body.data.user.id, user.id);
});

test('registro concurrente: PostgreSQL decide duplicados de correo y username', async () => {
  const input = registration();
  const agent = request.agent(fixture.app);
  const csrf = await csrfToken(agent);
  const results = await Promise.all(
    Array.from({ length: 3 }, () =>
      agent
        .post('/api/auth/register')
        .set('X-CSRF-Token', csrf)
        .send({
          ...input,
          email: ` ${input.email.toUpperCase()} `,
          username: ` ${input.username.toUpperCase()} `,
        }),
    ),
  );
  assert.deepEqual(results.map((result) => result.status).sort(), [201, 409, 409]);
  const user = await fixture.database.user.findUnique({ where: { email: input.email } });
  assert.equal(user.username, input.username);
  const other = request.agent(fixture.app);
  const otherCsrf = await csrfToken(other);
  await other
    .post('/api/auth/register')
    .set('X-CSRF-Token', otherCsrf)
    .send({ ...registration(), username: input.username })
    .expect(409);
});

test('registro: campos privilegiados, contraseña corta/larga y datos fuera de contrato se rechazan', async () => {
  const agent = request.agent(fixture.app);
  const csrf = await csrfToken(agent);
  for (const field of [
    'role',
    'isActive',
    'emailVerified',
    'failedLoginAttempts',
    'lockedUntil',
    'isDeleted',
  ]) {
    await agent
      .post('/api/auth/register')
      .set('X-CSRF-Token', csrf)
      .send({ ...registration(), [field]: 'privileged' })
      .expect(400);
  }
  for (const input of [
    { password: 'short' },
    { password: 'a'.repeat(129) },
    { firstName: ' ' },
    { username: 'not valid' },
    { lastName: ' ' },
    { email: 'invalid' },
  ])
    await agent
      .post('/api/auth/register')
      .set('X-CSRF-Token', csrf)
      .send({ ...registration(), ...input })
      .expect(400);
  await agent
    .post('/api/auth/register')
    .set('X-CSRF-Token', csrf)
    .send({ ...registration(), password: '🔐'.repeat(128) })
    .expect(201);
});
