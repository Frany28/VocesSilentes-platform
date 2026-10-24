import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { authFixture, registered } from './fixture.js';

const fixture = authFixture();
const save = (actor, kind, id, status, extra = {}) =>
  actor.agent
    .put(`/api/learning/${kind}/${id}/progress`)
    .set('X-CSRF-Token', actor.csrf)
    .send({ status, ...extra });

test('catálogo publicado, cinco avances propios, lectura tras recarga y auditoría sin duplicados', async () => {
  const student = await registered(fixture);
  const other = await registered(fixture);
  const lessons = [];
  for (let n = 0; n < 5; n += 1) {
    const module = await fixture.database.module.create({
      data: {
        title: `Académico ${n}`,
        description: 'Contenido de prueba',
        order: n,
        publicationStatus: 'PUBLISHED',
        lessons: {
          create: {
            title: `Lectura ${n}`,
            description: 'Texto de prueba',
            order: 0,
            publicationStatus: 'PUBLISHED',
            exercises: {
              create: {
                instructions: 'Actividad manual, sin cámara',
                order: 0,
                expectedSignKey: `fixture-${n}`,
              },
            },
          },
        },
      },
      include: { lessons: { include: { exercises: true } } },
    });
    lessons.push(module.lessons[0]);
  }
  const draft = await fixture.database.module.create({
    data: {
      title: 'Borrador privado',
      description: 'No publicar',
      order: 99,
    },
  });
  await request(fixture.app).get('/api/learning').expect(401);
  assert.equal((await student.agent.get('/api/learning').expect(200)).body.data.modules.length, 5);
  for (const lesson of lessons) {
    await save(student, 'lessons', lesson.id, 'IN_PROGRESS').expect(200);
    await save(student, 'lessons', lesson.id, 'COMPLETED').expect(200);
    await save(student, 'exercises', lesson.exercises[0].id, 'COMPLETED').expect(200);
  }
  const before = await fixture.database.auditLog.count();
  await save(student, 'lessons', lessons[0].id, 'IN_PROGRESS').expect(200);
  await save(student, 'exercises', lessons[0].exercises[0].id, 'COMPLETED').expect(200);
  assert.equal(await fixture.database.auditLog.count(), before);
  const read = (await student.agent.get('/api/learning').expect(200)).body.data;
  assert.ok(read.modules.every((module) => module.lessons[0].status === 'COMPLETED'));
  const separate = (await other.agent.get('/api/learning').expect(200)).body.data;
  assert.ok(separate.modules.every((module) => module.lessons[0].status === 'NOT_STARTED'));
  assert.equal(
    await fixture.database.lessonProgress.count({ where: { userId: student.user.id } }),
    5,
  );
  assert.equal(
    await fixture.database.exerciseProgress.count({ where: { userId: student.user.id } }),
    5,
  );
  await save(student, 'lessons', lessons[0].id, 'COMPLETED', { userId: other.user.id }).expect(400);
  await student.agent
    .put(`/api/learning/lessons/${lessons[0].id}/progress`)
    .send({ status: 'COMPLETED' })
    .expect(403);
  await save(student, 'lessons', draft.id, 'COMPLETED').expect(404);
  await fixture.database.user.update({ where: { id: other.user.id }, data: { role: 'ADMIN' } });
  await other.agent.get('/api/learning').expect(403);
});

test('avance educativo y bitácora revierten juntos ante fallo de persistencia', async () => {
  const student = await registered(fixture);
  const lesson = await fixture.database.lesson.findFirst();
  await fixture.db.exec(`ALTER TABLE vocessilentes."AuditLog"
    ADD CONSTRAINT academic_progress_failure CHECK ("entityType" <> 'LessonProgress') NOT VALID`);
  try {
    await save(student, 'lessons', lesson.id, 'IN_PROGRESS').expect(500);
    assert.equal(
      await fixture.database.lessonProgress.count({ where: { userId: student.user.id } }),
      0,
    );
  } finally {
    await fixture.db.exec(
      'ALTER TABLE vocessilentes."AuditLog" DROP CONSTRAINT academic_progress_failure',
    );
  }
});
