import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import argon2 from 'argon2';

test('SQL académico: snapshot exacto, seed aislado, cinco filas y credenciales inutilizables', async () => {
  const db = new PGlite();
  try {
    const directory = new URL('../../prisma/migrations/', import.meta.url);
    const schema = await readFile(
      new URL('../../../docs/module-ii/sql/01_schema.sql', import.meta.url),
      'utf8',
    );
    for (const name of (await readdir(directory)).filter((name) => /^\d/.test(name)).sort()) {
      assert.ok(
        schema.includes(await readFile(new URL(`${name}/migration.sql`, directory), 'utf8')),
      );
    }
    await db.exec(schema);
    const seed = await readFile(
      new URL('../../../docs/module-ii/sql/02_seed.sql', import.meta.url),
      'utf8',
    );
    const results = await db.exec(seed);
    const counts = results.at(-1).rows;
    assert.equal(counts.length, 10);
    for (const { entity, records } of counts) {
      assert.equal(Number(records), entity === 'ExternalIdentity' ? 0 : 5, entity);
    }
    const { rows } = await db.query('SELECT "passwordHash", "isActive" FROM vocessilentes."User"');
    for (const row of rows) {
      assert.equal(row.isActive, false);
      assert.equal(await argon2.verify(row.passwordHash, 'known-default-password'), false);
      assert.equal(
        argon2.needsRehash(row.passwordHash, { memoryCost: 19456, timeCost: 2, parallelism: 1 }),
        false,
      );
    }
    const sessions = await db.query(`SELECT count(*) FROM vocessilentes."Session"
      WHERE "revokedAt" IS NULL OR "expiresAt" > CURRENT_TIMESTAMP`);
    assert.equal(Number(sessions.rows[0].count), 0);
    await assert.rejects(db.exec(seed), /Seed requires empty application tables/u);
    await db.exec('ROLLBACK');
    assert.equal(
      Number((await db.query('SELECT count(*) FROM vocessilentes."User"')).rows[0].count),
      5,
    );
  } finally {
    await db.close();
  }
});
