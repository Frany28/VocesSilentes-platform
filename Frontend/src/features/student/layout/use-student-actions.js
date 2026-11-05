import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLogout } from '../../auth/use-logout.js';
import { publicConfig } from '../../../lib/config.js';

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
    openLearning: (module) => {
      if (module === 'Reportar un error') return onUnavailable(module);
      if (publicConfig.studentDemo)
        return navigate('/student/practice', { state: { moduleTitle: module.title } });
      const lesson = module.nextLesson ?? module.lessons[0];
      if (lesson) navigate(`/student/modules/${module.id}/lessons/${lesson.id}`);
    },
    onUnavailable,
  };
}
