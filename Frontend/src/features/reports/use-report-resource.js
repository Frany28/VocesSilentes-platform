import { useEffect, useState } from 'react';
import { reportsApi } from './reports.api.js';

/**
 * Consulta detalle/página con cancelación y descarte de respuestas tardías.
 * @param {string | undefined} id UUID para detalle; undefined para listado.
 * @param {string} [query] Consulta serializada para listado.
 * @returns {object} Datos reales, estado y reintento.
 */
export function useReportResource(id, query = '') {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({});
  const key = JSON.stringify([id, query, revision]);
  useEffect(() => {
    const controller = new AbortController();
    const read = id
      ? reportsApi.get(id, controller.signal)
      : reportsApi.list(new URLSearchParams(query), controller.signal);
    read.then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key, data, status: 'ready' });
      },
      (error) => {
        if (!controller.signal.aborted) setResult({ key, error, status: 'error' });
      },
    );
    return () => controller.abort();
  }, [id, query, key]);
  return {
    ...(result.key === key ? result : { status: 'loading' }),
    retry: () => setRevision((value) => value + 1),
  };
}
