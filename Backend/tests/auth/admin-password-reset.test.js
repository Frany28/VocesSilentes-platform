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
