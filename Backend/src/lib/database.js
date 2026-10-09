import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Construye Prisma con el adaptador PostgreSQL sin abrir conexiones todavía.
 * @param {string | undefined} connectionString URL privada; undefined desactiva persistencia.
 * @returns {Promise<import('../../generated/client.js').PrismaClient | undefined>} Cliente o undefined.
 * @throws {Error} Si falta el cliente generado; ejecutar pnpm db:generate.
 */
export async function createDatabase(connectionString) {
  if (!connectionString) return undefined;
  const { PrismaClient } = await import('../../generated/client.js');
  const adapter = new PrismaPg(
    { connectionString, connectionTimeoutMillis: 5000 },
    { schema: 'vocessilentes' },
  );
  return new PrismaClient({ adapter });
}
