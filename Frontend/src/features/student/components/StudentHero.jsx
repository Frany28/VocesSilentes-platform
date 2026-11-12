import { ModuleIllustration } from './ModuleIllustration.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { moduleProgress } from '../data/module-progress.js';

/**
 * Destacado de bienvenida para primer ingreso, progreso y módulo completado.
 * @param {{module: object, next?: object, catalog?: boolean, onOpen: Function}} props Datos de presentación.
 * @returns {import('react').ReactElement} Destacado adaptable con recursos de Figma.
 */
export function StudentHero({ module, next, catalog = false, onOpen }) {
  const { state } = moduleProgress(module);
  const first = state === 'available';
  const complete = state === 'completed';
  const upcoming = state === 'upcoming';
  const title = upcoming
    ? 'Tu plan de aprendizaje'
    : catalog
      ? 'Tus manos.\nNuevos caminos.'
      : complete
        ? 'Más señas.\nMás conexiones.'
        : first
          ? 'Tu primera seña.\nTu primer puente.'
          : 'Cada seña abre\nuna conversación.';
  const description = upcoming
    ? `${module.title}: todavía no hay lecciones publicadas.`
    : complete
      ? `Completaste ${module.title}.\n${next ? `${next.title} ya está disponible.` : 'Puedes volver a repasar.'}`
      : first
        ? `Empieza con ${module.title}.\nLee y aprende a tu ritmo.`
        : catalog
          ? `Continúa con ${module.title}.\nUna seña a la vez, a tu ritmo.`
          : `Retoma ${module.title}.\nTu siguiente paso: ${module.nextLesson?.title ?? 'repasar la lectura'}.`;
  return (
    <section className="student-hero" aria-label="Tu próxima conversación">
      <div className="student-hero-copy">
        <h2 className="font-bold whitespace-pre-line">{title}</h2>
        <p className="text-muted whitespace-pre-line">{description}</p>
        <Button
          disabled={state === 'locked' || upcoming}
          onClick={() => onOpen((complete ? next : null) || module)}
        >
          {upcoming
            ? 'Próximamente'
            : complete
              ? 'Explorar módulo'
              : first
                ? 'Comenzar lección'
                : 'Continuar lección'}
        </Button>
      </div>
      <div className="student-hero-preview" aria-hidden="true">
        <ModuleIllustration contentKey={module.contentKey} />
      </div>
    </section>
  );
}
