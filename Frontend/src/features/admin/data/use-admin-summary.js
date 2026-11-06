import { useEffect, useState } from 'react';
import { useAdmin } from './admin-context.js';

/**
 * Consulta indicadores globales al entrar al dashboard y permite reintentar sin datos simulados.
 * @returns {object} status/data/error/retry con cancelación de lecturas obsoletas.
 */
export function useAdminSummary() {
  const { api } = useAdmin();
  const [filters, setFilters] = useState({});
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({ status: 'loading' });
  useEffect(() => {
    const request = new AbortController();
    api.summary(request.signal, filters).then(
      (data) => {
        if (!request.signal.aborted) setResult({ status: 'ready', data });
      },
      (error) => {
        if (!request.signal.aborted) setResult({ status: 'error', error });
      },
    );
    return () => request.abort();
  }, [api, revision, filters]);
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== 'hidden') setRevision((value) => value + 1);
    };
    window.addEventListener('focus', refresh);
    const timer = window.setInterval(refresh, 60000);
    return () => { window.removeEventListener('focus', refresh); window.clearInterval(timer); };
  }, []);
  return {
    ...result,
    apply: (selection) => {
      setResult({ status: 'loading' });
      setFilters(selection.period === '30' ? {} : selection);
    },
    retry: () => {
      setResult({ status: 'loading' });
      setRevision((value) => value + 1);
    },
  };
}
