import { useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth.js';

/**
 * Confirma logout compartido, excluye envíos simultáneos y aborta al desmontar.
 * @returns {object} Apertura/cancelación y operación; un fallo conserva sesión y diálogo para reintentar.
 */
export function useLogout() {
  const auth = useAuth();
  const request = useRef();
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => () => request.current?.abort(), []);
  const logout = async () => {
    if (!confirm || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError(null);
    try {
      await auth.logout(controller.signal);
    } catch (reason) {
      if (!controller.signal.aborted) setError(reason.message);
    } finally {
      if (!controller.signal.aborted) {
        request.current = undefined;
        setPending(false);
      }
    }
  };
  return {
    confirm,
    pending,
    error,
    logout,
    open: () => setConfirm(true),
    cancel: () => {
      if (request.current) return;
      setConfirm(false);
      setError(null);
    },
  };
}
