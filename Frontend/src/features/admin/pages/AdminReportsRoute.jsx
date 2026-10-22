import { useSearchParams } from 'react-router';
import { useReportResource } from '../../reports/use-report-resource.js';
import { AdminReports } from './AdminReports.jsx';

/**
 * Conecta el listado diseñado con páginas reales; no calcula recuentos globales desde una página.
 * @returns {import('react').ReactElement} Listado administrativo consultado con sesión vigente.
 */
export function AdminReportsRoute() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const filter = params.get('filter') || '';
  const requested = Number(params.get('page') || 1);
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;
  const result = useReportResource(
    undefined,
    new URLSearchParams({ q: query, status: filter, page: String(page) }).toString(),
  );
  const change = (name, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(name, String(value));
    else next.delete(name);
    if (name !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };
  const list = {
    items: result.data?.reports ?? [],
    total: result.data?.total ?? 0,
    pages: result.data?.pages ?? 1,
    page,
    pageSize: 30,
    query,
    filter,
    search: (value) => change('q', value),
    select: (value) => change('filter', value),
    go: (value) => change('page', value),
    reset: () => setParams({}, { replace: true }),
  };
  return (
    <AdminReports
      reports={list.items}
      status={result.status}
      error={result.error}
      retry={result.retry}
      serverList={list}
      complete={false}
    />
  );
}
