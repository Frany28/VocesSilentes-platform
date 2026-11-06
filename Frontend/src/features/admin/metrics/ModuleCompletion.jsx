import { metricValue } from './metrics-format.js';

/**
 * Distribuye las finalizaciones registradas por módulo, conservando módulos publicados con cero avances.
 * @param {{modules?: object[]}} props Agregado del servidor para el período seleccionado.
 * @returns {import('react').ReactElement} Barras y recuentos textuales accesibles.
 */
export function ModuleCompletion({ modules }) {
  const maximum = Math.max(1, ...(modules ?? []).map((item) => item.completed));
  return (
    <section className="admin-panel" aria-label="Lecciones completadas por módulo">
      <h2>Lecciones completadas por módulo</h2>
      <p className="admin-muted">Finalizaciones de estudiantes en el período seleccionado.</p>
      {!modules ? (
        <p>No disponible: el servicio no devolvió la distribución.</p>
      ) : !modules.length ? (
        <p className="admin-muted">No hay módulos publicados.</p>
      ) : (
        <ul className="admin-module-completions">
          {modules.map((module) => (
            <li key={module.id}>
              <div>
                <span>{module.title}</span>
                <strong>{metricValue(module.completed)} completadas</strong>
              </div>
              <progress
                value={module.completed}
                max={maximum}
                aria-label={`Finalizaciones de ${module.title}`}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
