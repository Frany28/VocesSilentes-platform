import { useEffect, useState } from 'react';
import { useAdmin } from './admin-context.js';

/**
 * Consulta la cuenta actual al servidor; cancela y descarta lecturas obsoletas, sin fallback sintético.
 * @param {string | undefined} id UUID de ruta; undefined para creación.
 * @returns {object} status/user/error/retry; errores HTTP se conservan para el reintento manual.
 */
export function useAdminUser(id) {
  const { api } = useAdmin();
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({});
  const key = `${id}:${revision}`;
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    api.get(id, controller.signal).then(
      (user) => {
        if (!controller.signal.aborted) setResult({ status: 'ready', user, key });
      },
      (error) => {
        if (!controller.signal.aborted) setResult({ status: 'error', error, key });
      },
    );
    return () => controller.abort();
  }, [api, id, key]);
  return {
    ...(!id ? { status: 'ready' } : result.key === key ? result : { status: 'loading' }),
    retry: () => setRevision((value) => value + 1),
  };
}
