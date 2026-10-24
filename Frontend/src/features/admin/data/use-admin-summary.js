import { useEffect, useState } from 'react';
import { useAdmin } from './admin-context.js';

/**
 * Consulta indicadores globales al entrar al dashboard y permite reintentar sin datos simulados.
 * @returns {object} status/data/error/retry con cancelación de lecturas obsoletas.
 */
export function useAdminSummary() {
  const { api } = useAdmin();
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({ status: 'loading' });
  useEffect(() => {
    const request = new AbortController();
    api.summary(request.signal).then(
      (data) => {
        if (!request.signal.aborted) setResult({ status: 'ready', data });
      },
      (error) => {
        if (!request.signal.aborted) setResult({ status: 'error', error });
      },
    );
    return () => request.abort();
  }, [api, revision]);
  return {
    ...result,
    retry: () => {
      setResult({ status: 'loading' });
      setRevision((value) => value + 1);
    },
  };
}
