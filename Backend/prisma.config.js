import { defineConfig } from 'prisma/config';
import { loadEnv } from './src/config/load-env.js';

loadEnv();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
