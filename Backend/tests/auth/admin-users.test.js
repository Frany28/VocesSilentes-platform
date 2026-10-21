import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { authFixture, registered, registration } from './fixture.js';

const fixture = authFixture();
async function administrator() {
  const account = await registered(fixture);
  await fixture.database.user.update({ where: { id: account.user.id }, data: { role: 'ADMIN' } });
  return account;
}
const input = () => ({ ...registration(), role: 'USER', isActive: true });
const edit = (user) => ({
  firstName: user.firstName,
  lastName: user.lastName,
  username: user.username,
  email: user.email,
  role: user.role,
});
const create = (actor, body) =>
  actor.agent.post('/api/admin/users').set('X-CSRF-Token', actor.csrf).send(body);
const update = (actor, user, body) =>
  actor.agent.patch(`/api/admin/users/${user.id}`).set('X-CSRF-Token', actor.csrf).send(body);

test('admin: anónimo 401, estudiante 403, CSRF obligatorio y listado protegido', async () => {
  await request(fixture.app).post('/api/admin/users').send(input()).expect(401);
  const student = await registered(fixture);
  await create(student, input()).expect(403);
  await student.agent.get(`/api/admin/users/${student.user.id}`).expect(403);
  await update(student, student.user, edit(student.user)).expect(403);
  const admin = await administrator();
  await admin.agent.post('/api/admin/users').send(input()).expect(403);
  await admin.agent.patch(`/api/admin/users/${admin.user.id}`).send(edit(admin.user)).expect(403);
  await admin.agent.get('/api/admin/users').expect(200);
});

test('admin: creación, hashing real, acceso existente y lectura tras recarga', async () => {
  const admin = await administrator();
  const body = { ...input(), password: 'Ábcd123!' };
  const response = await create(admin, body).expect(201);
  const user = response.body.data.user;
  assert.equal(user.emailVerified, false);
  assert.equal(user.role, 'USER');
  assert.equal(user.isActive, true);
  assert.equal('passwordHash' in user, false);
  assert.equal('password' in user, false);
  const row = await fixture.database.user.findUnique({ where: { id: user.id } });
  assert.match(row.passwordHash, /^\$argon2id\$/);
  assert.equal(await fixture.database.session.count({ where: { userId: user.id } }), 0);
  assert.equal(
    (await admin.agent.get(`/api/admin/users/${user.id}`).expect(200)).body.data.user.email,
    body.email,
  );
  assert.equal(
    (await fixture.service.login({ email: body.email, password: body.password })).user.id,
    user.id,
  );
  const inactive = (await create(admin, { ...input(), isActive: false, role: 'ADMIN' }).expect(201))
    .body.data.user;
  assert.equal(inactive.isActive, false);
});
