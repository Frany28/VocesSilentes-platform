import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authFixture, registered } from './fixture.js';
import { seedAlphabet } from '../../scripts/learning/seed-alphabet.js';
import { alphabetModuleId } from '../../scripts/learning/alphabet-source.js';
import { createLearningService } from '../../src/modules/learning/learning.service.js';

const fixture = authFixture({ previewModuleId: alphabetModuleId });

test('semilla idempotente conserva datos previos: 7 lecciones, 27 tarjetas y 34 preguntas DRAFT', async () => {
  const student = await registered(fixture);
  const original = await fixture.database.module.create({
    data: {
      title: 'Módulo anterior',
      description: 'Conservar sin cambios',
      order: 1,
    },
  });
  const before = await fixture.database.auditLog.count();
  assert.equal((await seedAlphabet(fixture.database)).created, true);
  assert.equal((await seedAlphabet(fixture.database)).created, false);
  assert.deepEqual(
    await fixture.database.module.findUnique({ where: { id: original.id } }),
    original,
  );
  assert.equal(await fixture.database.auditLog.count(), before);
  assert.equal(await fixture.database.lessonProgress.count(), 0);
  const catalog = (await student.agent.get('/api/learning').expect(200)).body.data;
  assert.equal(catalog.modules.length, 1);
  const module = catalog.modules[0];
  assert.equal(module.preview, true);
  assert.equal(module.publicationStatus, 'DRAFT');
  assert.equal(module.lessons.length, 7);
  assert.ok(module.lessons.every((lesson) => lesson.publicationStatus === 'DRAFT'));
  const cards = module.lessons.flatMap((lesson) => lesson.content.letterCards);
  assert.equal(cards.length, 27);
  assert.ok(cards.some((card) => card.letter === 'Ñ'));
  assert.ok(cards.every((card) => card.image === null && card.video === null));
  const questions = module.lessons.flatMap((lesson) => lesson.exercises);
  assert.equal(questions.length, 34);
  assert.equal(questions.filter((q) => q.availability === 'READY').length, 7);
  assert.equal(questions.filter((q) => q.availability === 'PENDING_MATERIAL').length, 27);
  assert.ok(
    questions
      .filter((q) => q.availability === 'PENDING_MATERIAL')
      .every((q) => q.options.length === 0),
  );
  const response = JSON.stringify(catalog);
  for (const key of [
    'correctOptionId',
    'explanationCorrect',
    'explanationIncorrect',
    'expectedSignKey',
    'mediaRef',
    'definition',
  ])
    assert.ok(!response.includes(`"${key}"`), key);
  const normal = createLearningService(fixture.database);
  assert.deepEqual((await normal.snapshot(student.user.id)).modules, []);
  await assert.rejects(normal.answer(student.user.id, questions[0].id, 'opt1'), { status: 404 });
});

test('una carga parcial o colisión no reemplaza filas existentes', async () => {
  await fixture.database.module.update({
    where: { id: alphabetModuleId },
    data: { contentKey: null },
  });
  const before = await fixture.database.module.findUnique({ where: { id: alphabetModuleId } });
  await assert.rejects(seedAlphabet(fixture.database), /Carga previa incompatible/);
  assert.deepEqual(
    await fixture.database.module.findUnique({ where: { id: alphabetModuleId } }),
    before,
  );
  assert.equal(await fixture.database.lesson.count(), 7);
  assert.equal(await fixture.database.exercise.count(), 34);
});
