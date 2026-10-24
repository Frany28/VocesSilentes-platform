import { requestJson } from '../../lib/http.js';

async function write(path, method, body, signal, binary = false) {
  const { data } = await requestJson('auth/csrf', { signal });
  return requestJson(path, {
    method,
    signal,
    headers: {
      'Content-Type': binary ? 'application/octet-stream' : 'application/json',
      'X-CSRF-Token': data.csrfToken,
    },
    body: binary ? body : JSON.stringify(body),
  });
}

/**
 * Cliente de reportes con cookies/CSRF existentes; el servidor determina identidad, rutas y permisos.
 * @returns {object} Operaciones reales con AbortSignal; no repite escrituras automáticamente.
 */
export function createReportsApi() {
  return {
    create: async (input, signal) => (await write('reports', 'POST', input, signal)).data.report,
    updateStatus: async (id, input, signal) =>
      (await write(`reports/${id}/status`, 'PATCH', input, signal)).data.report,
    attach: (id, file, signal) => write(`reports/${id}/evidence`, 'PUT', file, signal, true),
    get: async (id, signal) => (await requestJson(`reports/${id}`, { signal })).data.report,
    list: async (query, signal) => (await requestJson('reports', { query, signal })).data,
    access: async (id, signal) =>
      (await requestJson(`reports/${id}/evidence/access`, { signal })).data,
  };
}

export const reportsApi = createReportsApi();
