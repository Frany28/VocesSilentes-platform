import { Navigate, useLocation } from 'react-router';
import { alphabetLessonIds, alphabetModuleId } from '../resources/lesson-videos.js';

/**
 * Conserva el enlace histórico, pero lo dirige a la lección real para evitar recorridos duplicados.
 * @returns {import('react').ReactElement} Redirección protegida o estado real del catálogo.
 */
export function StudentVowelModule() {
  const location = useLocation();
  return (
    <Navigate
      replace
      to={`/student/modules/${alphabetModuleId}/lessons/${alphabetLessonIds['m1-l02']}`}
      state={location.state}
    />
  );
}
