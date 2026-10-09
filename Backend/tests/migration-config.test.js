import { test } from 'node:test';
import assert from 'node:assert/strict';
import { migrationDatasource } from '../scripts/migration-config.js';

test('migraciones: sin fallback Transaction y esquema privado', () => {
  assert.deepEqual(migrationDatasource({ DATABASE_URL: 'postgresql://localhost:6543/runtime' }), {
    url: '',
    shadowDatabaseUrl: undefined,
  });
  const result = migrationDatasource({ DIRECT_URL: 'postgresql://localhost:5432/development' });
  assert.equal(new URL(result.url).searchParams.get('schema'), 'vocessilentes');
});

test('migraciones: errores redactados y conexiones Transaction rechazadas', () => {
  for (const value of [
    'invalid-secret',
    'postgresql://localhost:6543/test',
    'postgresql://localhost/test?pgbouncer=true',
  ]) {
    assert.throws(
      () => migrationDatasource({ DIRECT_URL: value }),
      (error) => !error.message.includes(value),
    );
  }
});

test('shadow: misma base rechazada aunque cambien esquema, usuario o modo Supabase', () => {
  for (const [direct, shadow] of [
    ['postgresql://localhost/db?schema=one', 'postgresql://127.0.0.1/db?schema=two'],
    [
      'postgresql://user.project@region.pooler.supabase.com:5432/postgres',
      'postgresql://db.project.supabase.co/postgres',
    ],
  ]) {
    assert.throws(
      () => migrationDatasource({ DIRECT_URL: direct, SHADOW_DATABASE_URL: shadow }),
      /independiente/,
    );
  }
  assert.ok(
    migrationDatasource({
      DIRECT_URL: 'postgresql://localhost/development',
      SHADOW_DATABASE_URL: 'postgresql://localhost/shadow',
    }).shadowDatabaseUrl,
  );
});
