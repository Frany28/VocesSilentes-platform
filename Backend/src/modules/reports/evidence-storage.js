import { HttpError } from '../../errors/http-error.js';
import { EVIDENCE_BUCKET } from './evidence-image.js';

/**
 * Adaptador REST Storage privado. Solo recibe rutas generadas internamente; nunca usa upsert ni lista objetos.
 * @param {object | undefined} config URL/clave privadas ya validadas.
 * @param {Function} [fetcher] Transporte inyectable para pruebas de contrato, no de conectividad.
 * @returns {object | undefined} upload/remove/sign/check; errores públicos sin respuestas ni credenciales.
 */
export function createEvidenceStorage(config, fetcher = fetch) {
  if (!config) return undefined;
  const call = async (path, options = {}) => {
    try {
      const response = await fetcher(`${config.url}/storage/v1/${path}`, {
        ...options,
        redirect: 'error',
        signal: AbortSignal.timeout(20000),
        headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, ...options.headers },
      });
      if (!response.ok) throw new Error('Storage rejected request');
      return response;
    } catch {
      throw new HttpError(
        503,
        'STORAGE_UNAVAILABLE',
        'No se pudo contactar con el almacenamiento. Reintenta.',
      );
    }
  };
  const objectPath = (path) => {
    if (!/^[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-f0-9-]{36}$/.test(path))
      throw new Error('Invalid internal evidence path');
    return `${EVIDENCE_BUCKET}/${path}`;
  };
  return {
    upload: async (path, image) => {
      await call(`object/${objectPath(path)}`, {
        method: 'POST',
        body: image.bytes,
        headers: {
          'Content-Type': image.mimeType,
          'x-upsert': 'false',
          'Cache-Control': 'no-store',
        },
      });
    },
    remove: async (path) => {
      objectPath(path);
      await call(`object/${EVIDENCE_BUCKET}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefixes: [path] }),
      });
    },
    sign: async (path) => {
      const response = await call(`object/sign/${objectPath(path)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresIn: 120 }),
      });
      const payload = await response.json();
      const url = new URL(`/storage/v1${payload.signedURL}`, config.url);
      if (
        url.origin !== config.url ||
        !url.pathname.startsWith(`/storage/v1/object/sign/${objectPath(path)}`)
      )
        throw new HttpError(503, 'STORAGE_UNAVAILABLE', 'Respuesta de almacenamiento inválida');
      return { src: url.href, expiresAt: new Date(Date.now() + 120000).toISOString() };
    },
    check: async () => (await call(`bucket/${EVIDENCE_BUCKET}`)).json(),
  };
}
