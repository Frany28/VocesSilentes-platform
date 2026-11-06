import { readFile } from 'node:fs/promises';

const files = {
  '/__local-lsv/model': 'lsv-experimental-model.json',
  '/__local-lsv/samples': 'experimental-samples.json',
};

/**
 * Sirve dos artefactos privados fijos solo desde Vite dev y conexiones de loopback; no entra al build.
 * @returns {object} Plugin de desarrollo sin rutas arbitrarias ni escrituras.
 */
export function localLsvPlugin() {
  return {
    name: 'local-lsv-experiment',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const file = files[request.url];
        if (!file) return next();
        if (
          request.method !== 'GET' ||
          !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(request.socket.remoteAddress) ||
          !/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(request.headers.host ?? '') ||
          (request.headers.origin && request.headers.origin !== `http://${request.headers.host}`)
        ) {
          response.statusCode = 403;
          response.end();
          return;
        }
        response.setHeader('Cache-Control', 'no-store');
        try {
          const bytes = await readFile(
            new URL(`../.local/lsv-experimental/${file}`, import.meta.url),
          );
          response.setHeader('Content-Type', 'application/json');
          response.end(bytes);
        } catch {
          response.statusCode = 404;
          response.end();
        }
      });
    },
  };
}
