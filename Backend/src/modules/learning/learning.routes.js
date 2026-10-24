import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { HttpError } from '../../errors/http-error.js';
import { requireAuthTransport, requireSession, requireRole } from '../auth/auth.middleware.js';

const idSchema = z.uuid();
const progressSchema = z.object({ status: z.enum(['IN_PROGRESS', 'COMPLETED']) }).strict();

/**
 * Expone catálogo y progreso propio; valida sesión USER, CSRF y publicación en cada escritura.
 * @param {object} config Configuración validada.
 * @param {object | undefined} authService Autenticación existente.
 * @param {object | undefined} service Negocio educativo o undefined sin DB.
 * @param {object} csrf Protección compartida.
 * @returns {import('express').Router} Rutas sin aceptar userId ni calificaciones del cliente.
 */
export function createLearningRouter(config, authService, service, csrf) {
  const router = Router();
  router.use(requireAuthTransport(config.nodeEnv));
  router.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  router.use(requireSession(authService, config.auth), requireRole('USER'));
  router.use((_req, _res, next) =>
    next(
      service ? undefined : new HttpError(503, 'LEARNING_UNAVAILABLE', 'Contenido no disponible'),
    ),
  );
  const limit = rateLimit({
    keyGenerator: (req) => req.auth.id,
    windowMs: 60000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({
        error: { code: 'LEARNING_RATE_LIMIT', message: 'Espera antes de reintentar' },
      }),
  });
  router.get('/', async (req, res) => res.json({ data: await service.snapshot(req.auth.id) }));
  for (const [path, kind] of [
    ['lessons', 'lesson'],
    ['exercises', 'exercise'],
  ]) {
    router.put(`/${path}/:id/progress`, limit, csrf.protect, async (req, res) => {
      const { status } = progressSchema.parse(req.body);
      const progress = await service.progress(
        req.auth.id,
        kind,
        idSchema.parse(req.params.id),
        status,
      );
      res.json({ data: { progress } });
    });
  }
  return router;
}
