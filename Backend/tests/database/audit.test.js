import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isolatedDatabase, rollbackScenario, rejectsSql, ids } from './fixture.js';

const db = isolatedDatabase();

test('bitácora: FK actor, tipo de entidad, enum y conservación al eliminar lógicamente', () =>
  rollbackScenario(db, async () => {
    const insert = `INSERT INTO "AuditLog" ("actorId", operation, "entityType", "entityId")
      VALUES ($1, $2::"AuditOperation", $3, $4)`;
    await rejectsSql(db, insert, [ids.missing, 'USER_CREATED', 'User', ids.user], '23503');
    await rejectsSql(db, insert, [ids.admin, 'USER_CREATED', 'Session', ids.user]);
    await rejectsSql(db, insert, [ids.admin, 'ARBITRARY', 'User', ids.user], '22P02');
    await db.query(insert, [ids.admin, 'USER_CREATED', 'User', ids.user]);
    await db.query(insert, [null, 'USER_UPDATED', 'User', ids.missing]);
    await db.query('UPDATE "User" SET "isDeleted" = true, "deletedAt" = now() WHERE id = $1', [
      ids.admin,
    ]);
    const rows = (await db.query('SELECT * FROM "AuditLog"')).rows;
    assert.equal(rows.length, 2);
    assert.ok(rows.some((row) => row.actorId === ids.admin));
    await rejectsSql(db, 'DELETE FROM "User" WHERE id = $1', [ids.admin], '23001');
  }));
