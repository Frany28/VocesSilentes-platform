import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { authFixture, registered, csrfToken } from './fixture.js';
import { installCurriculum } from '../../scripts/learning/install-curriculum.js';
import { alphabetModuleId } from '../../scripts/learning/alphabet-source.js';

const fixture = authFixture();

test('siete lecciones reales: inicio cero, 3/7=43%, aislamiento y persistencia tras nuevo login', async () => {
  const actor = await registered(fixture);
  const other = await registered(fixture);
  await installCurriculum(fixture.database);
  // Aprobación/publicación sintética exclusivamente en PostgreSQL WASM de este test.
  const lessons = await fixture.database.lesson.findMany({
    where: { moduleId: alphabetModuleId },
    orderBy: { order: 'asc' },
  });
  await fixture.database.module.update({
    where: { id: alphabetModuleId },
    data: { publicationStatus: 'PUBLISHED' },
  });
  for (const lesson of lessons)
    await fixture.database.lesson.update({
      where: { id: lesson.id },
      data: {
        publicationStatus: 'PUBLISHED',
        content: { ...lesson.content, reviewStatus: 'APPROVED_LSV' },
      },
    });
  const read = async (agent) => (await agent.get('/api/learning').expect(200)).body.data.modules[0];
  assert.ok((await read(actor.agent)).lessons.every((item) => item.status === 'NOT_STARTED'));
  for (const lesson of lessons.slice(0, 3))
    await actor.agent
      .put(`/api/learning/lessons/${lesson.id}/progress`)
      .set('X-CSRF-Token', actor.csrf)
      .send({ status: 'COMPLETED' })
      .expect(200);
  const module = await read(actor.agent);
  assert.equal(module.title, 'Abecedario LSV');
  assert.equal(module.order, 1);
  assert.equal(module.lessons.length, 7);
  assert.equal(
    Math.round((100 * module.lessons.filter((item) => item.status === 'COMPLETED').length) / 7),
    43,
  );
  assert.ok(
    module.lessons.flatMap((item) => item.exercises).every((item) => item.availability !== 'READY'),
  );
  assert.ok((await read(other.agent)).lessons.every((item) => item.status === 'NOT_STARTED'));
  await actor.agent.post('/api/auth/logout').set('X-CSRF-Token', actor.csrf).send({}).expect(204);
  const fresh = request.agent(fixture.app);
  const csrf = await csrfToken(fresh);
  await fresh
    .post('/api/auth/login')
    .set('X-CSRF-Token', csrf)
    .send({ email: actor.input.email, password: actor.input.password })
    .expect(200);
  assert.deepEqual(await read(fresh), module);
  // Un borrador adicional nunca entra en el denominador ni admite avance.
  const draft = await fixture.database.lesson.create({
    data: {
      moduleId: alphabetModuleId,
      title: 'Borrador adicional',
      description: 'No contar',
      order: 8,
    },
  });
  assert.equal((await read(fresh)).lessons.length, 7);
  await other.agent
    .put(`/api/learning/lessons/${draft.id}/progress`)
    .set('X-CSRF-Token', other.csrf)
    .send({ status: 'COMPLETED' })
    .expect(404);
});
