import { requestJson } from '../../lib/http.js';

async function write(path, method, body, signal, query, binary = false) {
  const { data } = await requestJson('auth/csrf', { signal });
  return requestJson(`account/${path}`, {
    method,
    signal,
    query,
    headers: {
      'Content-Type': binary ? 'application/octet-stream' : 'application/json',
      'X-CSRF-Token': data.csrfToken,
    },
    body: binary ? body : JSON.stringify(body),
  });
}

/** Operaciones de la cuenta autenticada; conservan cookies, CSRF y AbortSignal. */
export const accountApi = {
  profile: async (input, signal) => (await write('profile', 'PATCH', input, signal)).data.user,
  password: (input, signal) => write('password', 'PUT', input, signal),
  photo: async (file, zoom, signal) =>
    (await write('photo', 'PUT', file, signal, new URLSearchParams({ zoom: String(zoom) }), true))
      .data.user,
  removePhoto: async (signal) => (await write('photo', 'DELETE', {}, signal)).data.user,
};
