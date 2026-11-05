import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isolatedDatabase, rollbackScenario, rejectsSql, ids } from './fixture.js';

const db = isolatedDatabase();

test('migración aditiva conserva ejercicios manuales y exige objetos para contenido y definición privada', () =>
  rollbackScenario(db, async () => {
    const before = (await db.query('SELECT * FROM "Exercise" WHERE id = $1', [ids.exercise]))
      .rows[0];
    assert.equal(before.type, 'SIGN_PRACTICE');
    assert.equal(before.definition, null);
    await rejectsSql(db, 'UPDATE "Exercise" SET type = \'MULTIPLE_CHOICE_TEXT\' WHERE id = $1', [
      ids.exercise,
    ]);
    await rejectsSql(db, 'UPDATE "Exercise" SET definition = \'{}\'::jsonb WHERE id = $1', [
      ids.exercise,
    ]);
    await rejectsSql(db, 'UPDATE "Lesson" SET content = \'[]\'::jsonb WHERE id = $1', [ids.lesson]);
    await db.query(
      "UPDATE \"Exercise\" SET type = 'MULTIPLE_CHOICE_TEXT', definition = '{}'::jsonb WHERE id = $1",
      [ids.exercise],
    );
    const after = (await db.query('SELECT * FROM "Exercise" WHERE id = $1', [ids.exercise]))
      .rows[0];
    assert.equal(after.type, 'MULTIPLE_CHOICE_TEXT');
    assert.deepEqual(after.definition, {});
    await db.query('UPDATE "Module" SET "contentKey" = \'source-key\' WHERE id = $1', [ids.module]);
    await rejectsSql(db, 'UPDATE "Module" SET "contentKey" = \'   \' WHERE id = $1', [ids.module]);
  }));
