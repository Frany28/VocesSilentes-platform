import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authFixture, registered } from './fixture.js';

const fixture = authFixture();
const base = '/api/admin/users';
async function administrator() {
  const actor = await registered(fixture);
  await fixture.database.user.update({ where: { id: actor.user.id }, data: { role: 'ADMIN' } });
  return actor;
}
const remove = (actor, id) => actor.agent.delete(`${base}/${id}`).set('X-CSRF-Token', actor.csrf);

test('borrado persistente revoca todas las sesiones, conserva relaciones y rechaza repetir/editar/login', async () => {
  const admin = await administrator();
  const target = await registered(fixture);
  await fixture.service.login(target.input);
  const report = await fixture.database.report.create({
    data: {
      authorId: target.user.id,
      description: 'Relación conservada',
      category: 'TECHNICAL',
    },
  });
  const deleted = (await remove(admin, target.user.id).expect(200)).body.data.user;
  assert.equal(deleted.isDeleted, true);
  assert.ok(deleted.deletedAt);
  assert.equal(
    await fixture.database.session.count({ where: { userId: target.user.id, revokedAt: null } }),
    0,
  );
  assert.ok(await fixture.database.report.findUnique({ where: { id: report.id } }));
  assert.equal(
    (await admin.agent.get(`${base}/${target.user.id}`).expect(200)).body.data.user.isDeleted,
    true,
  );
  await target.agent.get('/api/auth/me').expect(401);
  await assert.rejects(fixture.service.login(target.input), { code: 'INVALID_CREDENTIALS' });
  assert.equal((await remove(admin, target.user.id).expect(409)).body.error.code, 'USER_DELETED');
  const { firstName, lastName, username, email } = target.user;
  await admin.agent
    .patch(`${base}/${target.user.id}`)
    .set('X-CSRF-Token', admin.csrf)
    .send({ firstName, lastName, username, email, role: 'USER' })
    .expect(409);
  const events = await fixture.database.auditLog.findMany({
    where: { entityId: target.user.id },
    orderBy: { createdAt: 'asc' },
  });
  assert.deepEqual(
    events.map((event) => event.operation),
    ['USER_REGISTERED', 'USER_DELETED'],
  );
  assert.equal(events[0].actorId, target.user.id);
  assert.equal(events[1].actorId, admin.user.id);
});
