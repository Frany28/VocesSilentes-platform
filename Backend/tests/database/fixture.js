import { readFile, readdir } from 'node:fs/promises';
import { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';

export const ids = Object.freeze({
  user: '00000000-0000-4000-8000-000000000001',
  admin: '00000000-0000-4000-8000-000000000002',
  module: '00000000-0000-4000-8000-000000000003',
  lesson: '00000000-0000-4000-8000-000000000004',
  exercise: '00000000-0000-4000-8000-000000000005',
  missing: '00000000-0000-4000-8000-000000000099',
});

/**
 * Registra una base PostgreSQL WASM efímera por archivo, sin URLs ni acceso a Supabase.
 * Aplica el SQL versionado y crea fixtures sintéticos exclusivamente en memoria.
 * @returns {PGlite} Motor aislado; los hooks lo inicializan y cierran.
 */
export function isolatedDatabase() {
  const db = new PGlite();
  before(async () => {
    await db.exec(`
      CREATE ROLE anon;
      CREATE ROLE authenticated;
      CREATE ROLE service_role;
      CREATE SCHEMA vocessilentes;
      GRANT ALL ON SCHEMA vocessilentes TO anon, authenticated, service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA vocessilentes
        GRANT ALL ON TABLES TO anon, authenticated, service_role;
    `);
    const directory = new URL('../../prisma/migrations/', import.meta.url);
    const migrations = (await readdir(directory, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    for (const migration of migrations) {
      await db.exec(await readFile(new URL(`${migration}/migration.sql`, directory), 'utf8'));
    }
    await db.exec('SET search_path = vocessilentes, pg_catalog');
    await db.query(
      `
      INSERT INTO "User" (id, "firstName", email, username, "passwordHash", role)
      VALUES ($1, 'Test', 'user@example.invalid', 'user_test', '$argon2id$test-only', 'USER'),
        ($2, 'Test admin', 'admin@example.invalid', 'admin_test', '$argon2id$test-only', 'ADMIN')
    `,
      [ids.user, ids.admin],
    );
    await db.query(
      'INSERT INTO "Module" (id, title, description, "order") VALUES ($1, $2::text, $2::text, 0)',
      [ids.module, 'Isolated fixture'],
    );
    await db.query(
      `INSERT INTO "Lesson" (id, "moduleId", title, description, "order")
      VALUES ($1, $2, 'Fixture', 'Fixture', 0)`,
      [ids.lesson, ids.module],
    );
    await db.query(
      `INSERT INTO "Exercise" (id, "lessonId", instructions, "order", "expectedSignKey")
      VALUES ($1, $2, 'Fixture', 0, 'test-sign')`,
      [ids.exercise, ids.lesson],
    );
  });
  after(() => db.close());
  return db;
}

/**
 * Ejecuta un escenario aislado y revierte solo sus filas efímeras, incluso ante error.
 * @param {PGlite} db Base en memoria creada por isolatedDatabase.
 * @param {function(): Promise<void>} run Escenario de integración.
 * @returns {Promise<void>} Finaliza tras rollback.
 */
export async function rollbackScenario(db, run) {
  await db.exec('BEGIN');
  try {
    await run();
  } finally {
    await db.exec('ROLLBACK');
  }
}

/**
 * Verifica el SQLSTATE de una escritura rechazada y recupera la transacción.
 * @param {PGlite} db Base en memoria con transacción activa.
 * @param {string} sql Escritura a rechazar.
 * @param {unknown[]} params Parámetros del escenario, sin credenciales reales.
 * @param {string} code SQLSTATE esperado.
 * @returns {Promise<void>} Aserción completada.
 */
export async function rejectsSql(db, sql, params, code = '23514') {
  await db.exec('SAVEPOINT rejected_write');
  try {
    await assert.rejects(db.query(sql, params), (error) => {
      assert.equal(error.code, code);
      return true;
    });
  } finally {
    await db.exec('ROLLBACK TO SAVEPOINT rejected_write');
  }
}
