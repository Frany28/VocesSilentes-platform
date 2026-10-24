import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { authFixture, registered } from './fixture.js';

const fixture = authFixture();
test('dashboard: recuentos globales, reportes reales y actividad del detalle con permisos ADMIN', async () => {
  const admin = await registered(fixture);
  await fixture.database.user.update({ where: { id: admin.user.id }, data: { role: 'ADMIN' } });
  const user = await registered(fixture);
  await user.agent.get('/api/admin/summary').expect(403);
  await request(fixture.app).get('/api/admin/summary').expect(401);
  const report = await user.agent
    .post('/api/reports')
    .set('X-CSRF-Token', user.csrf)
    .send({
      requestId: randomUUID(),
      description: 'Reporte real para el dashboard',
      category: 'TECHNICAL',
    })
    .expect(201);
  const { body } = await admin.agent.get('/api/admin/summary').expect(200);
  assert.equal(body.data.users, await fixture.database.user.count({ where: { isDeleted: false } }));
  assert.equal(body.data.activeUsers + body.data.inactiveUsers, body.data.users);
  assert.equal(body.data.pendingReports, 1);
  assert.ok(body.data.reports.some((item) => item.id === report.body.data.report.id));
  const detail = await admin.agent.get(`/api/admin/users/${user.user.id}`).expect(200);
  assert.equal(detail.body.data.user.activity.lessons, 0);
  assert.ok(detail.body.data.user.activity.lastActivity);
  assert.equal(JSON.stringify(body).includes('passwordHash'), false);
});
