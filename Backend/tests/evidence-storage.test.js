import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEvidenceStorage } from '../src/modules/reports/evidence-storage.js';
import { parseStorageEnv } from '../src/config/storage-env.js';

const path =
  '00000000-0000-4000-8000-000000000001/00000000-0000-4000-8000-000000000002/00000000-0000-4000-8000-000000000003';
const config = { url: 'https://storage.example.invalid', key: 'private-test-key-not-a-credential' };

test('Storage: contrato de carga sin upsert, borrado exacto y URL firmada de 120 segundos', async () => {
  const calls = [];
  const storage = createEvidenceStorage(config, async (url, options) => {
    calls.push({ url, ...options });
    return new Response(
      JSON.stringify({ signedURL: `/object/sign/report-evidence/${path}?token=test` }),
    );
  });
  await storage.upload(path, { bytes: Buffer.from('test'), mimeType: 'image/png' });
  assert.equal(calls[0].method, 'POST');
  assert.equal(calls[0].headers['x-upsert'], 'false');
  assert.equal(calls[0].redirect, 'error');
  const access = await storage.sign(path);
  assert.equal(JSON.parse(calls[1].body).expiresIn, 120);
  assert.ok(Date.parse(access.expiresAt) > Date.now() + 110000);
  assert.ok(access.src.startsWith(`${config.url}/storage/v1/object/sign/report-evidence/`));
  await storage.remove(path);
  assert.deepEqual(JSON.parse(calls[2].body), { prefixes: [path] });
  await assert.rejects(storage.remove('../profile-image'), /Invalid internal evidence path/);
});

test('Storage: oculta respuestas internas y credenciales; configuración parcial rechazada', async () => {
  for (const transport of [
    async () => new Response('secret server response', { status: 500 }),
    async () => {
      throw new Error('private URL');
    },
  ]) {
    const storage = createEvidenceStorage(config, transport);
    await assert.rejects(storage.sign(path), { code: 'STORAGE_UNAVAILABLE' });
  }
  assert.equal(parseStorageEnv({}), undefined);
  assert.throws(() => parseStorageEnv({ SUPABASE_URL: config.url }), /SUPABASE_SERVICE_ROLE_KEY/);
  assert.throws(() =>
    parseStorageEnv({ SUPABASE_URL: `${config.url}/path`, SUPABASE_SERVICE_ROLE_KEY: config.key }),
  );
});
