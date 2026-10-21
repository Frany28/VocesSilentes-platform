import { useSearchParams } from 'react-router';
/**
 * Búsqueda, filtro y paginación en URL sobre la colección proporcionada por el consumidor.
 * @param {object[]} items Colección autorizada; nunca se usa como fallback de una consulta fallida.
 * @param {string} field Campo enumerado de filtro.
 * @returns {object} Página de tres elementos, total, query, filter y setters.
 */
export function useAdminList(items, field) {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const filter = params.get('filter') ?? '';
  const matching = items.filter(
    (item) =>
      (!filter || String(item[field]) === filter) &&
      [item.firstName, item.lastName, item.username, item.email, item.reference, item.title]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('es')
        .includes(query.trim().toLocaleLowerCase('es')),
  );
  const pages = Math.max(1, Math.ceil(matching.length / 3));
  const requested = Number(params.get('page') ?? 1);
  const page = Number.isInteger(requested) ? Math.min(pages, Math.max(1, requested)) : 1;
  const change = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, String(value));
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };
  return {
    query,
    filter,
    page,
    pages,
    total: matching.length,
    items: matching.slice((page - 1) * 3, page * 3),
    search: (value) => change('q', value),
    select: (value) => change('filter', value),
    go: (value) => change('page', value),
    reset: () => setParams({}, { replace: true }),
  };
}
