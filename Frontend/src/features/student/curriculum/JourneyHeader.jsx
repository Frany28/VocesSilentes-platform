import { Link } from 'react-router';
import { Brand } from '../../../components/ui/Brand.jsx';
import { ThemeAction } from '../../../components/ui/ThemeAction.jsx';
import { Progress } from '../../../components/ui/Progress.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { StudentProfileLink } from '../layout/StudentProfileLink.jsx';

/**
 * Cabecera compacta: identidad, salida y acciones juntas; título y progreso sobre el contenido.
 * Conserva la distinción entre avance de lectura y aprobación lingüística.
 * @param {{lesson: object, module: object, journey: object}} props Lección y recorrido autorizado.
 * @returns {import('react').ReactElement} Navegación y progreso accesibles.
 */
export function JourneyHeader({ lesson, module, journey }) {
  const position = module.lessons.findIndex((item) => item.id === lesson.id) + 1;
  return (
    <header className="journey-header">
      <div className="journey-topbar">
        <div className="hidden min-[600px]:block">
          <Brand />
        </div>
        <div className="min-[600px]:hidden">
          <Brand compact />
        </div>
        <div className="journey-topbar-actions">
          <Link to="/student/modules" className="journey-exit">
            <Icon name="education-back" />
            Salir de la lección
          </Link>
          <ThemeAction />
          <StudentProfileLink />
        </div>
      </div>
      <div className="journey-context">
        <div className="journey-heading">
          <p className="journey-kicker">
            Lección {position} de {module.lessons.length}
          </p>
          <h1>{lesson.title}</h1>
        </div>
        <Progress
          label="Tu recorrido"
          value={journey.percent}
          valueText={`${journey.completed} de ${journey.steps.length} pasos · ${journey.percent}%`}
        />
        {module.preview && (
          <p className="journey-status">
            Vista previa local · Borrador pendiente de revisión lingüística.
          </p>
        )}
        {!module.preview && lesson.content?.reviewStatus === 'PENDING_LSV_REVIEW' && (
          <p className="journey-status">
            Lectura educativa · Revisión LSV pendiente. Las evaluaciones aún no están disponibles.
          </p>
        )}
        {!journey.remembered && (
          <p role="status" className="journey-status">
            El navegador no permite recordar tu punto al recargar. Puedes continuar estudiando.
          </p>
        )}
      </div>
    </header>
  );
}
