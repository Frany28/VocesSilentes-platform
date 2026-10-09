import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { createDatabase } from '../../src/lib/database.js';

test('pool Vercel: consulta PostgreSQL aislado y desconecta el pool externo', async () => {
  const db = new PGlite();
  const server = new PGLiteSocketServer({ db, host: '127.0.0.1', port: 0, inspect: false });
  let database;
  try {
    await server.start();
    const url = `postgresql://postgres@${server.getServerConn()}/postgres?sslmode=disable`;
    database = await createDatabase(url, { vercel: true });
    await database.$connect();
    assert.deepEqual(await database.$queryRaw`SELECT 1 AS value`, [{ value: 1 }]);
  } finally {
    await database?.$disconnect();
    await server.stop();
    await db.close();
  }
});
