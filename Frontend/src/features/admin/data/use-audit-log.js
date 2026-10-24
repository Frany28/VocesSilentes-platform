import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { requestJson } from '../../../lib/http.js';

/**
 * Lee páginas de bitácora autorizadas por ADMIN, sin caché ni sustitución por fixtures.
 * @returns {object} Página, estado, reintento y navegación; cancela lecturas obsoletas.
 */
export function useAuditLog() {
  const [params, setParams] = useSearchParams();
  const requested = Number(params.get('page') ?? 1);
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({});
  const key = `${page}:${revision}`;
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ page: String(page), pageSize: '5' });
    requestJson('admin/audit-logs', { signal: controller.signal, query }).then(
      ({ data }) => {
        if (!controller.signal.aborted) setResult({ ...data, key, status: 'ready' });
      },
      (error) => {
        if (!controller.signal.aborted) setResult({ key, status: 'error', error });
      },
    );
    return () => controller.abort();
  }, [page, key]);
  return {
    ...(result.key === key ? result : { status: 'loading', items: [] }),
    page,
    go: (value) => setParams({ page: String(value) }),
    retry: () => setRevision((value) => value + 1),
  };
}
