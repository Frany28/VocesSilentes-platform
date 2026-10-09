import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { authFixture, registered, csrfToken } from './fixture.js';

const fixture = authFixture();

test('/me: cookie ausente, inválida y token desconocido devuelven 401', async () => {
  await request(fixture.app).get('/api/auth/me').expect(401);
  for (const token of ['invalid', 'a'.repeat(43)]) {
    await request(fixture.app).get('/api/auth/me').set('Cookie', `vs-session=${token}`).expect(401);
  }
});

test('/me: sesión vencida/revocada rechazada y respuesta sin campos sensibles', async () => {
  for (const mode of ['expired', 'revoked']) {
    const { agent, user } = await registered(fixture);
    const response = await agent.get('/api/auth/me').expect(200);
    for (const field of [
      'passwordHash',
      'tokenHash',
      'failedLoginAttempts',
      'lockedUntil',
      'sessions',
    ]) {
      assert.equal(field in response.body.data.user, false);
    }
    const data =
      mode === 'expired'
        ? { createdAt: new Date(Date.now() - 10000), expiresAt: new Date(Date.now() - 1000) }
        : { revokedAt: new Date() };
    await fixture.database.session.updateMany({ where: { userId: user.id }, data });
    await agent.get('/api/auth/me').expect(401);
  }
});

test('logout: revocación persistente, cookie eliminada y repetición con CSRF válido', async () => {
  const { agent, user, response, csrf } = await registered(fixture);
  const oldCookie = response.headers['set-cookie']
    .find((value) => value.startsWith('vs-session='))
    .split(';')[0];
  const logout = await agent
    .post('/api/auth/logout')
    .set('X-CSRF-Token', csrf)
    .send({})
    .expect(204);
  const removed = logout.headers['set-cookie'].find((value) => value.startsWith('vs-session='));
  assert.ok(
    removed.includes('HttpOnly') && removed.includes('Path=/') && removed.includes('SameSite=Lax'),
  );
  assert.ok((await fixture.database.session.findFirst({ where: { userId: user.id } })).revokedAt);
  await request(fixture.app).get('/api/auth/me').set('Cookie', oldCookie).expect(401);
  const anonymousCsrf = await csrfToken(agent);
  await agent.post('/api/auth/logout').set('X-CSRF-Token', anonymousCsrf).send({}).expect(204);
});
