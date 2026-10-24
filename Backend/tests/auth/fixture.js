import { before, after } from 'node:test';
import { readFile, readdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/client.js';
import { createAuthService } from '../../src/modules/auth/auth.service.js';
import { createUsersService } from '../../src/modules/admin/users.service.js';
import { createReportsService } from '../../src/modules/reports/reports.service.js';
import { createLearningService } from '../../src/modules/learning/learning.service.js';
import { createAccountService } from '../../src/modules/account/account.service.js';
import { createApp } from '../../src/app.js';
import { createLogger } from '../../src/lib/logger.js';
import { parseEnv } from '../../src/config/env.js';
import request from 'supertest';
import { createServer } from 'node:http';
import { once } from 'node:events';

/**
 * Registra integración HTTP + PrismaPg + PostgreSQL WASM/TCP efímero, sin leer .env.
 * @param {{storage?: object, photoStorage?: object}} [options] Dobles explícitos de Storage, nunca credenciales reales.
 * @returns {object} Fixture inicializada en before y cerrada en after; no conecta a Supabase.
 */
export function authFixture(options = {}) {
  const fixture = {};
  before(async () => {
    const db = new PGlite();
    fixture.db = db;
    const migrations = new URL('../../prisma/migrations/', import.meta.url);
    for (const name of (await readdir(migrations)).filter((name) => /^\d/.test(name)).sort()) {
      await db.exec(await readFile(new URL(`${name}/migration.sql`, migrations), 'utf8'));
    }
    const server = new PGLiteSocketServer({ db, host: '127.0.0.1', port: 0, inspect: false });
    fixture.server = server;
    await server.start();
    const connectionString = `postgresql://postgres@${server.getServerConn()}/postgres?sslmode=disable`;
    const adapter = new PrismaPg({ connectionString, max: 1 }, { schema: 'vocessilentes' });
    const database = new PrismaClient({ adapter, log: [] });
    fixture.database = database;
    await database.$connect();
    fixture.config = parseEnv({
      NODE_ENV: 'test',
      LOGIN_IP_LIMIT: '1000',
      LOGIN_IDENTIFIER_LIMIT: '100',
      REGISTER_IP_LIMIT: '100',
      REGISTER_IDENTIFIER_LIMIT: '100',
    });
    fixture.service = await createAuthService(database, fixture.config.auth);
    fixture.usersService = await createUsersService(database);
    fixture.reportsService = createReportsService(database, options.storage);
    fixture.app = createServer(
      createApp(fixture.config, createLogger('silent'), {
        authService: fixture.service,
        usersService: fixture.usersService,
        reportsService: fixture.reportsService,
        learningService: createLearningService(database),
        accountService: await createAccountService(database, options.photoStorage),
      }),
    );
    fixture.app.listen(0, '127.0.0.1');
    await once(fixture.app, 'listening');
  });
  after(async () => {
    if (fixture.app) await new Promise((resolve) => fixture.app.close(resolve));
    await fixture.database?.$disconnect();
    await fixture.server?.stop();
    await fixture.db?.close();
  });
  return fixture;
}

/**
 * Genera una cuenta sintética única solo para la base efímera de integración.
 * @returns {object} Registro válido; contraseña conocida solo en pruebas.
 */
export function registration() {
  const suffix = randomUUID().replaceAll('-', '');
  return {
    firstName: 'Prueba',
    email: `${suffix}@example.invalid`,
    username: `test_${suffix}`,
    password: 'Una frase de prueba 123! ',
  };
}

/**
 * Obtiene CSRF previo a login y conserva cookies en el agente de prueba.
 * @param {object} agent Supertest agent.
 * @returns {Promise<string>} Token CSRF firmado.
 */
export async function csrfToken(agent) {
  return (await agent.get('/api/auth/csrf').expect(200)).body.data.csrfToken;
}

/**
 * Registra una cuenta mediante HTTP, hashing y persistencia reales en el entorno efímero.
 * @param {object} fixture Base aislada inicializada.
 * @returns {Promise<object>} Usuario público, agente, entrada y respuesta para aserciones.
 */
export async function registered(fixture) {
  const agent = request.agent(fixture.app);
  const input = registration();
  const csrf = await csrfToken(agent);
  const response = await agent
    .post('/api/auth/register')
    .set('X-CSRF-Token', csrf)
    .send(input)
    .expect(201);
  return {
    agent,
    input,
    response,
    user: response.body.data.user,
    csrf: response.body.data.csrfToken,
  };
}
