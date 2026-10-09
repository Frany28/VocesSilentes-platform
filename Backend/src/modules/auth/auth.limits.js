import { createHash } from 'node:crypto';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { HttpError } from '../../errors/http-error.js';

/**
 * Crea ventanas fijas por IP y por IP+correo sin bloquear globalmente cuentas ajenas.
 * @param {object} policy Límites validados; MemoryStore independiente por middleware/proceso.
 * @returns {object} Pares de middleware para login/register y límite IP de bootstrap CSRF.
 */
export function createAuthLimits(policy) {
  const common = {
    windowMs: policy.rateWindowMs,
    // Express calcula req.ip según proxies explícitos; ignorar cabeceras arbitrarias.
    keyGenerator: (req) => ipKeyGenerator(req.ip),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) =>
      next(new HttpError(429, 'RATE_LIMITED', 'Demasiados intentos; espera y reintenta')),
  };
  const identifierKey = (req) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const identifier = createHash('sha256').update(email).digest('hex');
    return `${ipKeyGenerator(req.ip)}:${identifier}`;
  };
  return {
    login: [
      rateLimit({ ...common, limit: policy.loginIpLimit }),
      rateLimit({ ...common, limit: policy.loginIdentifierLimit, keyGenerator: identifierKey }),
    ],
    register: [
      rateLimit({ ...common, limit: policy.registerIpLimit }),
      rateLimit({ ...common, limit: policy.registerIdentifierLimit, keyGenerator: identifierKey }),
    ],
    csrf: rateLimit({ ...common, limit: Math.max(60, policy.loginIpLimit) }),
  };
}
