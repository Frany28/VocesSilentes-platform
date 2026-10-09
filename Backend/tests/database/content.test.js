import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ids, isolatedDatabase, rollbackScenario, rejectsSql } from './fixture.js';

const db = isolatedDatabase();

test('contenido: orden no negativo y único en su ámbito', () =>
  rollbackScenario(db, async () => {
    await rejectsSql(
      db,
      'INSERT INTO "Module" (title, description, "order") VALUES ($1::text, $1::text, $2)',
      ['Test', 0],
      '23505',
    );
    await rejectsSql(
      db,
      'INSERT INTO "Module" (title, description, "order") VALUES ($1::text, $1::text, $2)',
      ['Test', -1],
    );
    await rejectsSql(
      db,
      `INSERT INTO "Lesson" ("moduleId", title, description, "order")
    VALUES ($1, 'Test', 'Test', 0)`,
      [ids.module],
      '23505',
    );
    await rejectsSql(
      db,
      `INSERT INTO "Exercise" ("lessonId", instructions, "order", "expectedSignKey")
    VALUES ($1, 'Test', 0, 'test-sign')`,
      [ids.lesson],
      '23505',
    );
    for (const table of ['Lesson', 'Exercise']) {
      await rejectsSql(db, `UPDATE "${table}" SET "order" = -1`, []);
    }
    const otherModule = await db.query(
      'INSERT INTO "Module" (title, description, "order") VALUES ($1::text, $1::text, 1) RETURNING id',
      ['Other fixture'],
    );
    await db.query(
      `INSERT INTO "Lesson" ("moduleId", title, description, "order")
    VALUES ($1, 'Test', 'Test', 0)`,
      [otherModule.rows[0].id],
    );
  }));

test('contenido: FK, eliminación restrictiva y tipos del ejercicio demostrativo', () =>
  rollbackScenario(db, async () => {
    await rejectsSql(db, 'UPDATE "Lesson" SET "moduleId" = $1', [ids.missing], '23503');
    await rejectsSql(db, 'UPDATE "Exercise" SET "lessonId" = $1', [ids.missing], '23503');
    await rejectsSql(db, 'DELETE FROM "Module" WHERE id = $1', [ids.module], '23001');
    await rejectsSql(db, 'DELETE FROM "Lesson" WHERE id = $1', [ids.lesson], '23001');
    await rejectsSql(db, 'UPDATE "Exercise" SET "expectedSignKey" = $1', [' ']);
    await rejectsSql(db, 'UPDATE "Exercise" SET "expectedSignKey" = NULL', [], '23502');
    await rejectsSql(db, 'UPDATE "Exercise" SET type = $1', ['MULTIPLE_CHOICE'], '22P02');
    await rejectsSql(db, 'UPDATE "Lesson" SET "publicationStatus" = $1', ['HIDDEN'], '22P02');
    const result = await db.query(
      `SELECT e.type, e."expectedSignKey", l."publicationStatus"
    FROM "Exercise" e JOIN "Lesson" l ON l.id = e."lessonId" WHERE e.id = $1`,
      [ids.exercise],
    );
    assert.deepEqual(result.rows[0], {
      type: 'SIGN_PRACTICE',
      expectedSignKey: 'test-sign',
      publicationStatus: 'DRAFT',
    });
  }));
