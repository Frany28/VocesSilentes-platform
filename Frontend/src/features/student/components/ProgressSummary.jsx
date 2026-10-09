import { Progress } from '../../../components/ui/Progress.jsx';
import { moduleProgress } from '../data/module-progress.js';

/**
 * Resumen calculado a partir de las lecciones publicadas del módulo mostrado.
 * @param {{module: object}} props Módulo actual, separado de cualquier actividad inventada.
 * @returns {import('react').ReactElement} Resumen y progreso general reutilizado.
 */
export function ProgressSummary({ module }) {
  const { completed, total, percent, state } = moduleProgress(module);
  return (
    <section className="student-summary flex w-full min-w-0 flex-col gap-4 rounded-3xl border border-border bg-surface p-6">
      <h2 className="[font:var(--type-h3)]">Tu progreso</h2>
      <p className="[font:var(--type-h1)]">
        {String(completed).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </p>
      <p className="text-muted">
        {state === 'completed'
          ? 'Completaste todas las lecciones de este módulo.'
          : completed
            ? 'Lecciones completadas en tu módulo actual.'
            : 'Tu primera lección está lista para comenzar.'}
      </p>
      <Progress
        className="student-summary-progress"
        label="Progreso del módulo"
        value={percent}
        valueText={`${percent}% · ${
          state === 'completed'
            ? 'Completado'
            : completed
              ? `${completed} de ${total} lecciones`
              : 'Sin iniciar'
        }`}
      />
    </section>
  );
}
