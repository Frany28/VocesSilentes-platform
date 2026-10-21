import { useEffect, useRef, useState } from 'react';

/**
 * Ejecuta únicamente una operación proporcionada; no define endpoints ni simula una resolución.
 * @param {Function | undefined} resolve Operación async (id, comentario, AbortSignal) que devuelve el reporte persistido.
 * @param {object} report Reporte original.
 * @returns {object} saved/pending/error/success/submit; cancela transporte al desmontar y evita doble envío.
 */
export function useReportResolution(resolve, report) {
  const [saved, setSaved] = useState(report);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const request = useRef();
  useEffect(() => () => request.current?.abort(), []);
  const submit = async (comment) => {
    if (!resolve || request.current) return false;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError(null);
    try {
      const result = await resolve(report.id, comment, controller.signal);
      if (controller.signal.aborted) return false;
      if (!result || result.id !== report.id || result.status !== 'RESOLVED')
        throw new Error('La respuesta no confirma la resolución. Vuelve a consultar el reporte.');
      setSaved(result);
      setSuccess(true);
      return true;
    } catch (reason) {
      if (!controller.signal.aborted) setError(reason.message);
      return false;
    } finally {
      if (!controller.signal.aborted) {
        request.current = undefined;
        setPending(false);
      }
    }
  };
  return { saved, pending, error, success, submit };
}
