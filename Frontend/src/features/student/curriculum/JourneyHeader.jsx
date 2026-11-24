import { Link } from 'react-router';
import { Brand } from '../../../components/ui/Brand.jsx';
import { ThemeAction } from '../../../components/ui/ThemeAction.jsx';
import { Progress } from '../../../components/ui/Progress.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { StudentProfileLink } from '../layout/StudentProfileLink.jsx';
import { JourneyPhases } from './JourneyPhases.jsx';

/**
 * Mantiene identidad y progreso del recorrido en una cabecera sin navegación ajena a la actividad.
 * @param {{lesson: object, module: object, journey: object, phaseOrder?: object[],
 * children?: import('react').ReactNode}} props Contexto, pasos y estado adicional.
 * @returns {import('react').ReactElement} Marca, salida, tema y progreso local distinguible del académico.
 */
export function JourneyHeader({ lesson, module, journey, phaseOrder, children }) {
  const index = module.id !== 'vowels-learning' && (
    <Link className="journey-index-link" to={`/student/modules/${module.id}`}>
      Ver todas las lecciones
    </Link>
  );
  const position = module.lessons.findIndex((item) => item.id === lesson.id) + 1;
  const preview = module.preview;
  const pendingReview = !preview && lesson.content?.reviewStatus === 'PENDING_LSV_REVIEW';
  const hasDetails = Boolean(children || preview);
  return (
    <header className="journey-header">
      <div className="journey-topbar">
        <div className="journey-brand-full">
          <Brand />
        </div>
        <div className="journey-brand-compact">
          <Brand compact />
        </div>
        <div className="journey-heading">
          <p className="text-muted [font:var(--type-label)]">
            Lección {position} de {module.lessons.length}
            {index && <> · {index}</>}
          </p>
          <h1>{lesson.title}</h1>
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
        <Progress
          label="Tu recorrido"
          value={journey.percent}
          valueText={`${journey.completed} de ${journey.steps.length} pasos · ${journey.percent}%`}
        />
        <JourneyPhases steps={journey.steps} step={journey.step} order={phaseOrder} />
        {hasDetails && (
          <details className="journey-details">
            <summary>
              {preview ? 'Vista previa local' : 'Detalles de esta etapa'}
              <span aria-hidden="true">⌄</span>
            </summary>
            <div className="journey-details-content">
              {children}
              {preview && (
                <p className="journey-status">
                  Vista previa local · Borrador pendiente de revisión lingüística.
                </p>
              )}
            </div>
          </details>
        )}
        {pendingReview && (
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
