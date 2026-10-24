import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { authFixture, registered, csrfToken } from './fixture.js';

const fixture = authFixture();
test('perfil propio: ambos roles editan, rechaza campos privilegiados y conflictos sin exponer hashes', async () => {
  const user = await registered(fixture);
  const other = await registered(fixture);
  const { password: _password, ...input } = user.input;
  void _password;
  await request(fixture.app).patch('/api/account/profile').send(input).expect(401);
  await user.agent.patch('/api/account/profile').send(input).expect(403);
  await user.agent
    .patch('/api/account/profile')
    .set('X-CSRF-Token', user.csrf)
    .send({ ...input, role: 'ADMIN' })
    .expect(400);
  await user.agent
    .patch('/api/account/profile')
    .set('X-CSRF-Token', user.csrf)
    .send({ ...input, email: other.input.email })
    .expect(409);
  await fixture.database.user.update({
    where: { id: user.user.id },
    data: { emailVerified: true },
  });
  const changed = { ...input, firstName: 'Perfil actualizado', email: `updated_${input.email}` };
  const saved = await user.agent
    .patch('/api/account/profile')
    .set('X-CSRF-Token', user.csrf)
    .send(changed)
    .expect(200);
  assert.equal(saved.body.data.user.emailVerified, false);
  assert.equal(saved.body.data.user.role, 'USER');
  assert.equal(JSON.stringify(saved.body).includes('passwordHash'), false);
  const me = await user.agent.get('/api/auth/me').expect(200);
  assert.equal(me.body.data.user.firstName, changed.firstName);
  assert.equal(
    (await fixture.database.user.findUnique({ where: { id: other.user.id } })).firstName,
    other.input.firstName,
  );
  await fixture.database.user.update({ where: { id: user.user.id }, data: { role: 'ADMIN' } });
  await user.agent
    .patch('/api/account/profile')
    .set('X-CSRF-Token', user.csrf)
    .send(changed)
    .expect(200);
});

test('contraseña: valida actual, revoca otras sesiones, conserva la actual y permite nuevo login', async () => {
  const user = await registered(fixture);
  const another = request.agent(fixture.app);
  const anotherToken = await csrfToken(another);
  await another
    .post('/api/auth/login')
    .set('X-CSRF-Token', anotherToken)
    .send({ email: user.input.email, password: user.input.password })
    .expect(200);
  const next = 'Una credencial diferente privada 2026!';
  const update = (currentPassword, newPassword = next) =>
    user.agent
      .put('/api/account/password')
      .set('X-CSRF-Token', user.csrf)
      .send({ currentPassword, newPassword });
  await update('Incorrecta de prueba 2026!').expect(400);
  await update(user.input.password, 'corta').expect(400);
  await update(user.input.password, user.input.password).expect(400);
  await update(user.input.password).expect(204);
  await user.agent.get('/api/auth/me').expect(200);
  await another.get('/api/auth/me').expect(401);
  const login = request.agent(fixture.app);
  const loginToken = await csrfToken(login);
  await login
    .post('/api/auth/login')
    .set('X-CSRF-Token', loginToken)
    .send({ email: user.input.email, password: user.input.password })
    .expect(401);
  await login
    .post('/api/auth/login')
    .set('X-CSRF-Token', loginToken)
    .send({ email: user.input.email, password: next })
    .expect(200);
  assert.equal(
    await fixture.database.auditLog.count({
      where: {
        entityId: user.user.id,
        operation: 'USER_UPDATED',
      },
    }),
    1,
  );
});
