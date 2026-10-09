import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from './use-auth.js';
import { safeReturnPath } from './return-path.js';

/**
 * Gestiona envío/cancelación y navegación de los formularios mínimos de autenticación.
 * @param {string} mode login o register.
 * @returns {object} onSubmit, pending y error; no persiste contraseñas ni tokens.
 */
export function useAuthForm(mode) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef();
  useEffect(() => () => controller.current?.abort(), []);
  return {
    pending,
    error,
    async onSubmit(event) {
      event.preventDefault();
      if (pending) return;
      const input = Object.fromEntries(new FormData(event.currentTarget));
      if (input.lastName === '') delete input.lastName;
      const request = new AbortController();
      controller.current = request;
      setPending(true);
      setError('');
      try {
        const user = await auth[mode](input, request.signal);
        if (!request.signal.aborted)
          navigate(safeReturnPath(location.state?.from, user.role), { replace: true });
      } catch (failure) {
        if (!request.signal.aborted) setError(failure.message);
      } finally {
        // FormData y contraseña solo viven durante el envío; no se guardan en estado/storage.
        if (!request.signal.aborted) setPending(false);
      }
    },
  };
}
