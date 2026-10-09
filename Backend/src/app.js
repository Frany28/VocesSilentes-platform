import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { HttpError } from './errors/http-error.js';
import { errorHandler, notFound } from './middlewares/errors.js';
import { createHealthRouter } from './modules/health/health.routes.js';

/**
 * Configura Express sin abrir puertos ni depender de PostgreSQL.
 * @param {ReturnType<import('./config/env.js').parseEnv>} config Configuración validada.
 * @param {import('pino').Logger} logger Logger con serializadores seguros.
 * @returns {import('express').Express} Aplicación lista para arrancar o probar.
 */
export function createApp(config, logger) {
  const app = express();
  app.disable('x-powered-by');
  app.use(pinoHttp({ logger, wrapSerializers: false }));
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
        callback(new HttpError(403, 'ORIGIN_NOT_ALLOWED', 'Origen no permitido'));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use('/api/health', createHealthRouter());
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
