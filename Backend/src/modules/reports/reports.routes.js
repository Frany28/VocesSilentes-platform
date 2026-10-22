import { Router, raw } from 'express';
import { rateLimit } from 'express-rate-limit';
import { HttpError } from '../../errors/http-error.js';
import { requireAuthTransport, requireSession } from '../auth/auth.middleware.js';
import { createReportSchema, reportIdSchema, reportPageSchema } from './reports.validation.js';
import { EVIDENCE_LIMIT } from './evidence-image.js';

/**
 * Rutas de reportes con sesión propia, transporte, CSRF y límites antes de recibir bytes.
 * @param {object} config Configuración HTTP/auth existente.
 * @param {object | undefined} authService Autenticación con rol vigente en base de datos.
 * @param {object | undefined} service Negocio de reportes.
 * @param {object} csrf Protección compartida.
 * @returns {import('express').Router} API privada; nunca acepta owner, bucket, ruta o rol del cliente.
 */
export function createReportsRouter(config, authService, service, csrf) {
  const router = Router();
  router.use(requireAuthTransport(config.nodeEnv));
  router.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  router.use(requireSession(authService, config.auth));
  router.use((_req, _res, next) =>
    next(
      service ? undefined : new HttpError(503, 'REPORTS_UNAVAILABLE', 'Reportes no disponibles'),
    ),
  );
  const limit = rateLimit({
    keyGenerator: (req) => req.auth.id,
    windowMs: 60000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) =>
      res
        .status(429)
        .json({ error: { code: 'REPORT_RATE_LIMIT', message: 'Espera antes de reintentar' } }),
  });
  router.get('/', async (req, res) => {
    res.json({ data: await service.list(req.auth, reportPageSchema.parse(req.query)) });
  });
  router.post('/', limit, csrf.protect, async (req, res) => {
    res.status(201).json({
      data: { report: await service.create(req.auth, createReportSchema.parse(req.body)) },
    });
  });
  router.get('/:id', async (req, res) => {
    res.json({
      data: { report: await service.get(req.auth, reportIdSchema.parse(req.params.id)) },
    });
  });
  router.put(
    '/:id/evidence',
    limit,
    csrf.protect,
    async (req, _res, next) => {
      await service.get(req.auth, reportIdSchema.parse(req.params.id));
      next();
    },
    raw({ type: () => true, limit: EVIDENCE_LIMIT, inflate: false }),
    async (req, res) => {
      await service.attach(req.auth, reportIdSchema.parse(req.params.id), req.body);
      res.status(204).end();
    },
  );
  router.get('/:id/evidence/access', limit, async (req, res) => {
    res.json({ data: await service.read(req.auth, reportIdSchema.parse(req.params.id)) });
  });
  return router;
}
