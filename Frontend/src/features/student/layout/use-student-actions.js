import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogout } from '../../auth/use-logout.js';

/**
 * Cierra sesión con el flujo CSRF/cookies existente, sin duplicar envíos; anuncia disponibilidad pendiente.
 * @returns {object} Acciones y mensajes controlados del layout.
 */
export function useStudentActions() {
  const session = useLogout();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const onUnavailable = (name) => {
    if (name === 'Reportar un error') return navigate('/student/reports/new');
    setNotice((previous) => ({
      message: `${name}: disponible próximamente.`,
      id: (previous?.id || 0) + 1,
    }));
  };
  return {
    session,
    pending: session.pending,
    notice,
    logout: session.open,
    openLearning: (moduleTitle) => {
      if (moduleTitle === 'Reportar un error') onUnavailable(moduleTitle);
      else navigate('/student/practice', { state: { moduleTitle } });
    },
    onUnavailable,
  };
}
