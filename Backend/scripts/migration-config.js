import { z } from 'zod';

const connection = z
  .string()
  .url()
  .refine((value) => {
    if (!URL.canParse(value)) return false;
    const url = new URL(value);
    return ['postgres:', 'postgresql:'].includes(url.protocol) && url.port !== '6543';
  });

function databaseIdentity(url) {
  const project = url.hostname.endsWith('.pooler.supabase.com')
    ? decodeURIComponent(url.username).split('.').at(-1)
    : /^db\.([^.]+)\.supabase\.co$/.exec(url.hostname)?.[1];
  const host = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    ? 'loopback'
    : url.hostname;
  return `${project ? `supabase:${project}` : host}${url.pathname || '/postgres'}`;
}

/**
 * Valida conexiones CLI privadas, separa la shadow DB y fija el esquema de migraciones.
 * @param {Record<string, string | undefined>} input Entorno privado; no se modifica ni registra.
 * @returns {{url: string, shadowDatabaseUrl: string | undefined}} Datasource de Prisma 7.
 * @throws {Error} Por variables inválidas, pool Transaction o shadow igual al destino.
 */
export function migrationDatasource(input) {
  const urls = {};
  for (const name of ['DIRECT_URL', 'SHADOW_DATABASE_URL']) {
    if (!input[name]) continue;
    if (!connection.safeParse(input[name]).success)
      throw new Error(`Configuración inválida: ${name}`);
    urls[name] = new URL(input[name]);
    if (urls[name].searchParams.get('pgbouncer') === 'true') {
      throw new Error(`Se requiere conexión directa o Session: ${name}`);
    }
    urls[name].searchParams.set('schema', 'vocessilentes');
  }
  if (urls.SHADOW_DATABASE_URL && !urls.DIRECT_URL) throw new Error('Falta DIRECT_URL');
  if (
    urls.SHADOW_DATABASE_URL &&
    databaseIdentity(urls.DIRECT_URL) === databaseIdentity(urls.SHADOW_DATABASE_URL)
  ) {
    throw new Error('SHADOW_DATABASE_URL debe identificar una base independiente del destino');
  }
  return {
    url: urls.DIRECT_URL?.href ?? '',
    shadowDatabaseUrl: urls.SHADOW_DATABASE_URL?.href,
  };
}
