import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authFixture, registered } from './fixture.js';
import { installCurriculum } from '../../scripts/learning/install-curriculum.js';
import { alphabetId, readAlphabetSource } from '../../scripts/learning/alphabet-source.js';
import { curriculumPlan } from '../../src/modules/learning/curriculum-plan.js';

const fixture = authFixture();

test('carga curricular ordenada e idempotente conserva usuarios, IDs y ambos tipos de progreso', async () => {
  const actor = await registered(fixture);
  const legacy = await fixture.database.module.create({
    data: {
      id: '20000000-0000-4000-8000-000000000001',
      title: 'Práctica académica 1',
      order: 1,
      description:
        'Contenido sintético para probar formularios y persistencia; no es una lección LSV validada.',
      publicationStatus: 'PUBLISHED',
      lessons: {
        create: {
          title: 'Lectura académica 1',
          description: 'Fixture explícita',
          order: 1,
          publicationStatus: 'PUBLISHED',
          exercises: { create: { instructions: 'Fixture', expectedSignKey: 'fixture', order: 1 } },
        },
      },
    },
    include: { lessons: { include: { exercises: true } } },
  });
  for (const [kind, id] of [
    ['lessons', legacy.lessons[0].id],
    ['exercises', legacy.lessons[0].exercises[0].id],
  ])
    await actor.agent
      .put(`/api/learning/${kind}/${id}/progress`)
      .set('X-CSRF-Token', actor.csrf)
      .send({ status: 'COMPLETED' })
      .expect(200);
  const preserved = async () => ({
    users: await fixture.database.user.findMany({
      select: { id: true, role: true, updatedAt: true },
    }),
    lessons: await fixture.database.lessonProgress.findMany(),
    exercises: await fixture.database.exerciseProgress.findMany(),
  });
  const before = await preserved();
  await installCurriculum(fixture.database);
  assert.deepEqual(await preserved(), before);
  const rows = await fixture.database.module.findMany({ orderBy: { order: 'asc' } });
  assert.deepEqual(
    rows.slice(0, 8).map((item) => item.title),
    curriculumPlan.map((item) => item.title),
  );
  assert.equal(rows[8].id, legacy.id);
  assert.equal(rows[8].publicationStatus, 'DRAFT');
  const source = await readAlphabetSource();
  const lessons = await fixture.database.lesson.findMany({
    where: { moduleId: rows[0].id },
    orderBy: { order: 'asc' },
    include: { exercises: true },
  });
  assert.deepEqual(
    lessons.map((item) => item.id),
    source.lessons.map((item) => alphabetId(item.id)),
  );
  assert.equal(lessons.length, 7);
  assert.equal(lessons.flatMap((item) => item.exercises).length, 34);
  assert.ok(lessons.every((item) => item.publicationStatus === 'DRAFT'));
  await installCurriculum(fixture.database);
  assert.deepEqual(await fixture.database.module.findMany({ orderBy: { order: 'asc' } }), rows);
  assert.deepEqual(await preserved(), before);
  const catalog = (await actor.agent.get('/api/learning').expect(200)).body.data;
  assert.equal(catalog.source, 'api');
  assert.equal(catalog.modules.length, 8);
  assert.ok(
    catalog.modules.every((item) => item.access === 'upcoming' && item.lessons.length === 0),
  );
  await actor.agent
    .put(`/api/learning/lessons/${lessons[0].id}/progress`)
    .set('X-CSRF-Token', actor.csrf)
    .send({ status: 'COMPLETED' })
    .expect(404);
});

test('colisión curricular revierte el plan entero y no reemplaza filas', async () => {
  const target = await fixture.database.module.findUnique({
    where: { contentKey: curriculumPlan[1].key },
  });
  await fixture.database.module.update({ where: { id: target.id }, data: { contentKey: null } });
  await fixture.database.module.create({
    data: {
      title: 'Colisión de prueba',
      description: 'No sustituir',
      contentKey: curriculumPlan[1].key,
      order: 99,
    },
  });
  const before = await fixture.database.module.findMany({ orderBy: { order: 'asc' } });
  await assert.rejects(installCurriculum(fixture.database), /Colisión curricular/);
  assert.deepEqual(await fixture.database.module.findMany({ orderBy: { order: 'asc' } }), before);
});
