import { test } from 'node:test';
import assert from 'node:assert/strict';
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

test('evalúa las siete preguntas de texto en backend, persiste mejor avance propio y no cuenta intentos inventados', async () => {
  await seedAlphabet(fixture.database);
  const student = await registered(fixture);
  const other = await registered(fixture);
  const source = await readAlphabetSource();
  const questions = source.exercises.filter((q) => q.type === 'MULTIPLE_CHOICE_TEXT');
  const firstId = alphabetId(questions[0].id);
  const wrong = questions[0].options.find(
    (option) => option.id !== questions[0].correctOptionId,
  ).id;
  const incorrect = (await answer(student, firstId, wrong).expect(200)).body.data;
  assert.equal(incorrect.isCorrect, false);
  assert.equal(incorrect.progress.status, 'IN_PROGRESS');
  assert.equal(incorrect.feedback.explanation, questions[0].explanationIncorrect);
  for (const question of questions) {
    const result = (
      await answer(student, alphabetId(question.id), question.correctOptionId).expect(200)
    ).body.data;
    assert.equal(result.isCorrect, true);
    assert.equal(result.progress.status, 'COMPLETED');
    assert.equal(result.feedback.explanation, question.explanationCorrect);
    assert.equal(result.correctOptionId, undefined);
  }
  const count = await fixture.database.auditLog.count();
  await answer(student, firstId, questions[0].correctOptionId).expect(200);
  const repeatWrong = (await answer(student, firstId, wrong).expect(200)).body.data;
  assert.equal(repeatWrong.isCorrect, false);
  assert.equal(repeatWrong.progress.status, 'COMPLETED');
  assert.equal(await fixture.database.auditLog.count(), count);
  const read = (await student.agent.get('/api/learning').expect(200)).body.data;
  assert.equal(
    read.modules[0].lessons.flatMap((l) => l.exercises).filter((q) => q.status === 'COMPLETED')
      .length,
    7,
  );
  const separate = (await other.agent.get('/api/learning').expect(200)).body.data;
  assert.ok(
    separate.modules[0].lessons
      .flatMap((l) => l.exercises)
      .every((q) => q.status === 'NOT_STARTED'),
  );
  assert.equal(await fixture.database.lessonProgress.count(), 0);
});

test('una respuesta y su progreso revierten juntos ante fallo de auditoría', async () => {
  const student = await registered(fixture);
  await fixture.db.exec(`ALTER TABLE vocessilentes."AuditLog" ADD CONSTRAINT alphabet_audit_failure
    CHECK ("entityType" <> 'ExerciseProgress') NOT VALID`);
  try {
    await answer(student, alphabetId('q-m1-l01-01'), 'opt2').expect(500);
    assert.equal(
      await fixture.database.exerciseProgress.count({ where: { userId: student.user.id } }),
      0,
    );
  } finally {
    await fixture.db.exec(
      'ALTER TABLE vocessilentes."AuditLog" DROP CONSTRAINT alphabet_audit_failure',
    );
  }
});
