import { createServer } from 'node:http';
import { once } from 'node:events';
import { startAcademicFrontend } from './frontend.js';
import { createAcademicDatabase } from './database.js';
import { createAcademicStorageFixture } from './storage-fixture.js';
import { createAuthService } from '../../src/modules/auth/auth.service.js';
import { createUsersService } from '../../src/modules/admin/users.service.js';
import { createReportsService } from '../../src/modules/reports/reports.service.js';
import { createLearningService } from '../../src/modules/learning/learning.service.js';
import { createAccountService } from '../../src/modules/account/account.service.js';
import { createApp } from '../../src/app.js';
import { createLogger } from '../../src/lib/logger.js';
import { parseEnv } from '../../src/config/env.js';

/**
 * Arranca API y Vite contra una base efímera, ignorando configuración privada y demo visual.
 * @param {{seed?: boolean, port?: number, previewModuleId?: string,
 * productionFrontend?: boolean}} [options] Datos, puerto, borrador explícito y build de producción de prueba.
 * @returns {Promise<object>} Servicios, origen, procesos propios y cierre; sin escrituras externas.
 */
export async function createAcademicEnvironment({
  seed = false,
  port = 5280,
  previewModuleId,
  productionFrontend = false,
} = {}) {
  const state = await createAcademicDatabase({ seed });
  const origin = `http://localhost:${port}`;
  const config = parseEnv({
    NODE_ENV: 'test',
    CORS_ORIGINS: origin,
    REGISTER_IP_LIMIT: '100',
    REGISTER_IDENTIFIER_LIMIT: '100',
    LOGIN_IP_LIMIT: '1000',
  });
  const authService = await createAuthService(state.database, config.auth);
  const storage = createAcademicStorageFixture();
  const app = createServer(
    createApp(config, createLogger('silent'), {
      authService,
      usersService: await createUsersService(state.database),
      reportsService: createReportsService(state.database, storage),
      learningService: createLearningService(state.database, { previewModuleId }),
      accountService: await createAccountService(state.database, {
        ...storage,
        upload: (path, bytes) => storage.upload(path, { bytes, mimeType: 'image/webp' }),
        read: async (path) => storage.objects.get(path).bytes,
      }),
    }),
  );
  app.listen(0, 'localhost');
  await once(app, 'listening');
  let frontend;
  try {
    frontend = startAcademicFrontend({
      port,
      apiUrl: `http://localhost:${app.address().port}/api`,
      production: productionFrontend,
    });
  } catch (error) {
    await new Promise((done) => app.close(done));
    await state.close();
    throw error;
  }
  let frontendError;
  frontend.on('error', (error) => {
    frontendError = error;
  });
  frontend.stderr.on('data', () => {
    /* No imprimir entorno, URLs privadas ni errores internos. */
  });
  return {
    ...state,
    app,
    authService,
    storage,
    origin,
    async ready() {
      const deadline = Date.now() + 30000;
      while (Date.now() < deadline) {
        if (frontendError || frontend.exitCode !== null)
          throw new Error('No se pudo iniciar Vite aislado');
        try {
          if ((await fetch(origin)).ok) return;
        } catch {
          /* Esperar al arranque local. */
        }
        await new Promise((done) => setTimeout(done, 100));
      }
      throw new Error('Vite aislado no respondió');
    },
    async close() {
      frontend.kill();
      await new Promise((done) => app.close(done));
      await state.close();
    },
  };
}
