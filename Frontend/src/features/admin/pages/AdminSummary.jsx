import { useAdminSummary } from '../data/use-admin-summary.js';
import { AdminHeading } from '../components/AdminHeading.jsx';
import { AdminAction } from '../components/AdminAction.jsx';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
import { AdminReportRow } from '../components/AdminReportRow.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';

/**
 * Resumen global de cuentas y reportes consultado al backend, conservando las tarjetas originales.
 * @returns {import('react').ReactElement} Indicadores sin cifras sintéticas ni progreso inventado.
 */
export function AdminSummary() {
  const list = useAdminSummary();
  return (
    <div className="admin-page">
      <AdminHeading title="Tu comunidad, en perspectiva">
        Un vistazo a lo que necesita tu atención.
      </AdminHeading>
      <section className="admin-hero">
        <p className="admin-demo-note">VOCESSILENTES / COMUNIDAD</p>
        <h2>Más cuidado. Menos barreras.</h2>
        <p>Cada cuenta y cada reporte son una oportunidad para mejorar.</p>
      </section>
      <section className="admin-metrics" aria-label="Indicadores de administración">
        <article className="admin-metric">
          <div className="admin-metric-label">
            <p>Usuarios registrados</p>
            <Icon name="modern-users" size={20} />
          </div>
          {list.status === 'ready' ? (
            <>
              <strong>{list.data.users}</strong>
              <p>
                {list.data.activeUsers} activas · {list.data.inactiveUsers} desactivadas
              </p>
            </>
          ) : (
            <AdminFeedback status={list.status} error={list.error} retry={list.retry} />
          )}
        </article>
        {['Reportes pendientes', 'Reportes resueltos'].map((label) => (
          <article className="admin-metric" key={label}>
            <div className="admin-metric-label">
              <p>{label}</p>
              <Icon
                name={label.endsWith('pendientes') ? 'modern-flag' : 'modern-check'}
                size={20}
              />
            </div>
            {list.status === 'ready' ? (
              <>
                <strong>
                  {label.endsWith('pendientes')
                    ? list.data.pendingReports
                    : list.data.resolvedReports}
                </strong>
                <p>Reportes registrados</p>
              </>
            ) : (
              <AdminFeedback status={list.status} error={list.error} retry={list.retry} />
            )}
          </article>
        ))}
      </section>
      <section className="admin-panel">
        <h2>Prioridad de hoy</h2>
        {list.status === 'ready' ? (
          list.data.reports.length ? (
            list.data.reports.map((report) => <AdminReportRow key={report.id} report={report} />)
          ) : (
            <p className="admin-muted">No hay reportes pendientes.</p>
          )
        ) : (
          <AdminFeedback status={list.status} error={list.error} retry={list.retry} />
        )}
        <div className="admin-actions">
          <AdminAction to="/admin/reports">Ver todos los reportes</AdminAction>
          <AdminAction to="/admin/users">Gestionar usuarios</AdminAction>
        </div>
      </section>
    </div>
  );
}
