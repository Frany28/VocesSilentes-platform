import { useStudent } from '../data/use-student.js';

/**
 * Controles del prototipo habilitado, separados del progreso real de la cuenta.
 * @returns {import('react').ReactElement} Selector explícito de escenarios de diseño.
 */
export function StudentDemoControls() {
  const { scenario, setScenario } = useStudent();
  return (
    <aside className="rounded-2xl border border-dashed border-border bg-surface p-4">
      <p className="text-muted">Demostración educativa: datos de ejemplo, sin guardar progreso.</p>
      <label className="mt-3 flex flex-wrap items-center gap-3">
        Escenario de demostración
        <select
          value={scenario}
          onChange={(event) => setScenario(event.target.value)}
          className="min-h-11 max-w-full rounded-lg border border-border bg-page p-2 text-content
            focus-visible:outline-3 focus-visible:outline-focus"
        >
          <option value="progress">Aprendizaje en progreso</option>
          <option value="first">Primer ingreso</option>
          <option value="completed">Módulo completado</option>
          <option value="loading">Cargando</option>
          <option value="error">Error de conexión</option>
          <option value="empty">Catálogo vacío</option>
        </select>
      </label>
    </aside>
  );
}
