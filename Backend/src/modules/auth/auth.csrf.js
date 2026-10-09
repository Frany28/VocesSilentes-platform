import { randomBytes } from 'node:crypto';
import { doubleCsrf } from 'csrf-csrf';
import { HttpError } from '../../errors/http-error.js';
import { authCookies } from './auth.cookies.js';
import { newSessionToken, sessionTokenHash, validSessionToken } from './session-tokens.js';

/**
 * Prepara CSRF double-submit firmado ligado a sesión o contexto anónimo HttpOnly.
 * @param {object} policy Política validada; secreto compartido obligatorio en producción.
 * @returns {object} Middleware y emisión/rotación de token CSRF, sin exponer token de sesión.
 */
export function createCsrf(policy) {
  const cookies = authCookies(policy);
  const secret = policy.csrfSecret ?? randomBytes(32).toString('hex');
  const { generateCsrfToken, doubleCsrfProtection, invalidCsrfTokenError } = doubleCsrf({
    getSecret: () => secret,
    getSessionIdentifier: (req) =>
      validSessionToken(req.cookies[cookies.session])
        ? `session:${sessionTokenHash(req.cookies[cookies.session])}`
        : `anonymous:${req.cookies[cookies.context] ?? ''}`,
    cookieName: cookies.csrf,
    cookieOptions: { ...cookies.options, maxAge: policy.sessionDurationSeconds * 1000 },
    getCsrfTokenFromRequest: (req) => req.get('X-CSRF-Token'),
    size: 32,
  });
  return {
    protect(req, res, next) {
      doubleCsrfProtection(req, res, (error) =>
        next(
          error === invalidCsrfTokenError
            ? new HttpError(
                403,
                'CSRF_INVALID',
                'Protección CSRF inválida; actualiza la sesión y reintenta',
              )
            : error,
        ),
      );
    },
    issue(req, res, rotate = false) {
      if (rotate || !validSessionToken(req.cookies[cookies.context])) {
        const context = newSessionToken();
        req.cookies[cookies.context] = context;
        res.cookie(cookies.context, context, {
          ...cookies.options,
          maxAge: policy.sessionDurationSeconds * 1000,
        });
      }
      try {
        return generateCsrfToken(req, res, { overwrite: rotate });
      } catch (error) {
        if (error !== invalidCsrfTokenError) throw error;
        return generateCsrfToken(req, res, { overwrite: true });
      }
    },
  };
}
