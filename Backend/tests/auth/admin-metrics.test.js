import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { authFixture } from './fixture.js';
import { seedMetrics, seedMetricProgress } from './metrics.fixture.js';
import { readAdminMetrics } from '../../src/modules/admin/metrics.service.js';

const fixture = authFixture();
const query = { period: 'custom', from: '2026-10-01', to: '2026-10-31' };
const now = new Date('2026-11-05T16:00:00Z');
let data;
test('métricas ADMIN: agregado exacto, catálogo disponible, cohortes, actividad real y privacidad', async () => {
  data = await seedMetrics(fixture);
  await seedMetricProgress(fixture.database, data);
  const result = await readAdminMetrics(fixture.database, query, now);
  assert.equal(result.users, 4);
  assert.equal(result.enabledUsers, 3);
  assert.equal(result.disabledUsers, 1);
  assert.equal(result.activity.active7, 1);
  assert.equal(result.activity.active30, 3);
  assert.equal(result.activity.uniqueUsers, 3);
  assert.equal(result.activity.daily.find((item) => item.day === '2026-10-30').users, 1);
  assert.equal(result.activity.daily.find((item) => item.day === '2026-10-31').users, 1);
  assert.deepEqual(result.catalog, {
    modulesPublished: 2,
    lessonsPublished: 3,
    exercisesAvailable: 4,
  });
  assert.equal(result.education.lessonsStarted, 3);
  assert.equal(result.education.lessonsCompleted, 2);
  assert.equal(result.education.exercisesCompleted, 2);
  assert.equal(result.education.cohortCompleted, 1);
  assert.equal(result.education.completionPercentage, 33.33);
  assert.equal(result.education.byModule[0].completed, 2);
  assert.equal(result.education.byModule[1].completed, 0);
  assert.equal(result.period.from.toISOString(), '2026-10-01T04:00:00.000Z');
  assert.equal(result.period.to.toISOString(), '2026-11-01T04:00:00.000Z');
  const graphs = JSON.stringify({ activity: result.activity, education: result.education });
  assert.ok(!graphs.includes(data.student.user.id));
  assert.ok(!graphs.includes('@example.invalid'));
  assert.ok(!JSON.stringify(result).includes('passwordHash'));
});

test('filtros: excluye finalizaciones fuera de fechas y mantiene la cohorte, incluso con estado posterior', async () => {
  const result = await readAdminMetrics(
    fixture.database,
    { period: 'custom', from: '2026-10-06', to: '2026-10-31' },
    now,
  );
  assert.equal(result.education.lessonsStarted, 2);
  assert.equal(result.education.lessonsCompleted, 1);
  assert.equal(result.education.completionPercentage, 0);
  const later = await readAdminMetrics(
    fixture.database,
    { period: 'custom', from: '2026-11-02', to: '2026-11-02' },
    now,
  );
  assert.equal(later.education.lessonsCompleted, 1);
  assert.equal(later.education.completionPercentage, null);
});

test('HTTP: ADMIN, no-store, validación estricta de fechas y ausencia de acceso anónimo o USER', async () => {
  await request(fixture.app).get('/api/admin/summary').expect(401);
  await data.student.agent.get('/api/admin/summary').expect(403);
  const response = await data.admin.agent.get('/api/admin/summary').query(query).expect(200);
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.equal(response.body.data.education.completionPercentage, 33.33);
  for (const input of [
    { period: 'custom', from: '2026-02-30', to: '2026-03-01' },
    { period: 'custom', from: '2026-10-10', to: '2026-10-01' },
    { period: '1000' },
    { period: 'custom' },
    { period: '30', from: '2026-10-01' },
    { from: "' OR 1=1--" },
    { period: 'custom', from: '2024-01-01', to: '2026-01-01' },
  ])
    await data.admin.agent.get('/api/admin/summary').query(input).expect(400);
});

test('actualización: cambios persistidos recalculan indicadores y excluyen la cuenta eliminada sin perder reportes', async () => {
  await fixture.database.report.create({
    data: { authorId: data.deleted.id, description: 'Software retained report', category: 'OTHER' },
  });
  const before = await readAdminMetrics(fixture.database, query, now);
  await fixture.database.user.update({ where: { id: data.disabled.id }, data: { isActive: true } });
  await fixture.database.user.update({
    where: { id: data.student.user.id },
    data: { isDeleted: true, deletedAt: now },
  });
  const after = await readAdminMetrics(fixture.database, query, now);
  assert.equal(after.users, before.users - 1);
  assert.equal(after.disabledUsers, 0);
  assert.equal(after.activity.active7, 0);
  assert.equal(after.education.lessonsCompleted, 0);
  assert.equal(after.pendingReports, 1);
});
