import { Link } from 'react-router';
import { Brand } from '../../../components/ui/Brand.jsx';
import { ThemeAction } from '../../../components/ui/ThemeAction.jsx';
import { Progress } from '../../../components/ui/Progress.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { StudentProfileLink } from '../layout/StudentProfileLink.jsx';
import { JourneyPhases } from './JourneyPhases.jsx';

/**
 * Mantiene identidad y progreso del recorrido en una cabecera sin navegación ajena a la actividad.
 * @param {{lesson: object, module: object, journey: object}} props Contexto autorizado y pasos reconocidos.
 * @returns {import('react').ReactElement} Marca, salida, tema y progreso local distinguible del académico.
 */
export function JourneyHeader({ lesson, module, journey }) {
  return (
    <header className="journey-header flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="hidden min-[600px]:block">
          <Brand />
        </div>
        <div className="min-[600px]:hidden">
          <Brand compact />
        </div>
        <Link
          to="/student/modules"
          className="education-back ml-auto inline-flex min-h-11 items-center gap-2"
        >
          <Icon name="education-back" />
          Salir de la lección
        </Link>
        <div className="student-topbar-actions">
          <ThemeAction />
          <StudentProfileLink />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-muted [font:var(--type-label)]">
          Lección {module.lessons.findIndex((item) => item.id === lesson.id) + 1} de{' '}
          {module.lessons.length}
        </p>
        <h1 className="[font:var(--type-subtitle)]">{lesson.title}</h1>
        <Progress
          label="Tu recorrido"
          value={journey.percent}
          valueText={`${journey.completed} de ${journey.steps.length} pasos · ${journey.percent}%`}
        />
        <JourneyPhases steps={journey.steps} step={journey.step} />
        {module.preview && (
          <p className="text-muted [font:var(--type-label)]">
            Vista previa local · Borrador pendiente de revisión lingüística.
          </p>
        )}
        {!module.preview && lesson.content?.reviewStatus === 'PENDING_LSV_REVIEW' && (
          <p className="text-muted [font:var(--type-label)]">
            Lectura educativa · Revisión LSV pendiente. Las evaluaciones aún no están disponibles.
          </p>
        )}
        {!journey.remembered && (
          <p role="status" className="text-muted">
            El navegador no permite recordar tu punto al recargar. Puedes continuar estudiando.
          </p>
        )}
      </div>
    </header>
  );
}
