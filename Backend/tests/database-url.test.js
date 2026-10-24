import { test } from 'node:test';
import assert from 'node:assert/strict';
import { secureDatabaseUrl } from '../src/config/database-url.js';

test('Supabase exige certificado verificado aunque la URL solicite desactivar SSL', () => {
  for (const host of ['aws-0-us-east-1.pooler.supabase.com', 'db.example.supabase.co']) {
    const output = new URL(
      secureDatabaseUrl(`postgresql://fixture@${host}:5432/postgres?sslmode=disable&schema=app`),
    );
    assert.equal(output.searchParams.get('sslmode'), 'verify-full');
    assert.equal(output.searchParams.get('schema'), 'app');
  }
  const local = new URL(
    secureDatabaseUrl('postgresql://fixture@localhost:5432/test?sslmode=disable'),
  );
  assert.equal(local.searchParams.get('sslmode'), 'disable');
});
