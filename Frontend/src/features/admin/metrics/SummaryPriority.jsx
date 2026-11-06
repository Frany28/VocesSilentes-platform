import { AdminReportRow } from '../components/AdminReportRow.jsx';
import { AdminAction } from '../components/AdminAction.jsx';

/**
 * Conserva los reportes pendientes y accesos del resumen administrativo existente.
 * @param {{reports: object[]}} props Tres reportes recientes reales del servicio administrativo.
 * @returns {import('react').ReactElement} Prioridad operativa sin cifras calculadas desde páginas parciales.
 */
export function SummaryPriority({ reports }) {
  return (
    <section className="admin-panel">
      <h2>Prioridad de hoy</h2>
      {reports.length ? (
        reports.map((report) => <AdminReportRow key={report.id} report={report} />)
      ) : (
        <p className="admin-muted">No hay reportes pendientes.</p>
      )}
      <div className="admin-actions">
        <AdminAction to="/admin/reports">Ver todos los reportes</AdminAction>
        <AdminAction to="/admin/users">Gestionar usuarios</AdminAction>
      </div>
    </section>
  );
}
