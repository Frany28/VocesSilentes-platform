import { authCookies } from './auth.cookies.js';
import { registrationSchema, loginSchema } from './auth.validation.js';

/**
 * Traduce HTTP a negocio y emite cookies; nunca serializa tokens de sesión ni hashes.
 * @param {object} service Servicio de autenticación.
 * @param {object} policy Política validada de cookies.
 * @param {object} csrf Utilidades CSRF firmadas.
 * @returns {object} Controllers register/login/me/logout/csrfToken.
 */
export function createAuthController(service, policy, csrf) {
  const cookies = authCookies(policy);
  const authenticate = (schema, operation, status) => async (req, res) => {
    const result = await service[operation](schema.parse(req.body));
    res.cookie(cookies.session, result.token, { ...cookies.options, expires: result.expiresAt });
    req.cookies[cookies.session] = result.token;
    res.status(status).json({ data: { user: result.user, csrfToken: csrf.issue(req, res, true) } });
  };
  return {
    register: authenticate(registrationSchema, 'register', 201),
    login: authenticate(loginSchema, 'login', 200),
    me: (req, res) => res.json({ data: { user: req.auth } }),
    csrfToken: (req, res) => res.json({ data: { csrfToken: csrf.issue(req, res) } }),
    async logout(req, res) {
      await service.logout(req.cookies[cookies.session]);
      for (const name of [cookies.session, cookies.context, cookies.csrf])
        res.clearCookie(name, cookies.options);
      res.status(204).end();
    },
  };
}
