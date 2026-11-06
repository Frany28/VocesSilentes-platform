import { useAdminSummary } from '../data/use-admin-summary.js';
import { AdminHeading } from '../components/AdminHeading.jsx';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
import { MetricsFilters } from '../metrics/MetricsFilters.jsx';
import { MetricsDashboard } from '../metrics/MetricsDashboard.jsx';

/**
 * Extiende el dashboard existente con indicadores del backend y filtros cancelables.
 * @returns {import('react').ReactElement} Panel sin cifras ficticias, actualizado al volver y cada minuto visible.
 */
export function AdminSummary() {
  const list = useAdminSummary();
  const updated =
    list.data?.generatedAt &&
    new Intl.DateTimeFormat('es-VE', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Caracas',
    }).format(new Date(list.data.generatedAt));
  return (
    <div className="admin-page">
      <AdminHeading title="Tu comunidad, en perspectiva">
        Indicadores de administración y aprendizaje basados en registros de la plataforma.
      </AdminHeading>
      <section className="admin-hero">
        <p className="admin-demo-note">VOCESSILENTES / MÉTRICAS</p>
        <h2>Más cuidado. Menos barreras.</h2>
        <p>
          {updated
            ? `Datos consultados el ${updated} · hora de Venezuela`
            : 'Estadísticas de la plataforma.'}
        </p>
        {list.status === 'ready' && list.data.period && (
          <p>
            Período aplicado: {list.data.period.startDay} al {list.data.period.endDay}.
          </p>
        )}
      </section>
      <MetricsFilters apply={list.apply} refresh={list.retry} loading={list.status === 'loading'} />
      {list.status === 'ready' ? (
        <MetricsDashboard data={list.data} />
      ) : (
        <AdminFeedback status={list.status} noun="métricas" error={list.error} retry={list.retry} />
      )}
    </div>
  );
}
