import { test } from 'node:test';
import assert from 'node:assert/strict';
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

test('admin: whitelist, correo, contraseña, roles, estados y duplicados', async () => {
  const admin = await administrator();
  await create(admin, {}).expect(400);
  for (const change of [
    { password: 'Abcd12!' },
    { password: 'A' + 'x'.repeat(127) + '!' },
    { password: 'abcd123!' },
    { password: 'Abcd1234' },
    { password: 'Abcd123 ' },
    { email: 'mal' },
    { role: 'OWNER' },
    { isActive: 'true' },
    { emailVerified: true },
    { passwordHash: 'privado' },
    { username: 'dos.puntos' },
  ])
    await create(admin, { ...input(), ...change }).expect(400);
  await create(admin, { ...input(), password: 'A' + 'x'.repeat(126) + '!' }).expect(201);
  const body = input();
  const user = (await create(admin, body).expect(201)).body.data.user;
  await update(admin, user, {}).expect(400);
  const email = await create(admin, { ...input(), email: body.email.toUpperCase() }).expect(409);
  assert.equal(email.body.error.code, 'EMAIL_IN_USE');
  const username = await create(admin, {
    ...input(),
    username: body.username.toUpperCase(),
  }).expect(409);
  assert.equal(username.body.error.code, 'USERNAME_IN_USE');
  const both = await create(admin, body).expect(409);
  assert.equal(both.body.error.code, 'ACCOUNT_IDENTIFIERS_IN_USE');
  for (const change of [
    { isActive: false },
    { password: 'Otra contraseña larga' },
    { emailVerified: true },
    { role: 'OWNER' },
  ])
    await update(admin, user, { ...edit(user), ...change }).expect(400);
  await update(admin, user, edit(user)).expect(200);
});

test('admin: edición persistida, unicidad excluye propia cuenta y correo vuelve a pendiente', async () => {
  const admin = await administrator();
  const user = (await create(admin, input()).expect(201)).body.data.user;
  const other = (await create(admin, input()).expect(201)).body.data.user;
  const email = await update(admin, user, { ...edit(user), email: other.email }).expect(409);
  assert.equal(email.body.error.code, 'EMAIL_IN_USE');
  const username = await update(admin, user, { ...edit(user), username: other.username }).expect(
    409,
  );
  assert.equal(username.body.error.code, 'USERNAME_IN_USE');
  const both = await update(admin, user, {
    ...edit(user),
    email: other.email,
    username: other.username,
  }).expect(409);
  assert.equal(both.body.error.code, 'ACCOUNT_IDENTIFIERS_IN_USE');
  await fixture.database.user.update({ where: { id: user.id }, data: { emailVerified: true } });
  assert.equal(
    (await update(admin, user, edit(user)).expect(200)).body.data.user.emailVerified,
    true,
  );
  const body = {
    ...edit(user),
    firstName: 'Modificado',
    lastName: null,
    email: registration().email,
    role: 'ADMIN',
  };
  const result = (await update(admin, user, body).expect(200)).body.data.user;
  assert.equal(result.emailVerified, false);
  assert.equal(result.role, 'ADMIN');
  const reloaded = (await admin.agent.get(`/api/admin/users/${user.id}`).expect(200)).body.data
    .user;
  assert.equal(reloaded.firstName, 'Modificado');
  assert.equal(reloaded.email, body.email);
  assert.equal(reloaded.lastName, null);
  await admin.agent.get('/api/admin/users/invalid').expect(400);
  await admin.agent.get('/api/admin/users/00000000-0000-4000-8000-000000000000').expect(404);
});
