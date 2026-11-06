import { MetricsPlot } from './MetricsPlot.jsx';
import { metricDay, metricValue } from './metrics-format.js';

/**
 * Presenta una serie real y su alternativa tabular accesible, distinguiendo ausencia de registros y de indicador.
 * @param {{title: string, description: string, data?: object[], series: object[]}} props Datos agregados y leyenda.
 * @returns {import('react').ReactElement} Panel del gráfico, detalles por fecha y estados vacíos explícitos.
 */
export function MetricsTrend({ title, description, data, series }) {
  const hasRecords = data?.some((day) => series.some(({ key }) => day[key] > 0));
  return (
    <section className="admin-panel admin-metrics-chart" aria-label={title}>
      <h2>{title}</h2>
      <p className="admin-muted">{description}</p>
      {!data ? (
        <p>No disponible: el servicio no devolvió este indicador.</p>
      ) : (
        <>
          {!hasRecords && (
            <p className="admin-muted">Sin actividad registrada en el período seleccionado.</p>
          )}
          {!!data.length && <MetricsPlot data={data} series={series} title={title} />}
          <ul className="admin-metrics-legend" aria-label="Leyenda">
            {series.map(({ key, label }, index) => (
              <li key={key} className={`series-${index}`}>
                <span aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
          <details className="admin-metrics-table">
            <summary>Ver datos por fecha</summary>
            <div tabIndex={0} role="region" aria-label={`Datos de ${title}`}>
              <table>
                <caption>{title} · America/Caracas</caption>
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    {series.map(({ key, label }) => (
                      <th scope="col" key={key}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((day) => (
                    <tr key={day.day}>
                      <th scope="row">
                        <time dateTime={day.day}>{metricDay(day.day)}</time>
                      </th>
                      {series.map(({ key }) => (
                        <td key={key}>{metricValue(day[key])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
