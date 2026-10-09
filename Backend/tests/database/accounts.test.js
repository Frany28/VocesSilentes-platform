import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ids, isolatedDatabase, rollbackScenario, rejectsSql } from './fixture.js';

const db = isolatedDatabase();
const update = (field) => `UPDATE "User" SET "${field}" = $1 WHERE id = $2`;

test('cuentas: normalización SQL, únicos y contraseña local obligatoria', () =>
  rollbackScenario(db, async () => {
    for (const [field, value] of [
      ['email', 'USER@example.invalid'],
      ['email', ' user@example.invalid '],
      ['username', 'User_test'],
      ['username', 'user test'],
      ['firstName', ' '],
      ['passwordHash', 'plaintext'],
      ['failedLoginAttempts', -1],
    ])
      await rejectsSql(db, update(field), [value, ids.user]);
    for (const [field, value] of [
      ['email', 'admin@example.invalid'],
      ['username', 'admin_test'],
    ]) {
      await rejectsSql(db, update(field), [value, ids.user], '23505');
    }
    await rejectsSql(db, update('passwordHash'), [null, ids.user], '23502');
    await rejectsSql(db, update('role'), ['OWNER', ids.user], '22P02');
  }));

test('identidades: proveedor + identificador únicos y FK de usuario', () =>
  rollbackScenario(db, async () => {
    const insert =
      'INSERT INTO "ExternalIdentity" ("userId", provider, "providerUserId") VALUES ($1, $2, $3)';
    await db.query(insert, [ids.user, 'GOOGLE', 'subject-1']);
    await rejectsSql(db, insert, [ids.admin, 'GOOGLE', 'subject-1'], '23505');
    await db.query(insert, [ids.user, 'MICROSOFT', 'subject-1']);
    await rejectsSql(db, insert, [ids.missing, 'GOOGLE', 'subject-2'], '23503');
    await rejectsSql(db, insert, [ids.user, 'GOOGLE', ' ']);
  }));

test('sesiones: hash único, fechas, FK y ausencia de token original', () =>
  rollbackScenario(db, async () => {
    const insert = `INSERT INTO "Session" ("userId", "tokenHash", "createdAt", "expiresAt", "revokedAt")
    VALUES ($1, $2, $3, $4, $5)`;
    const start = '2026-10-09T12:00:00Z';
    const end = '2026-10-10T12:00:00Z';
    await db.query(insert, [ids.user, 'a'.repeat(64), start, end, null]);
    await rejectsSql(db, insert, [ids.admin, 'a'.repeat(64), start, end, null], '23505');
    await rejectsSql(db, insert, [ids.user, 'raw-token', start, end, null]);
    await rejectsSql(db, insert, [ids.user, 'b'.repeat(64), start, start, null]);
    await rejectsSql(db, insert, [ids.user, 'b'.repeat(64), start, end, '2026-10-08T12:00:00Z']);
    await rejectsSql(db, insert, [ids.missing, 'b'.repeat(64), start, end, null], '23503');
    const columns = await db.query(`SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'vocessilentes' AND table_name = 'Session'`);
    assert.equal(
      columns.rows.some((column) => column.column_name === 'token'),
      false,
    );
  }));

test('cuentas: desactivación, bloqueo y eliminación lógica conservan relaciones', () =>
  rollbackScenario(db, async () => {
    await db.query('INSERT INTO "LessonProgress" ("userId", "lessonId") VALUES ($1, $2)', [
      ids.user,
      ids.lesson,
    ]);
    await db.query(
      `INSERT INTO "Report" ("authorId", description, category)
    VALUES ($1, 'Fixture', 'OTHER')`,
      [ids.user],
    );
    await rejectsSql(db, update('isDeleted'), [true, ids.user]);
    await rejectsSql(db, update('deletedAt'), ['2026-10-10T00:00:00Z', ids.user]);
    await db.query(
      `UPDATE "User" SET "isActive" = false, "lockedUntil" = now() + interval '1 hour',
    "isDeleted" = true, "deletedAt" = now() WHERE id = $1`,
      [ids.user],
    );
    const user = (await db.query('SELECT * FROM "User" WHERE id = $1', [ids.user])).rows[0];
    assert.equal(user.isDeleted, true);
    assert.equal(user.isActive, false);
    assert.ok(user.lockedUntil);
    for (const table of ['LessonProgress', 'Report']) {
      assert.equal(
        (await db.query(`SELECT count(*)::int AS total FROM "${table}"`)).rows[0].total,
        1,
      );
    }
    await rejectsSql(db, 'DELETE FROM "User" WHERE id = $1', [ids.user], '23001');
  }));
