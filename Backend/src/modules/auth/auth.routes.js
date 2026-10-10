import { Router } from 'express';
import { HttpError } from '../../errors/http-error.js';
import { createCsrf } from './auth.csrf.js';
import { createAuthLimits } from './auth.limits.js';
import { createAuthController } from './auth.controller.js';
import { requireSession, requireAuthTransport } from './auth.middleware.js';

/**
 * Registra endpoints reales de autenticación, CSRF y límites con respuestas no cacheables.
 * @param {object} config Configuración HTTP y políticas validadas.
 * @param {object | undefined} service Servicio persistente; sin DB devuelve 503 excepto CSRF.
 * @param {object} [csrf] Protección compartida con otras rutas de la aplicación.
 * @returns {import('express').Router} Router sin puerto ni inicialización de base.
 */
export function createAuthRouter(config, service, csrf = createCsrf(config.auth)) {
  const router = Router();
  const limits = createAuthLimits(config.auth);
  const controllers = createAuthController(service, config.auth, csrf);
  router.use(requireAuthTransport(config.nodeEnv));
  router.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  router.get('/csrf', limits.csrf, controllers.csrfToken);
  router.use((_req, _res, next) =>
    next(
      service ? undefined : new HttpError(503, 'AUTH_UNAVAILABLE', 'Autenticación no disponible'),
    ),
  );
  router.post('/register', limits.register, csrf.protect, controllers.register);
  router.post('/login', limits.login, csrf.protect, controllers.login);
  router.get('/me', requireSession(service, config.auth), controllers.me);
  router.post('/logout', csrf.protect, controllers.logout);
  return router;
}
