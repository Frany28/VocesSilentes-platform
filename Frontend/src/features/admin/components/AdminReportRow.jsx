import { AdminAction } from './AdminAction.jsx';
import { ReportStatus } from './ReportStatus.jsx';
import { adminDate } from '../data/admin-labels.js';

/**
 * Tarjeta de reporte de 289:30463; referencia/estado arriba, contexto y revisión al pie.
 * @param {{report: object}} props Reporte autorizado proporcionado por el consumidor.
 * @returns {import('react').ReactElement} Tarjeta adaptable sin datos sintéticos ni operaciones HTTP.
 */
export function AdminReportRow({ report }) {
  return (
    <article className="admin-report-card">
      <header className="admin-report-card-heading">
        <p>
          {report.reference} · {report.categoryLabel || report.category || 'CONTENIDO'}
        </p>
        <ReportStatus status={report.status} />
      </header>
      <h3>{report.title}</h3>
      <div className="admin-report-card-footer">
        <div>
          <p>
            {report.lesson} · {report.author}
          </p>
          <time dateTime={report.createdAt}>{adminDate(report.createdAt)}</time>
        </div>
        <AdminAction to={`/admin/reports/${report.id}`}>
          Revisar<span className="admin-report-action-detail"> reporte</span>
        </AdminAction>
      </div>
    </article>
  );
}
