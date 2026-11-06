import { MetricsCards } from './MetricsCards.jsx';
import { metricValue } from './metrics-format.js';

/**
 * Distingue censo, habilitación, actividad observada y gestión de reportes.
 * @param {{data: object}} props Indicadores reales de administración.
 * @returns {import('react').ReactElement} Tarjetas con alcance explícito.
 */
export function CommunityMetrics({ data }) {
  return <>
    <MetricsCards title="Comunidad" items={[
      { label: 'Usuarios registrados', value: data.users,
        detail: `${metricValue(data.enabledUsers ?? data.activeUsers)} habilitadas · ${metricValue(data.disabledUsers ?? data.inactiveUsers)} deshabilitadas` },
      { label: 'Usuarios activos · 7 días', value: data.activity?.active7,
        detail: 'Actividad registrada en los 7 días previos al cierre del período.' },
      { label: 'Usuarios activos · 30 días', value: data.activity?.active30,
        detail: 'Actividad registrada en los 30 días previos al cierre del período.' },
    ]} />
    <MetricsCards title="Reportes" items={[
      { label: 'Reportes pendientes', value: data.pendingReports,
        detail: 'Estado actual, incluidos autores eliminados.' },
      { label: 'Reportes resueltos', value: data.resolvedReports,
        detail: 'Estado actual de gestión.' },
    ]} />
  </>;
}
