import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authFixture, registered, registration } from './fixture.js';

const fixture = authFixture();
const identity = ({ firstName, lastName, email, username }, role = 'USER') => ({
  firstName,
  lastName,
  email,
  username,
  role,
});

test('auditoría persistente: tres operaciones, actor de sesión, orden y ausencia de valores sensibles', async () => {
  const actor = await registered(fixture);
  await fixture.database.user.update({ where: { id: actor.user.id }, data: { role: 'ADMIN' } });
  const input = { ...registration(), role: 'USER', isActive: true };
  const user = (
    await actor.agent
      .post('/api/admin/users')
      .set('X-CSRF-Token', actor.csrf)
      .send(input)
      .expect(201)
  ).body.data.user;
  await fixture.usersService.edit(actor.user.id, user.id, {
    ...identity(user),
    firstName: 'Cambio',
  });
  await fixture.usersService.delete(actor.user.id, user.id);
  const rows = await fixture.database.auditLog.findMany({
    where: { entityId: user.id },
    orderBy: { createdAt: 'asc' },
  });
  assert.deepEqual(
    rows.map((row) => row.operation),
    ['USER_CREATED', 'USER_UPDATED', 'USER_DELETED'],
  );
  assert.ok(rows.every((row) => row.actorId === actor.user.id && row.entityType === 'User'));
  assert.deepEqual(Object.keys(rows[0]).sort(), [
    'actorId',
    'createdAt',
    'entityId',
    'entityType',
    'id',
    'operation',
  ]);
  for (const secret of [input.password, input.email, input.username, 'passwordHash', 'tokenHash'])
    assert.equal(JSON.stringify(rows).includes(secret), false);
  const page = (await actor.agent.get('/api/admin/audit-logs?pageSize=2').expect(200)).body.data;
  assert.equal(page.total, 4);
  assert.equal(page.items.length, 2);
  assert.equal(page.items[0].operation, 'USER_DELETED');
  assert.equal(
    (await actor.agent.get('/api/admin/audit-logs?pageSize=2&page=2').expect(200)).body.data.items
      .length,
    2,
  );
  await assert.rejects(fixture.usersService.create(actor.user.id, input), {
    code: 'ACCOUNT_IDENTIFIERS_IN_USE',
  });
  assert.equal(await fixture.database.auditLog.count(), 4);
});

test('fallo al persistir auditoría revierte creación, edición, eliminación y revocación', async () => {
  const actor = await registered(fixture);
  await fixture.database.user.update({ where: { id: actor.user.id }, data: { role: 'ADMIN' } });
  const target = await registered(fixture);
  const before = await fixture.database.auditLog.count();
  // Fallo real de SQL en la tabla, sin sustituir servicios/repositorios por mocks.
  await fixture.db.exec(`ALTER TABLE vocessilentes."AuditLog"
    ADD CONSTRAINT isolated_audit_failure CHECK ("entityType" = 'Impossible') NOT VALID`);
  const input = { ...registration(), role: 'USER', isActive: true };
  try {
    await assert.rejects(fixture.usersService.create(actor.user.id, input));
    assert.equal(await fixture.database.user.findUnique({ where: { email: input.email } }), null);
    await assert.rejects(
      fixture.usersService.edit(actor.user.id, target.user.id, {
        ...identity(target.user),
        firstName: 'No guardar',
      }),
    );
    await assert.rejects(fixture.usersService.delete(actor.user.id, target.user.id));
  } finally {
    await fixture.db.exec(
      'ALTER TABLE vocessilentes."AuditLog" DROP CONSTRAINT isolated_audit_failure',
    );
  }
  const row = await fixture.database.user.findUnique({ where: { id: target.user.id } });
  assert.equal(row.firstName, target.user.firstName);
  assert.equal(row.isDeleted, false);
  assert.equal(
    await fixture.database.session.count({ where: { userId: target.user.id, revokedAt: null } }),
    1,
  );
  assert.equal(await fixture.database.auditLog.count(), before);
});
