import { HttpError } from '../../errors/http-error.js';
import { authCookies } from './auth.cookies.js';

/**
 * Exige sesión y estado actual, sin tomar identidad o permisos del body/headers del cliente.
 * @param {object | undefined} service Servicio de autenticación con persistencia.
 * @param {object} policy Política de cookies.
 * @returns {import('express').RequestHandler} Middleware async; añade req.auth con DTO público.
 */
export function requireSession(service, policy) {
  const cookieName = authCookies(policy).session;
  return async (req, _res, next) => {
    if (!service) throw new HttpError(503, 'AUTH_UNAVAILABLE', 'Autenticación no disponible');
    const user = await service.authenticate(req.cookies?.[cookieName]);
    if (!user) throw new HttpError(401, 'UNAUTHENTICATED', 'Se requiere una sesión válida');
    req.auth = user;
    next();
  };
}

/**
 * Exige un rol autorizado después de requireSession; no publica rutas administrativas ficticias.
 * @param {...string} roles Roles USER/ADMIN aceptados.
 * @returns {import('express').RequestHandler} Middleware 401 sin identidad o 403 sin permiso.
 */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.auth)
      return next(new HttpError(401, 'UNAUTHENTICATED', 'Se requiere una sesión válida'));
    if (!roles.includes(req.auth.role))
      return next(new HttpError(403, 'FORBIDDEN', 'Permiso insuficiente'));
    next();
  };
}

/**
 * Exige HTTPS o una conexión local de desarrollo; nunca confía en X-Forwarded-* sin proxy autorizado.
 * @param {string} nodeEnv Entorno validado.
 * @returns {import('express').RequestHandler} Middleware del transporte de autenticación.
 */
export function requireAuthTransport(nodeEnv) {
  return (req, _res, next) => {
    const local = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
    if (!req.secure && (nodeEnv === 'production' || !local)) {
      return next(
        new HttpError(403, 'HTTPS_REQUIRED', 'La autenticación requiere transporte seguro'),
      );
    }
    next();
  };
}
