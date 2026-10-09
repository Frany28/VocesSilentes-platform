import { Icon } from '../../../components/ui/Icon.jsx';

const labels = {
  available: 'Disponible',
  progress: 'En progreso',
  completed: 'Completado',
  locked: 'Bloqueado',
};

/**
 * Etiqueta original de ModuleCard con iconos y texto además del color.
 * @param {{state: string}} props Estado derivado o disponibilidad explícita.
 * @returns {import('react').ReactElement} Estado accesible, sin reglas de bloqueo.
 */
export function ModuleStatus({ state }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-surface p-2 text-action
      [font:var(--type-label)] data-[state=locked]:text-muted data-[state=completed]:text-(--status-success)"
      data-state={state}
    >
      {state === 'locked' && <Icon name="student-lock" size={14} />}
      {state === 'completed' && <Icon name="student-check" size={14} />}
      {labels[state]}
    </span>
  );
}
