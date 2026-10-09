import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ids, isolatedDatabase, rollbackScenario, rejectsSql } from './fixture.js';

const db = isolatedDatabase();

test('lecciones: unicidad y estados con fechas coherentes, incluidos NULL', () =>
  rollbackScenario(db, async () => {
    const insert = 'INSERT INTO "LessonProgress" ("userId", "lessonId") VALUES ($1, $2)';
    await db.query(insert, [ids.user, ids.lesson]);
    await rejectsSql(db, insert, [ids.user, ids.lesson], '23505');
    await rejectsSql(db, insert, [ids.missing, ids.lesson], '23503');
    await rejectsSql(db, insert, [ids.admin, ids.missing], '23503');
    const update = 'UPDATE "LessonProgress" SET status = $1, "startedAt" = $2, "completedAt" = $3';
    const start = '2026-10-09T12:00:00Z';
    const finish = '2026-10-09T13:00:00Z';
    for (const values of [
      ['NOT_STARTED', start, null],
      ['IN_PROGRESS', null, null],
      ['IN_PROGRESS', start, finish],
      ['COMPLETED', null, finish],
      ['COMPLETED', start, null],
      ['COMPLETED', finish, start],
    ])
      await rejectsSql(db, update, values);
    await db.query(update, ['IN_PROGRESS', start, null]);
    assert.equal(
      (await db.query('SELECT status FROM "LessonProgress"')).rows[0].status,
      'IN_PROGRESS',
    );
    await db.query(update, ['COMPLETED', start, finish]);
    await rejectsSql(db, 'DELETE FROM "Lesson" WHERE id = $1', [ids.lesson], '23001');
  }));

test('ejercicios: persistencia por usuario, unicidad, FK y finalización', () =>
  rollbackScenario(db, async () => {
    const insert = 'INSERT INTO "ExerciseProgress" ("userId", "exerciseId") VALUES ($1, $2)';
    await db.query(insert, [ids.user, ids.exercise]);
    await rejectsSql(db, insert, [ids.user, ids.exercise], '23505');
    await rejectsSql(db, insert, [ids.missing, ids.exercise], '23503');
    await rejectsSql(db, insert, [ids.admin, ids.missing], '23503');
    const update =
      'UPDATE "ExerciseProgress" SET status = $1, "lastActivityAt" = $2, "completedAt" = $3';
    const start = '2026-10-09T12:00:00Z';
    const finish = '2026-10-09T13:00:00Z';
    for (const values of [
      ['NOT_STARTED', start, null],
      ['IN_PROGRESS', null, null],
      ['IN_PROGRESS', start, finish],
      ['COMPLETED', null, finish],
      ['COMPLETED', finish, null],
      ['COMPLETED', start, finish],
    ])
      await rejectsSql(db, update, values);
    await db.query(update, ['IN_PROGRESS', start, null]);
    const progress = (await db.query('SELECT status, "lastActivityAt" FROM "ExerciseProgress"'))
      .rows[0];
    assert.equal(progress.status, 'IN_PROGRESS');
    assert.equal(progress.lastActivityAt.toISOString(), start.replace('Z', '.000Z'));
    await db.query(update, ['COMPLETED', finish, finish]);
    await rejectsSql(db, 'DELETE FROM "Exercise" WHERE id = $1', [ids.exercise], '23001');
  }));
