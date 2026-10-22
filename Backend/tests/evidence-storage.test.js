import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEvidenceStorage } from '../src/modules/reports/evidence-storage.js';
import { createEvidenceS3Client } from '../src/modules/reports/evidence-s3-client.js';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

const path = Array(3).fill('00000000-0000-4000-8000-000000000001').join('/');
const config = {
  endpoint: 'https://test-project.storage.supabase.co/storage/v1/s3',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test-id', secretAccessKey: 'private-test-key-not-a-credential' },
};

test('S3: ruta exacta, HEAD previo, metadatos reales y rechazo de sobrescritura sin otro PUT', async () => {
  const calls = [];
  let exists = false;
  const client = {
    async send(command) {
      calls.push(command);
      if (command.constructor.name === 'HeadObjectCommand' && !exists)
        throw Object.assign(new Error('missing'), { $metadata: { httpStatusCode: 404 } });
      exists = true;
      return {};
    },
    destroy() {},
  };
  const storage = createEvidenceStorage(config, { client });
  await storage.upload(path, { bytes: Buffer.from('test'), mimeType: 'image/png', size: 4 });
  assert.deepEqual(
    calls.map((command) => command.constructor.name),
    ['HeadObjectCommand', 'PutObjectCommand'],
  );
  assert.equal(calls[1].input.Bucket, 'report-evidence');
  assert.equal(calls[1].input.Key, path);
  assert.equal(calls[1].input.ContentType, 'image/png');
  assert.equal(calls[1].input.CacheControl, 'no-store');
  await assert.rejects(storage.upload(path, {}), { code: 'EVIDENCE_EXISTS' });
  assert.equal(
    calls.filter((command) => command.constructor.name === 'PutObjectCommand').length,
    1,
  );
  await storage.remove(path);
  assert.equal(calls.at(-1).input.Key, path);
  await assert.rejects(storage.remove('../profile-image'), /Invalid internal evidence path/);
});

test('S3: firma SigV4 real de 120 segundos, sin red y sin secreto en URL', async () => {
  const client = createEvidenceS3Client(config);
  try {
    const storage = createEvidenceStorage(config, { client });
    const access = await storage.sign(path);
    const url = new URL(access.src);
    assert.equal(url.origin, new URL(config.endpoint).origin);
    assert.equal(url.pathname, `/storage/v1/s3/report-evidence/${path}`);
    assert.equal(url.searchParams.get('X-Amz-Expires'), '120');
    assert.equal(url.searchParams.get('X-Amz-Algorithm'), 'AWS4-HMAC-SHA256');
    assert.ok(!access.src.includes(config.credentials.secretAccessKey));
    assert.ok(Date.parse(access.expiresAt) > Date.now() + 110000);
    const expired = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: 'report-evidence', Key: path }),
      { expiresIn: 120, signingDate: new Date(Date.now() - 125000) },
    );
    assert.notEqual(
      new URL(expired).searchParams.get('X-Amz-Date'),
      url.searchParams.get('X-Amz-Date'),
    );
  } finally {
    client.destroy();
  }
});

test('S3: un fallo HEAD no se interpreta como ausencia ni permite PUT; errores no revelan secretos', async () => {
  const calls = [];
  const storage = createEvidenceStorage(config, {
    client: {
      async send(command) {
        calls.push(command);
        throw Object.assign(new Error('private transport response'), {
          $metadata: { httpStatusCode: 403 },
        });
      },
    },
  });
  await assert.rejects(storage.upload(path, {}), { code: 'STORAGE_UNAVAILABLE' });
  assert.equal(calls.length, 1);
  await assert.rejects(storage.check(), { code: 'STORAGE_UNAVAILABLE' });
});
