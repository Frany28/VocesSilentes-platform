import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authFixture, registered } from './fixture.js';
import { readAdminMetrics } from '../../src/modules/admin/metrics.service.js';

const fixture = authFixture();
test('base vacía: ceros verificables, porcentaje no disponible y serie completa sin cifras simuladas', async () => {
  await fixture.database.$executeRaw`SET TIME ZONE 'UTC'`;
  const data = await readAdminMetrics(fixture.database);
  assert.equal(data.users, 0);
  assert.equal(data.activity.active7, 0);
  assert.equal(data.activity.active30, 0);
  assert.equal(data.activity.daily.length, 30);
  assert.ok(data.activity.daily.every((item) => item.users === 0));
  assert.deepEqual(data.catalog, {
    modulesPublished: 0,
    lessonsPublished: 0,
    exercisesAvailable: 0,
  });
  assert.equal(data.education.lessonsCompleted, 0);
  assert.equal(data.education.completionPercentage, null);
  assert.match(data.education.completionUnavailableReason, /iniciadas/);
  assert.deepEqual(data.education.byModule, []);
});

test('cambios reales: completar una lectura por HTTP actualiza la métrica sin guardar estadísticas duplicadas', async () => {
  const student = await registered(fixture);
  const module = await fixture.database.module.create({
    data: {
      title: 'Software published fixture',
      description: 'Test only',
      order: 0,
      publicationStatus: 'PUBLISHED',
    },
  });
  const lesson = await fixture.database.lesson.create({
    data: {
      moduleId: module.id,
      title: 'Software lesson',
      description: 'Test only',
      order: 0,
      publicationStatus: 'PUBLISHED',
    },
  });
  const before = await readAdminMetrics(fixture.database);
  assert.equal(before.education.lessonsCompleted, 0);
  await student.agent
    .put(`/api/learning/lessons/${lesson.id}/progress`)
    .set('X-CSRF-Token', student.csrf)
    .send({ status: 'COMPLETED' })
    .expect(200);
  const after = await readAdminMetrics(fixture.database);
  assert.equal(after.education.lessonsCompleted, 1);
  assert.equal(after.education.lessonsStarted, 1);
  assert.equal(after.education.completionPercentage, 100);
  assert.equal(after.education.byModule[0].completed, 1);
});
