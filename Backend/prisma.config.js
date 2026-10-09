import { defineConfig } from 'prisma/config';
import { loadEnv } from './src/config/load-env.js';
import { migrationDatasource } from './scripts/migration-config.js';

loadEnv();

export default defineConfig({
  schema: 'prisma',
  migrations: { path: 'prisma/migrations' },
  // La CLI nunca reutiliza el pool Transaction del backend.
  datasource: migrationDatasource(process.env),
});
