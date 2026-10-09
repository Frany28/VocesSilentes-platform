import { z } from 'zod';
import { parseAuthEnv } from './auth-env.js';

const origin = z
  .string()
  .url()
  .refine((value) => {
    if (!URL.canParse(value)) return false;
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && url.origin === value;
  }, 'Debe ser un origen HTTP(S) exacto, sin ruta ni credenciales');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().trim().min(1).default('localhost'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173,http://localhost:4173')
    .transform((value) => value.split(',').map((item) => item.trim()))
    .pipe(z.array(origin).min(1)),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DATABASE_URL: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .string()
      .url()
      .refine(
        (value) =>
          URL.canParse(value) && ['postgresql:', 'postgres:'].includes(new URL(value).protocol),
      )
      .optional(),
  ),
});

/** Error de configuración que expone nombres de campos, nunca sus valores. */
export class ConfigurationError extends Error {}

/**
 * Valida configuración sin modificar el entorno ni revelar secretos en errores.
 * @param {Record<string, string | undefined>} input Variables del proceso.
 * @returns {{nodeEnv: string, host: string, port: number, corsOrigins: string[],
 * logLevel: string, databaseUrl: string | undefined, auth: object}} Configuración normalizada.
 * @throws {ConfigurationError} Si algún valor o configuración de producción es inválido.
 */
export function parseEnv(input) {
  const result = schema.safeParse(input);
  const fields = result.success ? [] : result.error.issues.map((issue) => issue.path[0]);
  if (input.NODE_ENV === 'production' && !input.CORS_ORIGINS) fields.push('CORS_ORIGINS');
  if (fields.length) {
    throw new ConfigurationError(`Configuración inválida: ${[...new Set(fields)].join(', ')}`);
  }
  const env = result.data;
  let auth;
  try {
    auth = parseAuthEnv(input, { nodeEnv: env.NODE_ENV, corsOrigins: env.CORS_ORIGINS });
  } catch (error) {
    throw new ConfigurationError(error.message);
  }
  return Object.freeze({
    nodeEnv: env.NODE_ENV,
    host: env.HOST,
    port: env.PORT,
    corsOrigins: env.CORS_ORIGINS,
    logLevel: env.LOG_LEVEL,
    databaseUrl: env.DATABASE_URL,
    auth,
  });
}
