import pg from 'pg';
import { loadEnv } from '../src/config/load-env.js';
import { migrationDatasource } from './migration-config.js';

loadEnv();
const { url } = migrationDatasource(process.env);
if (!url) throw new Error('Configura DIRECT_URL privada para inspeccionar las migraciones');
const client = new pg.Client({
  connectionString: url,
  connectionTimeoutMillis: 5000,
  query_timeout: 10000,
});
try {
  await client.connect();
  await client.query('BEGIN READ ONLY');
  const tables = await client.query(`
    SELECT schemaname, tablename FROM pg_tables
    WHERE schemaname IN ('public', 'vocessilentes') ORDER BY 1, 2
  `);
  console.log('Tablas de aplicación:', tables.rows);
  const historyExists = tables.rows.some((table) => table.tablename === '_prisma_migrations');
  if (historyExists) {
    for (const table of tables.rows.filter((item) => item.tablename === '_prisma_migrations')) {
      // Solo los dos esquemas literales de la consulta anterior pueden interpolarse.
      const history = await client.query(`
        SELECT migration_name, finished_at IS NOT NULL AS finished,
          rolled_back_at IS NOT NULL AS rolled_back
        FROM "${table.schemaname}"."_prisma_migrations" ORDER BY started_at
      `);
      console.log('Historial Prisma:', history.rows);
    }
  } else console.log('Sin historial Prisma.');
  await client.query('ROLLBACK');
} catch {
  console.error('No se pudo inspeccionar PostgreSQL; revisa conexión y permisos privados.');
  process.exitCode = 1;
} finally {
  await client.end();
}
