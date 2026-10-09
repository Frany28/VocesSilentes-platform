import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { requireSession, requireRole } from '../../src/modules/auth/auth.middleware.js';
import { errorHandler } from '../../src/middlewares/errors.js';
import { authFixture, registered } from './fixture.js';

const fixture = authFixture();

test('middleware administrativo aislado: 401, 403 y ADMIN, con rol/estado actuales', async () => {
  const guarded = express();
  guarded.use(cookieParser());
  guarded.get(
    '/admin-test',
    requireSession(fixture.service, fixture.config.auth),
    requireRole('ADMIN'),
    (req, res) => res.json({ userId: req.auth.id }),
  );
  guarded.use(errorHandler);
  const { user, response, agent } = await registered(fixture);
  const cookie = response.headers['set-cookie']
    .find((value) => value.startsWith('vs-session='))
    .split(';')[0];
  await request(guarded).get('/admin-test').expect(401);
  await request(guarded).get('/admin-test').set('Cookie', cookie).expect(403);
  await agent.get('/api/auth/me').expect(200);
  await fixture.database.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
  assert.equal(
    (await request(guarded).get('/admin-test').set('Cookie', cookie).expect(200)).body.userId,
    user.id,
  );
  assert.equal((await agent.get('/api/auth/me').expect(200)).body.data.user.role, 'ADMIN');
  await fixture.database.user.update({ where: { id: user.id }, data: { role: 'USER' } });
  await request(guarded).get('/admin-test').set('Cookie', cookie).expect(403);
  await fixture.database.user.update({ where: { id: user.id }, data: { isActive: false } });
  await request(guarded).get('/admin-test').set('Cookie', cookie).expect(401);
  await request(fixture.app).get('/api/admin-test').expect(404);
});
