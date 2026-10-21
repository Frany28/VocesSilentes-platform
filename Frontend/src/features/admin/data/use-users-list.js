import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAdmin } from './admin-context.js';

/**
 * Consulta páginas PostgreSQL y conserva búsqueda/rol/página en URL, cancelando lecturas obsoletas.
 * @param {{census?: boolean}} [options] Censo sin filtros de URL para el resumen, con una sola fila solicitada.
 * @returns {object} items/total/pages, estados reales y acciones de filtro, página y reintento.
 */
export function useUsersList({ census = false } = {}) {
  const { api } = useAdmin();
  const [params, setParams] = useSearchParams();
  const query = census ? '' : (params.get('q') ?? '');
  const filter = census ? '' : (params.get('filter') ?? '');
  const requested = Number(params.get('page') ?? 1);
  const page = !census && Number.isInteger(requested) && requested > 0 ? requested : 1;
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({});
  const key = JSON.stringify([query, filter, page, revision, census]);
  useEffect(() => {
    const controller = new AbortController();
    api.list({ q: query, role: filter, page, pageSize: census ? 1 : 3 }, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ ...data, key, status: 'ready' });
      },
      (error) => {
        if (!controller.signal.aborted) setResult({ key, status: 'error', error });
      },
    );
    return () => controller.abort();
  }, [api, query, filter, page, key, census]);
  const change = (field, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(field, String(value));
    else next.delete(field);
    if (field !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };
  return {
    ...(result.key === key ? result : { status: 'loading' }),
    items:
      result.key === key ? (result.items ?? []).map((user) => ({ ...user, source: 'server' })) : [],
    query,
    filter,
    page,
    search: (value) => change('q', value),
    select: (value) => change('filter', value),
    go: (value) => change('page', value),
    reset: () => setParams({}, { replace: true }),
    retry: () => setRevision((value) => value + 1),
  };
}
