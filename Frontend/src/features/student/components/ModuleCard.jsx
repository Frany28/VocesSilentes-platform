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
      className="student-module-card flex min-w-0 flex-col"
      aria-label={module.title}
      data-illustrated={illustrated || undefined}
      data-state={state}
    >
      {illustrated && (
        <div className="student-module-cover" data-color={module.illustration}>
          <ModuleIllustration contentKey={module.contentKey} />
        </div>
      )}
      <div className="student-module-body flex flex-col gap-3">
        {illustrated ? (
          <div className="student-module-meta flex flex-wrap items-center justify-between gap-2">
            <p className="text-action [font:var(--type-label)]">{moduleLabel(module)}</p>
            <ModuleStatus state={state} />
          </div>
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
        <div className="student-module-footer flex flex-col gap-3">
          {upcoming ? (
            (!illustrated || !module.description) && (
              <p className="text-muted">Todavía no hay lecciones publicadas.</p>
            )
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
      </div>
    </article>
  );
}
