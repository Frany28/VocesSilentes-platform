import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { authFixture, registered, registration } from './fixture.js';

const fixture = authFixture();
const base = '/api/admin/users';
async function administrator() {
  const actor = await registered(fixture);
  await fixture.database.user.update({ where: { id: actor.user.id }, data: { role: 'ADMIN' } });
  return actor;
}
const remove = (actor, id) => actor.agent.delete(`${base}/${id}`).set('X-CSRF-Token', actor.csrf);

test('listado, borrado y bitácora exigen autenticación, ADMIN y CSRF para eliminar', async () => {
  const user = await registered(fixture);
  for (const path of [base, '/api/admin/audit-logs']) {
    await request(fixture.app).get(path).expect(401);
    await user.agent.get(path).expect(403);
  }
  await request(fixture.app).delete(`${base}/${user.user.id}`).expect(401);
  await remove(user, user.user.id).expect(403);
  const admin = await administrator();
  await admin.agent.delete(`${base}/${user.user.id}`).expect(403);
  await remove(admin, 'invalid').expect(400);
  await remove(admin, randomUUID()).expect(404);
  for (const query of [
    'page=0',
    'page=1.2',
    'pageSize=101',
    'role=OWNER',
    'includeDeleted=true',
    'q[x]=bad',
  ])
    await admin.agent.get(`${base}?${query}`).expect(400);
  await admin.agent.get('/api/admin/audit-logs?pageSize=0').expect(400);
  await admin.agent
    .patch('/api/admin/audit-logs')
    .set('X-CSRF-Token', admin.csrf)
    .send({})
    .expect(404);
});

test('paginación y búsqueda PostgreSQL por nombre, apellido, correo, username y rol', async () => {
  const admin = await administrator();
  const marker = randomUUID().replaceAll('-', '');
  const accounts = [];
  for (let n = 0; n < 5; n += 1) {
    accounts.push(
      await fixture.database.user.create({
        data: {
          ...registration(),
          password: undefined,
          passwordHash: '$argon2id$fixture',
          firstName: `Nombre${marker}`,
          lastName: `Apellido${marker}`,
          username: `u${marker}_${n}`,
          email: `${marker}_${n}@example.invalid`,
          role: n === 0 ? 'ADMIN' : 'USER',
        },
      }),
    );
  }
  await fixture.usersService.delete(admin.user.id, accounts[4].id);
  const first = (await admin.agent.get(`${base}?q=${marker}&pageSize=2`).expect(200)).body.data;
  const second = (await admin.agent.get(`${base}?q=${marker}&pageSize=2&page=2`).expect(200)).body
    .data;
  assert.equal(first.total, 4);
  assert.equal(first.pages, 2);
  assert.equal(new Set([...first.items, ...second.items].map((user) => user.id)).size, 4);
  assert.equal(
    first.items.some((user) => 'passwordHash' in user || 'sessions' in user),
    false,
  );
  for (const q of [
    `NOMBRE${marker}`,
    `Apellido${marker}`,
    accounts[0].email,
    accounts[0].username,
  ]) {
    const data = (await admin.agent.get(base).query({ q, role: 'ADMIN' }).expect(200)).body.data;
    assert.equal(data.total, 1);
    assert.equal(data.items[0].id, accounts[0].id);
  }
  assert.equal(
    (await admin.agent.get(base).query({ q: marker, page: 99 }).expect(200)).body.data.items.length,
    0,
  );
});
