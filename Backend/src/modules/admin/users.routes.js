import { Router } from 'express';
import { HttpError } from '../../errors/http-error.js';
import { requireSession, requireRole, requireAuthTransport } from '../auth/auth.middleware.js';
import { createUsersController } from './users.controller.js';

/**
 * Expone solo consulta mínima, creación y edición; exige sesión ADMIN y CSRF al escribir.
 * @param {object} config Configuración validada.
 * @param {object | undefined} authService Autenticación existente.
 * @param {object | undefined} usersService Negocio de usuarios o undefined sin DB.
 * @param {object} csrf Protección compartida con auth, también en desarrollo.
 * @returns {import('express').Router} Rutas sin métricas, listado ni cambio de estado.
 */
export function createUsersRouter(config, authService, usersService, csrf) {
  const router = Router();
  const controller = createUsersController(usersService);
  router.use(requireAuthTransport(config.nodeEnv));
  router.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  router.use(requireSession(authService, config.auth), requireRole('ADMIN'));
  router.use((_req, _res, next) =>
    next(
      usersService
        ? undefined
        : new HttpError(503, 'USERS_UNAVAILABLE', 'Administración no disponible'),
    ),
  );
  router.get('/:id', controller.get);
  router.post('/', csrf.protect, controller.create);
  router.patch('/:id', csrf.protect, controller.edit);
  return router;
}
