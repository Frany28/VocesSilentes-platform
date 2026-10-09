import { loadEnv } from '../src/config/load-env.js';
import { parseEnv } from '../src/config/env.js';
import { createDatabase } from '../src/lib/database.js';

loadEnv();
const config = parseEnv(process.env);
if (!config.databaseUrl)
  throw new Error('Configura DATABASE_URL privada antes de ejecutar db:check');
const database = await createDatabase(config.databaseUrl);
try {
  await database.$connect();
  await database.$queryRaw`SELECT 1`;
  console.log('Conexión PostgreSQL comprobada con SELECT 1.');
} catch {
  console.error('No se pudo verificar PostgreSQL. Revisa el servicio y la configuración privada.');
  process.exitCode = 1;
} finally {
  await database.$disconnect();
}
