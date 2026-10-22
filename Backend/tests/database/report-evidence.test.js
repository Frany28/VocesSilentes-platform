import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ids, isolatedDatabase, rollbackScenario, rejectsSql } from './fixture.js';

const db = isolatedDatabase();
const insert = `INSERT INTO "ReportEvidence" (id, "reportId", "ownerId", path, "mimeType", size, digest)
  VALUES ($1, $2, $3, $4, $5, $6, $7)`;

test('ReportEvidence: una imagen, propietario del reporte y metadatos restringidos en SQL', () =>
  rollbackScenario(db, async () => {
    const report = (
      await db.query(
        `INSERT INTO "Report" ("authorId", description, category)
      VALUES ($1, 'Prueba', 'OTHER') RETURNING id`,
        [ids.user],
      )
    ).rows[0];
    const path = `${ids.missing}/${report.id}/${ids.exercise}`;
    const valid = [
      ids.exercise,
      report.id,
      ids.user,
      `${ids.user}/${report.id}/${ids.exercise}`,
      'image/png',
      100,
      'a'.repeat(64),
    ];
    await rejectsSql(
      db,
      insert,
      [ids.exercise, report.id, ids.missing, path, 'image/png', 100, 'a'.repeat(64)],
      '23503',
    );
    for (const [field, value] of [
      [3, 'https://signed.invalid/?token=never'],
      [4, 'image/svg+xml'],
      [4, 'image/gif'],
      [4, 'application/pdf'],
      [5, 5242881],
      [5, 0],
      [6, 'invalid'],
    ]) {
      const data = [...valid];
      data[field] = value;
      await rejectsSql(db, insert, data);
    }
    await db.query(insert, valid);
    await rejectsSql(db, insert, valid, '23505');
    const second = [...valid];
    second[0] = ids.module;
    second[3] = `${ids.user}/${report.id}/${ids.module}`;
    await rejectsSql(db, insert, second, '23505');
    await rejectsSql(db, 'UPDATE "ReportEvidence" SET bucket = $1', ['profile-photos']);
    await rejectsSql(db, 'UPDATE "ReportEvidence" SET state = $1', ['PUBLIC']);
    assert.equal((await db.query('SELECT state FROM "ReportEvidence"')).rows[0].state, 'PENDING');
  }));
