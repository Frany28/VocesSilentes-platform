import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isolatedDatabase, rollbackScenario, rejectsSql } from './fixture.js';

const db = isolatedDatabase();

test('esquema privado: RLS activo y sin políticas públicas en todas las entidades', async () => {
  const tables = await db.query(`SELECT relname, relrowsecurity FROM pg_class
    WHERE relnamespace = 'vocessilentes'::regnamespace AND relkind = 'r'`);
  assert.equal(tables.rows.length, 11);
  assert.ok(tables.rows.every((table) => table.relrowsecurity));
  const policies = await db.query("SELECT * FROM pg_policies WHERE schemaname = 'vocessilentes'");
  assert.equal(policies.rows.length, 0);
});

test('roles Data API: sin permisos heredados sobre esquema ni tablas', () =>
  rollbackScenario(db, async () => {
    for (const role of ['anon', 'authenticated', 'service_role']) {
      const privileges = await db.query(
        `SELECT
      has_schema_privilege($1, 'vocessilentes', 'USAGE') AS usage,
      has_table_privilege($1, 'vocessilentes."User"', 'SELECT') AS users,
      has_table_privilege($1, 'vocessilentes."Session"', 'SELECT') AS sessions`,
        [role],
      );
      assert.deepEqual(privileges.rows[0], { usage: false, users: false, sessions: false });
      await db.exec(`SET LOCAL ROLE ${role}`);
      await rejectsSql(db, 'SELECT * FROM vocessilentes."User"', [], '42501');
      await rejectsSql(db, 'SELECT * FROM vocessilentes."Session"', [], '42501');
      await rejectsSql(db, 'SELECT * FROM vocessilentes."AuditLog"', [], '42501');
      await rejectsSql(db, 'SELECT * FROM vocessilentes."ReportEvidence"', [], '42501');
      await rejectsSql(db, 'UPDATE vocessilentes."AuditLog" SET "actorId" = NULL', [], '42501');
      await db.exec('RESET ROLE');
    }
  }));

test('instantes: timestamptz conserva el mismo instante al cambiar zona', async () => {
  const timestamps = await db.query(`SELECT table_name, column_name, data_type
    FROM information_schema.columns WHERE table_schema = 'vocessilentes'
    AND (column_name LIKE '%At' OR column_name = 'lockedUntil')`);
  assert.ok(timestamps.rows.length > 0);
  assert.ok(timestamps.rows.every((column) => column.data_type === 'timestamp with time zone'));
  const result = await db.query(`SELECT '2026-10-09 08:00:00-04'::timestamptz =
    '2026-10-09 12:00:00+00'::timestamptz AS same_instant`);
  assert.equal(result.rows[0].same_instant, true);
});
