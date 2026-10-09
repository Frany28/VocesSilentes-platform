import { createServer } from 'node:http';
import { once } from 'node:events';
import { createApp } from './app.js';
import { ConfigurationError, parseEnv } from './config/env.js';
import { loadEnv } from './config/load-env.js';
import { createDatabase } from './lib/database.js';
import { createLogger } from './lib/logger.js';
import { closeResources } from './lib/shutdown.js';

loadEnv();
let database;
let logger;
try {
  const config = parseEnv(process.env);
  logger = createLogger(config.logLevel);
  database = await createDatabase(config.databaseUrl);
  if (database) await database.$connect();
  const server = createServer(createApp(config, logger));
  server.listen(config.port, config.host);
  await once(server, 'listening');
  logger.info({ port: config.port, persistence: Boolean(database) }, 'API iniciada');

  let closing = false;
  const shutdown = async () => {
    if (closing) return;
    closing = true;
    logger.info('Cerrando API');
    const deadline = setTimeout(() => {
      server.closeAllConnections();
      logger.error('Tiempo de cierre agotado');
      process.exit(1);
    }, 10000);
    try {
      await closeResources(server, database);
      clearTimeout(deadline);
      process.exitCode = 0;
    } catch (error) {
      logger.error({ err: error }, 'No se pudieron cerrar los recursos');
      process.exit(1);
    }
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (error) {
  if (logger) logger.fatal({ err: error }, 'No se pudo iniciar la API');
  else console.error(error instanceof ConfigurationError ? error.message : 'Error de arranque');
  await database?.$disconnect();
  process.exitCode = 1;
}
