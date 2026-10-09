import { Button } from '../../../components/ui/Button.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { Progress } from '../../../components/ui/Progress.jsx';
import { moduleProgress } from '../data/module-progress.js';
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
      bg-surface shadow-(--shadow-soft)"
      aria-label={module.title}
    >
      {illustrated && (
        <div
          className="student-module-cover flex min-h-[178px] flex-col rounded-t-3xl p-4"
          data-color={module.illustration}
        >
          <div>
            <ModuleStatus state={state} />
          </div>
          <ModuleIllustration />
        </div>
      )}
      <div className="flex flex-col gap-3 p-6">
        {illustrated ? (
          <p className="text-action [font:var(--type-label)]">NIVEL 01 · COMUNICACIÓN COTIDIANA</p>
        ) : (
          <div className="flex items-start gap-4">
            <span className="flex rounded-2xl bg-(--surface-secondary) p-3">
              <Icon name={locked ? 'student-lock' : 'student-book'} size={32} />
            </span>
            <div className="min-w-0">
              <p className="text-action [font:var(--type-label)]">NIVEL 01 · LSV</p>
              <ModuleStatus state={state} />
            </div>
          </div>
        )}
        <h3 className="[font:var(--type-h3)] whitespace-pre-line">
          {module.displayTitle || module.title}
        </h3>
        {illustrated && <p className="text-muted">{module.description}</p>}
        <Progress
          className="student-module-progress"
          value={percent}
          label={
            <span className="flex flex-wrap gap-2">
              <span>{caption}</span>
              {!locked && state !== 'available' && <span className="text-action">{percent}%</span>}
            </span>
          }
          valueText={`${percent}% · ${completed} de ${total} lecciones`}
        />
        <Button
          className="w-full! [--size-control:48px]"
          disabled={locked}
          onClick={() => onOpen(module.title)}
        >
          {locked
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
