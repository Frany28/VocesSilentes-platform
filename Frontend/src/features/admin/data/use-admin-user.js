import { useEffect, useState } from 'react';
import { useAdmin } from './admin-context.js';

/**
 * Carga el UUID real al abrir detalle/edición; los IDs demo solo leen la colección identificada.
 * @param {string | undefined} id Identificador de ruta; undefined para creación.
 * @returns {object} loading/ready/error, cuenta y retry; lecturas abortables sin datos demo como fallback.
 */
export function useAdminUser(id) {
  const { api, users } = useAdmin();
  const demo = id?.startsWith('demo-') ? users.find((item) => item.id === id) : undefined;
  const [result, setResult] = useState({
    status: id && !demo ? 'loading' : 'ready',
    user: demo,
    id,
  });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!id || id.startsWith('demo-')) return;
    const controller = new AbortController();
    api
      .get(id, controller.signal)
      .then((user) => {
        if (!controller.signal.aborted)
          setResult({ status: 'ready', user: { ...user, source: 'server' }, id });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ status: 'error', error, id });
      });
    return () => controller.abort();
  }, [api, id, revision]);
  return {
    ...(!id
      ? { status: 'ready' }
      : id?.startsWith('demo-')
        ? { status: demo ? 'ready' : 'error', user: demo }
        : result.id === id
          ? result
          : { status: 'loading' }),
    retry: () => {
      setResult({ status: 'loading', id });
      setRevision((value) => value + 1);
    },
  };
}
