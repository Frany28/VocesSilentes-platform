import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { authFixture, registered } from './fixture.js';
import {
  seedIntroduction,
  introductionLessonId,
  introductionModuleId,
} from '../../scripts/learning/seed-introduction.js';

const fixture = authFixture();

test('primera lectura local: contenido real publicado, sin ejercicios ni progreso y sin reemplazar datos', async () => {
  const student = await registered(fixture);
  await seedIntroduction(fixture.database);
  const auditCount = await fixture.database.auditLog.count();
  const read = (await student.agent.get('/api/learning').expect(200)).body.data;
  const module = read.modules.find((item) => item.id === introductionModuleId);
  assert.equal(module.title, 'Descubriendo la LSV y mis primeras señas');
  assert.equal(module.nextLesson.id, introductionLessonId);
  const [lesson] = module.lessons;
  assert.equal(lesson.title, '¿Qué es la Lengua de Señas Venezolana?');
  assert.ok(lesson.description.startsWith('Objetivo:'));
  assert.match(lesson.description, /LSV-INTRO-01/);
  assert.match(lesson.description, /todavía no cuenta con validación/);
  assert.match(lesson.description, /lenguas naturales completas/);
  assert.deepEqual(lesson.exercises, []);
  assert.equal(lesson.status, 'NOT_STARTED');
  await assert.rejects(seedIntroduction(fixture.database));
  assert.equal(await fixture.database.module.count(), 1);
  assert.equal(await fixture.database.lesson.count(), 1);
  assert.equal(await fixture.database.lessonProgress.count(), 0);
  assert.equal(await fixture.database.exerciseProgress.count(), 0);
  assert.equal(await fixture.database.auditLog.count(), auditCount);
  assert.equal(
    (await fixture.database.lesson.findUnique({ where: { id: lesson.id } })).referenceVideoPath,
    null,
  );
});

test('catálogo de lectura excluye lecciones y módulos borrador, y sigue exigiendo sesión USER', async () => {
  const student = await registered(fixture);
  const lessons = await fixture.database.module.create({
    data: {
      title: 'Otro módulo',
      description: 'Fixture aislado',
      order: 2,
      publicationStatus: 'PUBLISHED',
      lessons: { create: { title: 'Borrador privado', description: 'Texto privado', order: 1 } },
    },
    include: { lessons: true },
  });
  await request(fixture.app).get('/api/learning').expect(401);
  let read = (await student.agent.get('/api/learning').expect(200)).body.data;
  assert.deepEqual(read.modules.find((item) => item.id === lessons.id).lessons, []);
  // Cambios exclusivos de esta base WASM de pruebas para comprobar el filtrado del padre.
  await fixture.database.module.update({
    where: { id: introductionModuleId },
    data: { publicationStatus: 'DRAFT' },
  });
  read = (await student.agent.get('/api/learning').expect(200)).body.data;
  assert.ok(!read.modules.some((item) => item.id === introductionModuleId));
  assert.ok(
    !read.modules.flatMap((item) => item.lessons).some((item) => item.id === introductionLessonId),
  );
  await fixture.database.user.update({ where: { id: student.user.id }, data: { role: 'ADMIN' } });
  await student.agent.get('/api/learning').expect(403);
});
