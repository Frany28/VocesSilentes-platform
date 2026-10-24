import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/client.js';

/**
 * Prepara PostgreSQL WASM/TCP efímero sin leer .env ni conectar a servicios externos.
 * @param {{seed?: boolean}} [options] Reconstruye SQL académico y sus datos si se solicita explícitamente.
 * @returns {Promise<object>} Motor, Prisma y cierre; todos los datos se descartan al salir.
 */
export async function createAcademicDatabase({ seed = false } = {}) {
  const db = new PGlite();
  let socket;
  let database;
  const close = async () => {
    await database?.$disconnect();
    await socket?.stop();
    await db.close();
  };
  try {
    if (seed) {
      for (const name of ['01_schema.sql', '02_seed.sql']) {
        await db.exec(
          await readFile(new URL(`../../../docs/module-ii/sql/${name}`, import.meta.url), 'utf8'),
        );
      }
    } else {
      const directory = new URL('../../prisma/migrations/', import.meta.url);
      const names = (await readdir(directory)).filter((name) => /^\d/.test(name)).sort();
      for (const name of names)
        await db.exec(await readFile(new URL(`${name}/migration.sql`, directory), 'utf8'));
    }
    socket = new PGLiteSocketServer({ db, host: '127.0.0.1', port: 0, inspect: false });
    await socket.start();
    database = new PrismaClient({
      adapter: new PrismaPg(
        {
          connectionString: `postgresql://postgres@${socket.getServerConn()}/postgres?sslmode=disable`,
          max: 1,
        },
        { schema: 'vocessilentes' },
      ),
      log: [],
    });
    await database.$connect();
    return { db, database, close };
  } catch (error) {
    await close();
    throw error;
  }
}
