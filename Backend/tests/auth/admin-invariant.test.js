import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authFixture, registered } from './fixture.js';

const fixture = authFixture();
const identity = (user, role) => ({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  username: user.username,
  role,
});
test('último administrador: rechazo atómico, degradación concurrente y permisos vigentes', async () => {
  const first = await registered(fixture);
  await fixture.database.user.update({ where: { id: first.user.id }, data: { role: 'ADMIN' } });
  await assert.rejects(
    fixture.usersService.edit(first.user.id, first.user.id, identity(first.user, 'USER')),
    { code: 'LAST_ACTIVE_ADMIN' },
  );
  const second = await registered(fixture);
  await fixture.database.user.update({ where: { id: second.user.id }, data: { role: 'ADMIN' } });
  const results = await Promise.allSettled([
    fixture.usersService.edit(first.user.id, first.user.id, identity(first.user, 'USER')),
    fixture.usersService.edit(second.user.id, second.user.id, identity(second.user, 'USER')),
  ]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(await fixture.database.user.count({ where: { role: 'ADMIN', isActive: true } }), 1);
  const downgraded = (await fixture.database.user.findMany({ where: { role: 'USER' } }))[0];
  await assert.rejects(
    fixture.usersService.edit(downgraded.id, downgraded.id, identity(downgraded, 'ADMIN')),
    { code: 'FORBIDDEN' },
  );
});
