import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createApp } from '../../src/app.js';
import { parseEnv } from '../../src/config/env.js';
import { createLogger } from '../../src/lib/logger.js';
import { authFixture, registration, csrfToken } from './fixture.js';

const fixture = authFixture();

test('rate limiting por identificador normalizado y por IP, sin permitir spoof de IP', async () => {
  const config = parseEnv({
    NODE_ENV: 'test',
    LOGIN_IDENTIFIER_LIMIT: '2',
    LOGIN_IP_LIMIT: '3',
    REGISTER_IDENTIFIER_LIMIT: '1',
    REGISTER_IP_LIMIT: '2',
  });
  const server = createServer(
    createApp(config, createLogger('silent'), { authService: fixture.service }),
  );
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const agent = request.agent(server);
    const csrf = await csrfToken(agent);
    const postLogin = (email, ip) =>
      agent
        .post('/api/auth/login')
        .set('X-CSRF-Token', csrf)
        .set('X-Forwarded-For', ip)
        .send({ email, password: 'incorrect password' });
    await postLogin('missing@example.invalid', '192.0.2.1').expect(401);
    await postLogin(' MISSING@EXAMPLE.INVALID ', '192.0.2.2').expect(401);
    const limited = await postLogin('missing@example.invalid', '192.0.2.3').expect(429);
    assert.equal(limited.body.error.code, 'RATE_LIMITED');
    assert.ok(Number(limited.headers['retry-after']) > 0);
    await postLogin('other@example.invalid', '192.0.2.4').expect(429);
    const input = registration();
    const first = await agent
      .post('/api/auth/register')
      .set('X-CSRF-Token', csrf)
      .send(input)
      .expect(201);
    const fresh = first.body.data.csrfToken;
    await agent.post('/api/auth/register').set('X-CSRF-Token', fresh).send(input).expect(429);
    await agent
      .post('/api/auth/register')
      .set('X-CSRF-Token', fresh)
      .send(registration())
      .expect(429);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
