import { requestJson } from '../../lib/http.js';

/**
 * Crea el cliente de autenticación con CSRF en memoria y soporte de AbortSignal.
 * @returns {object} me/login/register/logout/clearCsrf; propaga ApiError sin ocultar fallos de red.
 */
export function createAuthApi() {
  let csrfToken;
  let csrfRequest;
  const getCsrf = async (signal) => {
    if (csrfToken) return csrfToken;
    csrfRequest ??= requestJson('auth/csrf', { signal })
      .then((payload) => {
        csrfToken = payload.data.csrfToken;
        return csrfToken;
      })
      .finally(() => {
        csrfRequest = undefined;
      });
    return csrfRequest;
  };
  const mutate = async (path, body, signal) => {
    const token = await getCsrf(signal);
    try {
      const result = await requestJson(`auth/${path}`, {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
        body: JSON.stringify(body ?? {}),
      });
      csrfToken = result?.data?.csrfToken;
      return result?.data?.user;
    } catch (error) {
      if (error.code === 'CSRF_INVALID') csrfToken = undefined;
      throw error;
    }
  };
  return {
    me: async (signal) => (await requestJson('auth/me', { signal })).data.user,
    login: (input, signal) => mutate('login', input, signal),
    register: (input, signal) => mutate('register', input, signal),
    logout: (signal) => mutate('logout', undefined, signal),
    clearCsrf: () => {
      csrfToken = undefined;
    },
  };
}
