import { Button } from '../../../components/ui/Button.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { Progress } from '../../../components/ui/Progress.jsx';
import { moduleLabel, moduleProgress } from '../data/module-progress.js';
import { ModuleStatus } from './ModuleStatus.jsx';
import { ModuleIllustration } from './ModuleIllustration.jsx';

/**
 * Tarjeta compartida compacta/ilustrada, con avance calculado y acción del consumidor.
 * @param {{module: object, illustrated?: boolean, onOpen: Function}} props Datos y disponibilidad.
 * @returns {import('react').ReactElement} Tarjeta de Figma que crece con su texto.
 */
export function ModuleCard({ module, illustrated = false, onOpen }) {
  const { state, completed, total, percent } = moduleProgress(module);
  const locked = state === 'locked';
  const upcoming = state === 'upcoming';
  const caption = locked
    ? illustrated
      ? module.lockReason
      : 'Desbloquea este módulo'
    : state === 'available'
      ? `${total} lecciones para comenzar`
      : `${completed} de ${total} lecciones`;
  return (
    <article
      className="student-module-card flex min-w-0 flex-col self-start rounded-3xl border border-border
      bg-surface shadow-card"
      aria-label={module.title}
    >
      {illustrated && (
        <div
          className="student-module-cover flex min-h-[178px] flex-col overflow-hidden rounded-t-3xl"
          data-color={module.illustration}
        >
          <div className="p-4">
            <ModuleStatus state={state} />
          </div>
          <ModuleIllustration contentKey={module.contentKey} />
        </div>
      )}
      <div className="flex flex-col gap-3">
        {illustrated ? (
          <p className="text-action [font:var(--type-label)]">{moduleLabel(module)}</p>
        ) : (
          <div className="flex items-start gap-4">
            <span className="flex rounded-2xl bg-secondary p-3">
              <Icon name={locked ? 'student-lock' : 'student-book'} size={32} />
            </span>
            <div className="min-w-0">
              <p className="text-action [font:var(--type-label)]">{moduleLabel(module)}</p>
              <ModuleStatus state={state} />
            </div>
          </div>
        )}
        <h3 className="[font:var(--type-h3)] whitespace-pre-line">
          {module.displayTitle || module.title}
        </h3>
        {illustrated && <p className="text-muted">{module.description}</p>}
        {upcoming ? (
          <p className="text-muted">Todavía no hay lecciones publicadas.</p>
        ) : (
          <Progress
            className="student-module-progress"
            value={percent}
            label={
              <span className="flex flex-wrap gap-2">
                <span>{caption}</span>
                {!locked && state !== 'available' && (
                  <span className="text-action">{percent}%</span>
                )}
              </span>
            }
            valueText={`${percent}% · ${completed} de ${total} lecciones`}
          />
        )}
        <Button className="w-full" disabled={locked || upcoming} onClick={() => onOpen(module)}>
          {upcoming
            ? 'Próximamente'
            : locked
              ? 'Módulo bloqueado'
              : state === 'completed'
                ? 'Repasar las señas'
                : state === 'progress'
                  ? 'Seguir aprendiendo'
                  : 'Explorar módulo'}
        </Button>
      </div>
    </article>
  );
}
