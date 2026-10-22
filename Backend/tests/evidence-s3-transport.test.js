import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createEvidenceStorage } from '../src/modules/reports/evidence-storage.js';

test('S3: transporte HTTP real acepta configuración inmutable y firma la carga sin revelar el secreto', async () => {
  const calls = [];
  let exists = false;
  const server = createServer((req, res) => {
    calls.push({
      method: req.method,
      url: req.url,
      authorization: req.headers.authorization,
      condition: req.headers['if-none-match'],
    });
    if (req.method === 'HEAD')
      res.writeHead(exists || !req.url.includes('/0000') ? 200 : 404).end();
    else {
      exists = true;
      req.resume();
      req.on('end', () => res.writeHead(200, { etag: 'test-etag' }).end());
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const credentials = Object.freeze({
    accessKeyId: 'synthetic-id',
    secretAccessKey: 'synthetic-private-key-not-a-secret',
  });
  const storage = createEvidenceStorage(
    Object.freeze({
      credentials,
      region: 'us-east-1',
      endpoint: `http://127.0.0.1:${server.address().port}/storage/v1/s3`,
    }),
  );
  try {
    await storage.check();
    const path = Array(3).fill('00000000-0000-4000-8000-000000000001').join('/');
    await storage.upload(path, { bytes: Buffer.from('test'), size: 4, mimeType: 'image/png' });
    assert.deepEqual(
      calls.map((call) => call.method),
      ['HEAD', 'HEAD', 'PUT'],
    );
    assert.equal(calls[2].url, `/storage/v1/s3/report-evidence/${path}?x-id=PutObject`);
    assert.equal(calls[2].condition, '*');
    assert.ok(calls[2].authorization.startsWith('AWS4-HMAC-SHA256 Credential=synthetic-id/'));
    assert.ok(!calls[2].authorization.includes(credentials.secretAccessKey));
    assert.equal(credentials.$source, undefined);
  } finally {
    storage.close();
    await new Promise((resolve) => server.close(resolve));
  }
});
