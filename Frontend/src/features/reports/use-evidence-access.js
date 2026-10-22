import { useEffect, useState } from 'react';
import { reportsApi } from './reports.api.js';

/**
 * Solicita acceso autorizado temporal y renueva antes de expirar; no persiste URLs firmadas.
 * @param {string} id Reporte consultado.
 * @returns {object} src/status/error/retry; cancela lecturas y temporizador al desmontar.
 */
export function useEvidenceAccess(id) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({});
  const key = `${id}:${revision}`;
  useEffect(() => {
    const controller = new AbortController();
    let timer;
    reportsApi.access(id, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return;
        setResult({ ...data, key, status: 'ready' });
        timer = setTimeout(
          () => setRevision((value) => value + 1),
          Math.max(1000, Date.parse(data.expiresAt) - Date.now() - 15000),
        );
      },
      (error) => {
        if (!controller.signal.aborted) setResult({ key, status: 'error', error });
      },
    );
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [id, key]);
  return {
    ...(result.key === key ? result : { status: 'loading' }),
    retry: () => setRevision((value) => value + 1),
  };
}
