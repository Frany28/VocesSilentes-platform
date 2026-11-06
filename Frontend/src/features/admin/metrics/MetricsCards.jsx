import { metricValue } from './metrics-format.js';

/**
 * Tarjetas de indicadores del servidor, con explicación y ausencia diferenciada de cero.
 * @param {{title: string, items: object[]}} props Etiquetas, valores y alcance del indicador.
 * @returns {import('react').ReactElement} Grupo semántico con los estilos originales de Admin.
 */
export function MetricsCards({ title, items }) {
  return (
    <section className="admin-metric-group" aria-label={title}>
      <h2>{title}</h2>
      <div className="admin-metrics">
        {items.map((item) => (
          <article className="admin-metric" key={item.label}>
            <p className="admin-metric-label">{item.label}</p>
            <strong>{metricValue(item.value, item.unit)}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
