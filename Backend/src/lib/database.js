import { PrismaPg } from '@prisma/adapter-pg';
import { attachDatabasePool } from '@vercel/functions';
import pg from 'pg';
import { secureDatabaseUrl } from '../config/database-url.js';

/**
 * Construye Prisma con el adaptador PostgreSQL sin abrir conexiones todavía.
 * @param {string | undefined} connectionString URL privada; undefined desactiva persistencia.
 * @param {{vercel?: boolean}} [options] Libera conexiones ociosas antes de suspender en Vercel.
 * @returns {Promise<import('../../generated/client.js').PrismaClient | undefined>} Cliente o undefined.
 * @throws {Error} Si falta el cliente generado; ejecutar pnpm db:generate.
 */
export async function createDatabase(connectionString, { vercel = false } = {}) {
  if (!connectionString) return undefined;
  const { PrismaClient } = await import('../../generated/client.js');
  const poolConfig = {
    connectionString: secureDatabaseUrl(connectionString),
    connectionTimeoutMillis: 5000,
  };
  const pool = vercel
    ? new pg.Pool({ ...poolConfig, max: 5, idleTimeoutMillis: 5000 })
    : poolConfig;
  if (vercel) attachDatabasePool(pool);
  const adapter = new PrismaPg(pool, { schema: 'vocessilentes', disposeExternalPool: vercel });
  return new PrismaClient({ adapter, transactionOptions: { maxWait: 10000, timeout: 15000 } });
}
