import { Router, raw } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { HttpError } from '../../errors/http-error.js';
import { requireAuthTransport, requireSession } from '../auth/auth.middleware.js';
import { authCookies } from '../auth/auth.cookies.js';
import { sessionTokenHash } from '../auth/session-tokens.js';
import { EVIDENCE_LIMIT } from '../reports/evidence-image.js';
import { profileSchema, passwordSchema, photoQuerySchema } from './account.validation.js';

/**
 * Expone operaciones propias con identidad de sesión, validación y límites antes de leer imágenes.
 * @param {object} config Configuración HTTP.
 * @param {object | undefined} authService Autenticación existente.
 * @param {object | undefined} service Servicio de cuenta.
 * @param {object} csrf Protección compartida.
 * @returns {import('express').Router} API privada con errores centralizados y CSRF en escrituras.
 */
export function createAccountRouter(config, authService, service, csrf) {
  const router = Router();
  router.use(requireAuthTransport(config.nodeEnv), requireSession(authService, config.auth));
  router.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  router.use((_req, _res, next) =>
    next(
      service
        ? undefined
        : new HttpError(503, 'ACCOUNT_UNAVAILABLE', 'Configuración de cuenta no disponible'),
    ),
  );
  const limit = () =>
    rateLimit({
      keyGenerator: (req) => req.auth.id,
      windowMs: 600000,
      limit: 10,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      handler: (_req, _res, next) =>
        next(new HttpError(429, 'ACCOUNT_RATE_LIMIT', 'Espera antes de reintentar')),
    });
  router.patch('/profile', csrf.protect, async (req, res) => {
    res.json({ data: { user: await service.profile(req.auth.id, profileSchema.parse(req.body)) } });
  });
  router.put('/password', limit(), csrf.protect, async (req, res) => {
    const hash = sessionTokenHash(req.cookies[authCookies(config.auth).session]);
    await service.password(req.auth.id, hash, passwordSchema.parse(req.body));
    res.status(204).end();
  });
  router.put(
    '/photo',
    limit(),
    csrf.protect,
    raw({ type: () => true, limit: EVIDENCE_LIMIT, inflate: false }),
    async (req, res) => {
      const { zoom } = photoQuerySchema.parse(req.query);
      res.json({ data: { user: await service.savePhoto(req.auth.id, req.body, zoom) } });
    },
  );
  router.delete('/photo', csrf.protect, async (req, res) => {
    res.json({ data: { user: await service.removePhoto(req.auth.id) } });
  });
  router.get('/photos/:id/access', async (req, res) => {
    res.json({ data: await service.readPhoto(req.auth, z.uuid().parse(req.params.id)) });
  });
  router.get('/photos/:id/image', async (req, res) => {
    const bytes = await service.readPhoto(req.auth, z.uuid().parse(req.params.id), true);
    res.type('image/webp').send(bytes);
  });
  return router;
}
