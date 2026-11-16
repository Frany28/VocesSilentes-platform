import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { authFixture, registered } from './fixture.js';

const fixture = authFixture();

test('restablecer contraseña requiere autenticación y rol ADMIN', async () => {
  const target = await registered(fixture);
  const path = `/api/admin/users/${target.user.id}/password`;
  await request(fixture.app).put(path).send({ newPassword: 'Clave-Nueva-2026!' }).expect(401);
  const response = await target.agent.put(path)
    .set('X-CSRF-Token', target.csrf)
    .send({ newPassword: 'Clave-Nueva-2026!' }).expect(403);
  assert.equal(response.body.error.code, 'FORBIDDEN');
});

test('ADMIN actualiza el hash y revoca sesiones de la cuenta', async () => {
  const actor = await registered(fixture);
  await fixture.database.user.update({
    where: { id: actor.user.id },
    data: { role: 'ADMIN' },
  });
  const target = await registered(fixture);
  const before = await fixture.database.user.findUnique({ where: { id: target.user.id } });
  const path = `/api/admin/users/${target.user.id}/password`;
  await actor.agent.put(path).send({ newPassword: 'Clave-Nueva-2026!' }).expect(403);
  await actor.agent.put(path).set('X-CSRF-Token', actor.csrf)
    .send({ newPassword: 'Clave-Nueva-2026!' }).expect(204);
  const after = await fixture.database.user.findUnique({ where: { id: target.user.id } });
  assert.notEqual(after.passwordHash, before.passwordHash);
  assert.equal(await fixture.database.session.count({
    where: { userId: target.user.id, revokedAt: null },
  }), 0);
});
