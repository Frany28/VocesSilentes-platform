import { ApiError } from './api-error.js';
import { publicConfig } from './config.js';
import { invalidateSession } from './session-events.js';
import { retryAfterSeconds } from './retry-after.js';

/**
 * Solicita JSON dentro de la API configurada y normaliza sus errores.
 * @template T
 * @param {string} path Ruta relativa a /api; no admite URLs ni traversal.
 * @param {RequestInit} [options] Opciones fetch, incluido AbortSignal.
 * @returns {Promise<T | undefined>} JSON o undefined para HTTP 204.
 * @throws {ApiError} HTTP_ERROR, NETWORK_ERROR, REQUEST_ABORTED o INVALID_RESPONSE.
 */
export async function requestJson(path, options = {}) {
  if (!/^\/?[\w/-]+$/.test(path)) {
    throw new ApiError('INVALID_PATH', 'Ruta de API inválida');
  }
  const url = `${publicConfig.apiUrl}/${path.replace(/^\//, '')}`;
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  try {
    const response = await fetch(url, { ...options, headers, credentials: 'include' });
    options.signal?.throwIfAborted();
    if (response.status === 204) return undefined;
    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new ApiError(
        'INVALID_RESPONSE',
        'La API devolvió una respuesta ilegible',
        response.status,
        retryAfterSeconds(response.headers.get('Retry-After')),
      );
    }
    options.signal?.throwIfAborted();
    if (!response.ok) {
      if (response.status === 401 && payload?.error?.code === 'UNAUTHENTICATED')
        invalidateSession();
      throw new ApiError(
        typeof payload?.error?.code === 'string' ? payload.error.code : 'HTTP_ERROR',
        typeof payload?.error?.message === 'string' ? payload.error.message : 'Error de API',
        response.status,
        retryAfterSeconds(response.headers.get('Retry-After')),
      );
    }
    return payload;
  } catch (error) {
    if (options.signal?.aborted || error?.name === 'AbortError') {
      throw new ApiError('REQUEST_ABORTED', 'Petición cancelada');
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError('NETWORK_ERROR', 'No se pudo contactar con la API');
  }
}
