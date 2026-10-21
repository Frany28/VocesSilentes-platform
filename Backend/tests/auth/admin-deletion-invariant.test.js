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

test('eliminación concurrente con degradación conserva un ADMIN y revalida al actor eliminado', async () => {
  const first = await registered(fixture);
  const remaining = await fixture.database.user.update({
    where: { id: first.user.id },
    data: { role: 'ADMIN' },
  });
  await assert.rejects(fixture.usersService.delete(remaining.id, remaining.id), {
    code: 'LAST_ACTIVE_ADMIN',
  });
  const second = await registered(fixture);
  await fixture.database.user.update({ where: { id: second.user.id }, data: { role: 'ADMIN' } });
  const results = await Promise.allSettled([
    fixture.usersService.delete(remaining.id, remaining.id),
    fixture.usersService.edit(second.user.id, second.user.id, identity(second.user, 'USER')),
  ]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(
    await fixture.database.user.count({
      where: { role: 'ADMIN', isActive: true, isDeleted: false },
    }),
    1,
  );
  const survivor = await fixture.database.user.findFirst({
    where: { role: 'ADMIN', isDeleted: false },
  });
  const target = await registered(fixture);
  await fixture.database.user.update({ where: { id: target.user.id }, data: { role: 'ADMIN' } });
  await fixture.usersService.delete(survivor.id, target.user.id);
  await assert.rejects(fixture.usersService.delete(target.user.id, survivor.id), {
    code: 'FORBIDDEN',
  });
});
