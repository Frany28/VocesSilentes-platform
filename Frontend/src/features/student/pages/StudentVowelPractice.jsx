import { Link } from 'react-router';
import { StudentPageHeader } from '../components/StudentPageHeader.jsx';
import { SignPracticeWorkspace } from '../practice/SignPracticeWorkspace.jsx';
import '../lesson/lesson.css';

/**
 * Integra referencias y reconocimiento real en aprendizaje; elegir la vocal no influye en la clasificación.
 * @returns {import('react').ReactElement} Actividad accesible bajo sesión USER, sin calificación automática.
 */
export function StudentVowelPractice() {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <StudentPageHeader
        title="Aprende y practica las vocales"
        description="Observa la referencia y realiza tu intento frente a la cámara. El modelo de vocales se carga solo."
      />
      <SignPracticeWorkspace />
      <Link className="education-back inline-flex min-h-11 items-center" to="/student/modules">
        Volver a mis módulos
      </Link>
    </div>
  );
}
