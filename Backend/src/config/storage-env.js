import { z } from 'zod';

/**
 * Valida credenciales exclusivas del servidor; no deriva secretos de la conexión PostgreSQL.
 * @param {object} input Entorno privado.
 * @returns {object | undefined} Storage deshabilitado si faltan ambas variables.
 * @throws {Error} Nombres de variables inválidas, sin sus valores.
 */
export function parseStorageEnv(input) {
  if (!input.SUPABASE_URL && !input.SUPABASE_SERVICE_ROLE_KEY) return undefined;
  const result = z
    .object({
      SUPABASE_URL: z
        .string()
        .url()
        .refine((value) => {
          const url = new URL(value);
          return url.protocol === 'https:' && url.origin === value;
        }),
      SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
    })
    .safeParse(input);
  if (!result.success)
    throw new Error('Configuración inválida: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  return Object.freeze({
    url: result.data.SUPABASE_URL,
    key: result.data.SUPABASE_SERVICE_ROLE_KEY,
  });
}
