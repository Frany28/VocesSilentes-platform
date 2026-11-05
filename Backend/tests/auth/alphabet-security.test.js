import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { authFixture, registered } from './fixture.js';
import { seedAlphabet } from '../../scripts/learning/seed-alphabet.js';
import {
  alphabetId,
  alphabetModuleId,
  readAlphabetSource,
} from '../../scripts/learning/alphabet-source.js';

const fixture = authFixture({ previewModuleId: alphabetModuleId });
const answer = (actor, id, optionId, extra = {}) =>
  actor.agent
    .post(`/api/learning/exercises/${id}/answer`)
    .set('X-CSRF-Token', actor.csrf)
    .send({ optionId, ...extra });

test('validación de cuerpo/opción, CSRF, sesión/rol y rechazo de progreso manual para cuestionarios', async () => {
  await seedAlphabet(fixture.database);
  const student = await registered(fixture);
  const textId = alphabetId('q-m1-l01-01');
  await answer(student, textId, 'desconocida').expect(400);
  await answer(student, textId, 'opt1', { userId: student.user.id, isCorrect: true }).expect(400);
  await student.agent
    .post(`/api/learning/exercises/${textId}/answer`)
    .send({ optionId: 'opt1' })
    .expect(403);
  await request(fixture.app)
    .post(`/api/learning/exercises/${textId}/answer`)
    .send({ optionId: 'opt1' })
    .expect(401);
  await student.agent
    .put(`/api/learning/exercises/${textId}/progress`)
    .set('X-CSRF-Token', student.csrf)
    .send({ status: 'COMPLETED' })
    .expect(409);
  assert.equal(
    await fixture.database.exerciseProgress.count({ where: { userId: student.user.id } }),
    0,
  );
  await fixture.database.user.update({ where: { id: student.user.id }, data: { role: 'ADMIN' } });
  await answer(student, textId, 'opt1').expect(403);
});

test('las 27 preguntas visuales bloquean respuestas sin filtrar explicación o letra objetivo', async () => {
  const student = await registered(fixture);
  const source = await readAlphabetSource();
  for (const question of source.exercises.filter((q) => q.type === 'MULTIPLE_CHOICE_IMAGE')) {
    const id = alphabetId(question.id);
    const response = await answer(student, id, question.correctOptionId).expect(409);
    assert.equal(response.body.error.code, 'PENDING_MATERIAL');
    assert.ok(!JSON.stringify(response.body).includes(question.explanationCorrect));
  }
  const id = alphabetId(source.exercises[0].id);
  await student.agent
    .put(`/api/learning/exercises/${id}/progress`)
    .set('X-CSRF-Token', student.csrf)
    .send({ status: 'COMPLETED' })
    .expect(409);
  assert.equal(
    await fixture.database.exerciseProgress.count({ where: { userId: student.user.id } }),
    0,
  );
});
