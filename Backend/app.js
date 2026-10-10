import express from 'express';
import { createApp } from './src/app.js';
import { parseEnv } from './src/config/env.js';
import { createDatabase } from './src/lib/database.js';
import { createLogger } from './src/lib/logger.js';
import { createAuthService } from './src/modules/auth/auth.service.js';
import { createUsersService } from './src/modules/admin/users.service.js';

// Vercel/CLI proporcionan el entorno; esta entrada no carga archivos .env privados.
const config = parseEnv(process.env);
const vercel = process.env.VERCEL === '1';
// La conexión se abre al consultar datos; health no depende de PostgreSQL.
const database = await createDatabase(config.databaseUrl, { vercel });
const authService = database ? await createAuthService(database, config.auth) : undefined;
const usersService = database ? await createUsersService(database) : undefined;
const app = createApp(config, createLogger(config.logLevel), {
  app: express(),
  authService,
  usersService,
});

// Solo esta entrada acepta el salto de Vercel, que sobrescribe X-Forwarded-*.
// El servidor local conserva TRUST_PROXY_IPS; nunca detectamos el proveedor por headers.
if (vercel) app.set('trust proxy', 1);

export default app;
