import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import { authFixture, registered, csrfToken } from './fixture.js';

const fixture = authFixture();
test('estado: ADMIN desactiva/reactiva, revoca sesiones y no duplica auditoría al reintentar', async () => {
  const admin = await registered(fixture);
  await fixture.database.user.update({ where: { id: admin.user.id }, data: { role: 'ADMIN' } });
  const user = await registered(fixture);
  const route = `/api/admin/users/${user.user.id}/state`;
  await user.agent
    .patch(route)
    .set('X-CSRF-Token', user.csrf)
    .send({ isActive: false })
    .expect(403);
  await admin.agent.patch(route).send({ isActive: false }).expect(403);
  await admin.agent
    .patch(route)
    .set('X-CSRF-Token', admin.csrf)
    .send({ isActive: 'false' })
    .expect(400);
  for (let count = 0; count < 2; count++)
    await admin.agent
      .patch(route)
      .set('X-CSRF-Token', admin.csrf)
      .send({ isActive: false })
      .expect(200);
  await user.agent.get('/api/auth/me').expect(401);
  assert.equal(
    await fixture.database.auditLog.count({
      where: {
        entityId: user.user.id,
        operation: 'USER_UPDATED',
      },
    }),
    1,
  );
  await admin.agent
    .patch(route)
    .set('X-CSRF-Token', admin.csrf)
    .send({ isActive: true })
    .expect(200);
  await user.agent.get('/api/auth/me').expect(401);
  const agent = request.agent(fixture.app);
  const token = await csrfToken(agent);
  await agent
    .post('/api/auth/login')
    .set('X-CSRF-Token', token)
    .send({ email: user.input.email, password: user.input.password })
    .expect(200);
  await agent.get('/api/auth/me').expect(200);
});

test('estado: conserva último ADMIN, rechaza eliminados y revierte ante fallo de auditoría', async () => {
  const admin = await registered(fixture);
  await fixture.database.user.updateMany({ where: { role: 'ADMIN' }, data: { role: 'USER' } });
  await fixture.database.user.update({ where: { id: admin.user.id }, data: { role: 'ADMIN' } });
  const route = `/api/admin/users/${admin.user.id}/state`;
  const denied = await admin.agent
    .patch(route)
    .set('X-CSRF-Token', admin.csrf)
    .send({ isActive: false })
    .expect(409);
  assert.equal(denied.body.error.code, 'LAST_ACTIVE_ADMIN');
  const user = await registered(fixture);
  await fixture.db.exec(`CREATE FUNCTION reject_state_audit() RETURNS trigger LANGUAGE plpgsql AS
    $$ BEGIN RAISE EXCEPTION 'isolated audit failure'; END $$;
    CREATE TRIGGER reject_state_audit BEFORE INSERT ON vocessilentes."AuditLog"
    FOR EACH ROW EXECUTE FUNCTION reject_state_audit();`);
  try {
    await admin.agent
      .patch(`/api/admin/users/${user.user.id}/state`)
      .set('X-CSRF-Token', admin.csrf)
      .send({ isActive: false })
      .expect(500);
    assert.equal(
      (await fixture.database.user.findUnique({ where: { id: user.user.id } })).isActive,
      true,
    );
    await user.agent.get('/api/auth/me').expect(200);
  } finally {
    await fixture.db.exec('DROP TRIGGER reject_state_audit ON vocessilentes."AuditLog"');
  }
  await admin.agent
    .delete(`/api/admin/users/${user.user.id}`)
    .set('X-CSRF-Token', admin.csrf)
    .expect(200);
  await admin.agent
    .patch(`/api/admin/users/${user.user.id}/state`)
    .set('X-CSRF-Token', admin.csrf)
    .send({ isActive: true })
    .expect(409);
});
