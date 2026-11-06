import { metricDay, metricValue } from './metrics-format.js';

/**
 * Dibuja series agregadas del backend con SVG adaptable y tokens de ambos temas.
 * @param {{data: object[], series: object[], title: string}} props Días y claves numéricas reales.
 * @returns {import('react').ReactElement} Gráfico sin animación ni dependencias; puntos con detalle nativo.
 */
export function MetricsPlot({ data, series, title }) {
  const maximum = Math.max(1, ...data.flatMap((day) => series.map(({ key }) => day[key])));
  const x = (index) => (data.length === 1 ? 330 : 40 + (index * 580) / (data.length - 1));
  const y = (value) => 175 - (value / maximum) * 150;
  const ticks = [...new Set([0, Math.floor((data.length - 1) / 2), data.length - 1])];
  return (
    <svg className="admin-metrics-plot" viewBox="0 0 640 215" role="img" aria-label={title}>
      <title>{title}. Los valores completos están en la tabla de datos.</title>
      {[...new Set([0, Math.ceil(maximum / 2), maximum])].map((value) => (
        <g key={value}>
          <line className="admin-metrics-grid" x1="40" x2="620" y1={y(value)} y2={y(value)} />
          <text className="admin-metrics-axis" x="32" y={y(value) + 4} textAnchor="end">
            {metricValue(value)}
          </text>
        </g>
      ))}
      {ticks.map((index) => (
        <text
          className="admin-metrics-axis"
          key={index}
          x={x(index)}
          y="202"
          textAnchor={index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'}
        >
          {metricDay(data[index].day)}
        </text>
      ))}
      {series.map(({ key, label }, index) => (
        <g key={key} className={`admin-metrics-series series-${index}`}>
          <polyline
            fill="none"
            strokeWidth="2.5"
            strokeDasharray={index ? '6 3' : undefined}
            points={data.map((day, position) => `${x(position)},${y(day[key])}`).join(' ')}
          />
          {data.map((day, position) => (
            <circle key={day.day} cx={x(position)} cy={y(day[key])} r="3">
              <title>
                {metricDay(day.day)} · {label}: {metricValue(day[key])}
              </title>
            </circle>
          ))}
        </g>
      ))}
    </svg>
  );
}
