import { isIP } from 'node:net';
import { z } from 'zod';

const positive = (initial, max) => z.coerce.number().int().min(1).max(max).default(initial);
const schema = z.object({
  CSRF_SECRET: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .string()
      .regex(/^[0-9a-f]{64}$/i)
      .optional(),
  ),
  SESSION_DURATION_SECONDS: positive(86400, 604800),
  SESSION_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  AUTH_RATE_WINDOW_SECONDS: positive(600, 3600),
  LOGIN_IP_LIMIT: positive(30, 1000),
  LOGIN_IDENTIFIER_LIMIT: positive(5, 100),
  REGISTER_IP_LIMIT: positive(5, 100),
  REGISTER_IDENTIFIER_LIMIT: positive(3, 100),
  TRUST_PROXY_IPS: z
    .string()
    .default('')
    .transform((value) => (value ? value.split(',').map((ip) => ip.trim()) : []))
    .pipe(z.array(z.string().refine((value) => Boolean(isIP(value))))),
});

/**
 * Valida políticas de autenticación y despliegue sin revelar secretos.
 * @param {Record<string, string | undefined>} input Entorno privado.
 * @param {{nodeEnv: string, corsOrigins: string[]}} base Configuración HTTP validada.
 * @returns {object} Políticas de cookie, CSRF, proxy y límites.
 * @throws {Error} Con nombres de variables inválidas, nunca sus valores.
 */
export function parseAuthEnv(input, base) {
  const result = schema.safeParse(input);
  const fields = result.success ? [] : result.error.issues.map((issue) => issue.path[0]);
  const production = base.nodeEnv === 'production';
  if (production && !input.CSRF_SECRET) fields.push('CSRF_SECRET');
  if (result.success && !production && result.data.SESSION_SAME_SITE === 'none')
    fields.push('SESSION_SAME_SITE');
  for (const origin of base.corsOrigins) {
    const url = new URL(origin);
    if (
      url.protocol === 'http:' &&
      (production || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
    ) {
      fields.push('CORS_ORIGINS');
    }
  }
  if (fields.length) throw new Error(`Configuración inválida: ${[...new Set(fields)].join(', ')}`);
  const env = result.data;
  return Object.freeze({
    secure: production,
    csrfSecret: env.CSRF_SECRET,
    sessionDurationSeconds: env.SESSION_DURATION_SECONDS,
    sameSite: env.SESSION_SAME_SITE,
    rateWindowMs: env.AUTH_RATE_WINDOW_SECONDS * 1000,
    loginIpLimit: env.LOGIN_IP_LIMIT,
    loginIdentifierLimit: env.LOGIN_IDENTIFIER_LIMIT,
    registerIpLimit: env.REGISTER_IP_LIMIT,
    registerIdentifierLimit: env.REGISTER_IDENTIFIER_LIMIT,
    trustProxyIps: env.TRUST_PROXY_IPS,
  });
}
