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
 * Cliente de los tres endpoints administrativos reales, con cookies y AbortSignal existentes.
 * @returns {object} get/create/edit; propaga ApiError, sin reintentos automáticos de escrituras.
 */
export function createUsersApi() {
  return {
    get: async (id, signal) =>
      (await requestJson(`admin/users/${encodeURIComponent(id)}`, { signal })).data.user,
    create: (input, signal) => write('admin/users', 'POST', input, signal),
    edit: (id, input, signal) =>
      write(`admin/users/${encodeURIComponent(id)}`, 'PATCH', input, signal),
  };
}
