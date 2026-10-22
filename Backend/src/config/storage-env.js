import { z } from 'zod';

/**
 * Valida credenciales exclusivas del servidor; no deriva secretos de la conexión PostgreSQL.
 * @param {object} input Entorno privado.
 * @returns {object | undefined} S3 validado o deshabilitado sin variables de conexión.
 * @throws {Error} Nombres de variables inválidas, sin sus valores.
 */
export function parseStorageEnv(input) {
  const fields = ['S3_ENDPOINT', 'S3_REGION', 's3_access_key_id', 's3_secret_access_key'];
  if (!fields.some((name) => input[name])) return undefined;
  const result = z
    .object({
      S3_ENDPOINT: z
        .string()
        .url()
        .refine((value) => {
          const url = new URL(value);
          return (
            url.protocol === 'https:' &&
            /^[a-z0-9-]+(?:\.storage)?\.supabase\.co$/.test(url.hostname) &&
            /^\/storage\/v1\/s3\/?$/.test(url.pathname) &&
            !url.username &&
            !url.password &&
            !url.search &&
            !url.hash &&
            !url.port
          );
        }),
      S3_REGION: z.string().regex(/^[a-z][a-z0-9-]{1,40}$/),
      s3_access_key_id: z.string().min(1),
      s3_secret_access_key: z.string().min(20),
    })
    .safeParse(input);
  if (!result.success) throw new Error(`Configuración S3 inválida: ${fields.join(', ')}`);
  const endpoint = new URL(result.data.S3_ENDPOINT);
  const project = endpoint.hostname.split('.')[0];
  for (const name of ['DATABASE_URL', 'DIRECT_URL']) {
    if (!input[name] || !URL.canParse(input[name])) continue;
    const url = new URL(input[name]);
    const ref = url.hostname.endsWith('.pooler.supabase.com')
      ? decodeURIComponent(url.username).split('.').at(-1)
      : /^db\.([^.]+)\.supabase\.co$/.exec(url.hostname)?.[1];
    if (ref && ref !== project)
      throw new Error(`S3_ENDPOINT y ${name} deben pertenecer al mismo proyecto`);
  }
  return Object.freeze({
    endpoint: result.data.S3_ENDPOINT.replace(/\/$/, ''),
    region: result.data.S3_REGION,
    credentials: Object.freeze({
      accessKeyId: result.data.s3_access_key_id,
      secretAccessKey: result.data.s3_secret_access_key,
    }),
  });
}
