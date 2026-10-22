import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';
import { HttpError } from './errors/http-error.js';
import { errorHandler, notFound } from './middlewares/errors.js';
import { createHealthRouter } from './modules/health/health.routes.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { createCsrf } from './modules/auth/auth.csrf.js';
import { createUsersRouter } from './modules/admin/users.routes.js';
import { createReportsRouter } from './modules/reports/reports.routes.js';

/**
 * Configura Express sin abrir puertos ni depender de PostgreSQL.
 * @param {ReturnType<import('./config/env.js').parseEnv>} config Configuración validada.
 * @param {import('pino').Logger} logger Logger con serializadores seguros.
 * @param {{authService?: object, usersService?: object, reportsService?: object,
 * app?: import('express').Express}} [dependencies] Servicios y app.
 * @returns {import('express').Express} Aplicación lista para arrancar o probar.
 */
export function createApp(config, logger, dependencies = {}) {
  const app = dependencies.app ?? express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.auth.trustProxyIps.length ? config.auth.trustProxyIps : false);
  app.use(pinoHttp({ logger, wrapSerializers: false }));
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
        callback(new HttpError(403, 'ORIGIN_NOT_ALLOWED', 'Origen no permitido'));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use('/api/health', createHealthRouter());
  const csrf = createCsrf(config.auth);
  app.use('/api/auth', createAuthRouter(config, dependencies.authService, csrf));
  app.use(
    '/api/reports',
    createReportsRouter(config, dependencies.authService, dependencies.reportsService, csrf),
  );
  app.use(
    '/api/admin',
    createUsersRouter(config, dependencies.authService, dependencies.usersService, csrf),
  );
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
