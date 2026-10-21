import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from './admin-context.js';
import { useAuth } from '../../auth/use-auth.js';

/**
 * Solicita borrado lógico confirmado, evita doble envío y conserva los errores para reintentar.
 * @param {object} user Cuenta real seleccionada.
 * @returns {object} pending/error/remove; aborta transporte al desmontar, sin repetir escrituras.
 */
export function useUserDelete(user) {
  const { api } = useAdmin();
  const auth = useAuth();
  const navigate = useNavigate();
  const request = useRef();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => () => request.current?.abort(), []);
  const remove = async () => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError(null);
    try {
      await api.delete(user.id, controller.signal);
      if (controller.signal.aborted) return;
      if (user.id === auth.user.id) auth.refresh();
      navigate(user.id === auth.user.id ? '/login' : '/admin/users', {
        replace: true,
        state: { message: 'La cuenta se eliminó y sus sesiones fueron revocadas.' },
      });
    } catch (reason) {
      if (!controller.signal.aborted) setError(reason.message);
    } finally {
      if (!controller.signal.aborted) {
        request.current = undefined;
        setPending(false);
      }
    }
  };
  return { pending, error, remove };
}
