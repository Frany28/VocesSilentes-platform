import pino from 'pino';

/**
 * Crea logs JSON. La lista de campos permitidos evita cuerpos, URLs y secretos.
 * @param {string} level Nivel validado por parseEnv.
 * @param {import('node:stream').Writable} [destination] Destino opcional para pruebas.
 * @returns {import('pino').Logger} Logger estructurado.
 */
export function createLogger(level, destination) {
  return pino(
    {
      level,
      base: { service: 'vocessilentes-api' },
      serializers: {
        err: (error) => ({ type: error?.name, code: error?.code }),
        req: (request) => ({ id: request.id, method: request.method }),
        res: (response) => ({ statusCode: response.statusCode }),
      },
      redact: {
        paths: [
          'password',
          'token',
          'authorization',
          'cookie',
          'databaseUrl',
          'req.headers',
          'req.body',
          'req.url',
          'res.headers',
        ],
        remove: true,
      },
    },
    destination,
  );
}
