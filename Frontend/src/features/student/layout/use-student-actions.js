import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/use-auth.js';

/**
 * Cierra sesión con el flujo CSRF/cookies existente, sin duplicar envíos; anuncia disponibilidad pendiente.
 * @returns {object} Acciones y mensajes controlados del layout.
 */
export function useStudentActions() {
  const auth = useAuth();
  const navigate = useNavigate();
  const request = useRef(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  useEffect(() => () => request.current?.abort(), []);
  const onUnavailable = (name) =>
    setNotice((previous) => ({
      message: `${name}: disponible próximamente.`,
      id: (previous?.id || 0) + 1,
    }));
  const logout = async () => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError('');
    try {
      await auth.logout(controller.signal);
      if (!controller.signal.aborted) navigate('/login', { replace: true });
    } catch {
      if (!controller.signal.aborted)
        setError('No pudimos cerrar la sesión. Comprueba tu conexión y reintenta.');
    } finally {
      if (!controller.signal.aborted) {
        request.current = null;
        setPending(false);
      }
    }
  };
  return {
    pending,
    error,
    notice,
    logout,
    openLearning: (moduleTitle) => {
      if (moduleTitle === 'Reportar un error') onUnavailable(moduleTitle);
      else navigate('/student/practice', { state: { moduleTitle } });
    },
    onUnavailable,
  };
}
