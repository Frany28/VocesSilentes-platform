import logo from '../../../assets/auth/36e7e.png';
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
  const title = catalog
    ? 'Tus manos.\nNuevos caminos.'
    : complete
      ? 'Más señas.\nMás conexiones.'
      : first
        ? 'Tu primera seña.\nTu primer puente.'
        : 'Cada seña abre\nuna conversación.';
  const description = complete
    ? `Completaste ${module.title}.\n${next ? `${next.title} ya está disponible.` : 'Puedes volver a repasar.'}`
    : first
      ? `Empieza con ${module.title}.\nAprende con videos y práctica visual.`
      : catalog
        ? `Continúa con ${module.title}.\nUna seña a la vez, a tu ritmo.`
        : `Retoma ${module.title}.\nTu siguiente paso: aprender a presentarte.`;
  return (
    <section
      className="student-hero relative flex flex-col gap-3 rounded-3xl p-6
      min-[600px]:p-8"
      aria-label="Tu próxima conversación"
    >
      <div className="student-hero-copy relative z-10 flex min-w-0 flex-col items-start gap-3">
        <p className="text-muted [font:var(--type-label)]">TU PRÓXIMA CONVERSACIÓN EMPIEZA AQUÍ</p>
        <h2 className="font-bold whitespace-pre-line">{title}</h2>
        <p className="text-muted whitespace-pre-line">{description}</p>
        <Button onClick={() => onOpen((complete ? next : module)?.title || module.title)}>
          {complete ? 'Explorar módulo' : first ? 'Comenzar lección' : 'Continuar lección'}
        </Button>
      </div>
      <div className="student-hero-art hidden min-[600px]:block" aria-hidden="true">
        <span className="student-orbit-outer" />
        <span className="student-orbit-middle" />
        <span className="student-orbit-inner" />
        <div className="student-hero-logo">
          <img src={logo} alt="" />
        </div>
      </div>
    </section>
  );
}
