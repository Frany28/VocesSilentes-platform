import { fileURLToPath } from 'node:url';

/**
 * Exige TLS y verificación del certificado para Supabase; conserva conexiones locales de pruebas.
 * @param {string} value URL privada PostgreSQL; nunca se registra.
 * @returns {string} URL normalizada para pg/Prisma sin modificar el entorno original.
 */
export function secureDatabaseUrl(value) {
  const url = new URL(value);
  if (
    url.hostname.endsWith('.pooler.supabase.com') ||
    /^db\.[^.]+\.supabase\.co$/.test(url.hostname)
  ) {
    url.searchParams.set('sslmode', 'verify-full');
    if (!url.searchParams.has('sslrootcert'))
      url.searchParams.set(
        'sslrootcert',
        fileURLToPath(new URL('../../certs/supabase-root-2021.crt', import.meta.url)),
      );
  }
  return url.href;
}
