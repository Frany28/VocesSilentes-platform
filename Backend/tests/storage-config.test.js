import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStorageEnv } from '../src/config/storage-env.js';

const input = {
  S3_ENDPOINT: 'https://project-ref.storage.supabase.co/storage/v1/s3',
  S3_REGION: 'us-east-1',
  s3_access_key_id: 'synthetic-access-id',
  s3_secret_access_key: 'synthetic-private-key-not-a-secret',
  S3_BUCKET_NAME: 'existing-profile-bucket',
};

test('S3: reutiliza nombres existentes y mantiene bucket general independiente de evidencia', () => {
  assert.equal(parseStorageEnv({}), undefined);
  assert.equal(parseStorageEnv({ S3_BUCKET_NAME: 'existing' }), undefined);
  const storage = parseStorageEnv(input);
  assert.equal(storage.endpoint, input.S3_ENDPOINT);
  assert.equal(storage.credentials.accessKeyId, input.s3_access_key_id);
  assert.equal(storage.bucket, undefined);
  assert.ok(Object.isFrozen(storage.credentials));
});

test('S3: configuración parcial, endpoint externo y otro proyecto se rechazan sin valores secretos', () => {
  for (const change of [
    { S3_REGION: undefined },
    { s3_secret_access_key: undefined },
    { S3_ENDPOINT: 'https://untrusted.invalid/storage/v1/s3' },
    { S3_ENDPOINT: 'http://project-ref.supabase.co/storage/v1/s3' },
    { S3_ENDPOINT: `${input.S3_ENDPOINT}?token=private` },
    {
      DIRECT_URL:
        'postgresql://postgres.other-project:private@aws-0-us-east-1.pooler.supabase.com/postgres',
    },
  ]) {
    assert.throws(
      () => parseStorageEnv({ ...input, ...change }),
      (error) => {
        assert.ok(!error.message.includes(input.s3_secret_access_key));
        assert.ok(!error.message.includes('private@'));
        return true;
      },
    );
  }
  assert.ok(
    parseStorageEnv({
      ...input,
      DIRECT_URL:
        'postgresql://postgres.project-ref:private@aws-0-us-east-1.pooler.supabase.com/postgres',
    }),
  );
});
