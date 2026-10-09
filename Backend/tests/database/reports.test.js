import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ids, isolatedDatabase, rollbackScenario, rejectsSql } from './fixture.js';

const db = isolatedDatabase();
const insert = `INSERT INTO "Report" ("authorId", description, category, "moduleId", "lessonId", "exerciseId")
  VALUES ($1, 'Fixture', 'CONTENT', $2, $3, $4) RETURNING id`;

test('reportes: contexto único opcional y referencias existentes', () =>
  rollbackScenario(db, async () => {
    for (const context of [
      [null, null, null],
      [ids.module, null, null],
      [null, ids.lesson, null],
      [null, null, ids.exercise],
    ]) {
      await db.query(insert, [ids.user, ...context]);
    }
    for (const context of [
      [ids.module, ids.lesson, null],
      [ids.module, null, ids.exercise],
      [null, ids.lesson, ids.exercise],
    ]) {
      await rejectsSql(db, insert, [ids.user, ...context]);
    }
    for (const context of [
      [ids.missing, null, null],
      [null, ids.missing, null],
      [null, null, ids.missing],
    ]) {
      await rejectsSql(db, insert, [ids.user, ...context], '23503');
    }
    await rejectsSql(db, insert, [ids.missing, null, null, null], '23503');
    await rejectsSql(db, 'DELETE FROM "Exercise" WHERE id = $1', [ids.exercise], '23001');
  }));

test('reportes: resolución atómica, reapertura y contenido sin cambios', () =>
  rollbackScenario(db, async () => {
    const report = (await db.query(insert, [ids.user, null, null, ids.exercise])).rows[0];
    const update = `UPDATE "Report" SET status = $1, "resolvedById" = $2, "resolvedAt" = $3 WHERE id = $4`;
    const future = '2099-10-09T12:00:00Z';
    for (const values of [
      ['PENDING', ids.admin, null],
      ['PENDING', null, future],
      ['RESOLVED', null, future],
      ['RESOLVED', ids.admin, null],
      ['RESOLVED', ids.admin, '2000-01-01T00:00:00Z'],
    ])
      await rejectsSql(db, update, [...values, report.id]);
    await rejectsSql(db, update, ['RESOLVED', ids.missing, future, report.id], '23503');
    await db.query(update, ['RESOLVED', ids.admin, future, report.id]);
    await rejectsSql(db, 'DELETE FROM "User" WHERE id = $1', [ids.admin], '23001');
    assert.equal(
      (await db.query('SELECT instructions FROM "Exercise" WHERE id = $1', [ids.exercise])).rows[0]
        .instructions,
      'Fixture',
    );
    await rejectsSql(db, 'UPDATE "Report" SET status = $1 WHERE id = $2', ['PENDING', report.id]);
    await db.query(update, ['PENDING', null, null, report.id]);
    assert.equal(
      (await db.query('SELECT status FROM "Report" WHERE id = $1', [report.id])).rows[0].status,
      'PENDING',
    );
  }));
