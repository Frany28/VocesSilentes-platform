import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authFixture, registered } from './fixture.js';
import { installCurriculum } from '../../scripts/learning/install-curriculum.js';

const fixture = authFixture();

test('el catálogo retira Pronombres y Verbos básicos existentes sin borrar sus registros', async () => {
  const actor = await registered(fixture);
  await fixture.database.module.createMany({
    data: [
      { title: 'Pronombres', contentKey: 'lsv-06-pronombres', order: 6 },
      { title: 'Verbos básicos', contentKey: 'lsv-08-verbos', order: 8 },
    ].map((module) => ({ ...module, description: 'Contenido en preparación.' })),
  });
  const before = await fixture.database.module.findMany({ orderBy: { order: 'asc' } });
  const readCatalog = async () =>
    (await actor.agent.get('/api/learning').expect(200)).body.data.modules;
  assert.deepEqual(await readCatalog(), []);
  assert.deepEqual(await fixture.database.module.findMany({ orderBy: { order: 'asc' } }), before);
  await installCurriculum(fixture.database);
  const catalog = await readCatalog();
  assert.deepEqual(
    catalog.map((module) => module.title),
    ['Abecedario LSV', 'Números', 'Colores', 'Cortesía y saludos', 'Familia', 'Emociones'],
  );
  assert.deepEqual(
    catalog.map((module) => module.order),
    [1, 2, 3, 4, 5, 6],
  );
  for (const module of before) {
    const preserved = await fixture.database.module.findUnique({ where: { id: module.id } });
    assert.equal(preserved.contentKey, module.contentKey);
    assert.equal(preserved.title, module.title);
    assert.equal(preserved.publicationStatus, 'DRAFT');
  }
});
