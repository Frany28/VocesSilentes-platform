import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { Writable } from 'node:stream';
import { test } from 'node:test';
import { createApp } from '../src/app.js';
import { parseEnv } from '../src/config/env.js';
import { createLogger } from '../src/lib/logger.js';
import { closeResources } from '../src/lib/shutdown.js';

test('cierra HTTP antes de desconectar la base y admite base desactivada', async () => {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  let disconnected = false;
  await closeResources(server, {
    async $disconnect() {
      assert.equal(server.listening, false);
      disconnected = true;
    },
  });
  assert.equal(disconnected, true);
  await assert.rejects(() => closeResources(server, undefined), /not running/i);
});

test('desconecta Prisma aunque falle el cierre HTTP', async () => {
  let disconnected = false;
  await assert.rejects(
    () =>
      closeResources(createServer(), {
        async $disconnect() {
          disconnected = true;
        },
      }),
    /not running/i,
  );
  assert.equal(disconnected, true);
});

test('los logs de peticiones y errores omiten secretos y datos de usuario', async () => {
  let output = '';
  const destination = new Writable({
    write(chunk, _encoding, callback) {
      output += chunk.toString();
      callback();
    },
  });
  const logger = createLogger('info', destination);
  const server = createServer(createApp(parseEnv({ NODE_ENV: 'test' }), logger));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    await fetch(`http://127.0.0.1:${server.address().port}/api/health?secret=secret-marker`, {
      headers: { Authorization: 'secret-marker', Cookie: 'secret-marker' },
    });
    logger.error(
      { err: new Error('secret-marker'), password: 'secret-marker' },
      'Error controlado',
    );
    const entries = output
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    assert.ok(entries.some((entry) => entry.res?.statusCode === 200));
    assert.ok(entries.some((entry) => entry.err?.type === 'Error'));
    assert.ok(!output.includes('secret-marker'));
    assert.ok(!output.includes('headers'));
  } finally {
    await closeResources(server, undefined);
  }
});
