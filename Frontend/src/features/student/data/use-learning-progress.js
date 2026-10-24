import { useEffect, useRef, useState } from 'react';
import { writeLearningProgress } from './learning.api.js';
import { useStudent } from './use-student.js';

/**
 * Guarda progreso con exclusión de doble envío y refresca el catálogo tras confirmación del servidor.
 * @returns {object} pending/error/saved/submit; cancela al desmontar, sin éxito anticipado.
 */
export function useLearningProgress() {
  const { refresh } = useStudent();
  const request = useRef();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  useEffect(() => () => request.current?.abort(), []);
  const submit = async (kind, id, status) => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError('');
    setSaved(false);
    try {
      await writeLearningProgress(kind, id, status, controller.signal);
      if (!controller.signal.aborted) {
        setSaved(true);
        refresh();
      }
    } catch (reason) {
      if (!controller.signal.aborted) setError(reason.message);
    } finally {
      if (!controller.signal.aborted) {
        request.current = undefined;
        setPending(false);
      }
    }
  };
  return { pending, error, saved, submit };
}
