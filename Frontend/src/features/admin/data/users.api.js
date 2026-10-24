import { requestJson } from '../../../lib/http.js';

async function write(path, method, input, signal) {
  // Se obtiene el CSRF vigente de auth; no se emite ni almacena otra credencial de sesión.
  const { data } = await requestJson('auth/csrf', { signal });
  return (
    await requestJson(path, {
      method,
      signal,
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': data.csrfToken },
      body: JSON.stringify(input),
    })
  ).data.user;
}

/**
 * Cliente CRUD administrativo real, con cookies y AbortSignal existentes.
 * @returns {object} list/get/create/edit/delete; propaga ApiError, sin reintentos de escrituras.
 */
export function createUsersApi() {
  return {
    summary: async (signal) => (await requestJson('admin/summary', { signal })).data,
    state: (id, isActive, signal) =>
      write(`admin/users/${encodeURIComponent(id)}/state`, 'PATCH', { isActive }, signal),
    list: async ({ q = '', role = '', page = 1, pageSize = 3 }, signal) => {
      const query = new URLSearchParams({ q, page: String(page), pageSize: String(pageSize) });
      if (role) query.set('role', role);
      return (await requestJson('admin/users', { signal, query })).data;
    },
    get: async (id, signal) =>
      (await requestJson(`admin/users/${encodeURIComponent(id)}`, { signal })).data.user,
    create: (input, signal) => write('admin/users', 'POST', input, signal),
    edit: (id, input, signal) =>
      write(`admin/users/${encodeURIComponent(id)}`, 'PATCH', input, signal),
    delete: (id, signal) =>
      write(`admin/users/${encodeURIComponent(id)}`, 'DELETE', undefined, signal),
  };
}
