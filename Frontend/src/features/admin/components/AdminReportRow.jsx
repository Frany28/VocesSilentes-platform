import { AdminAction } from './AdminAction.jsx';
import { ReportStatus } from './ReportStatus.jsx';
import { adminDate } from '../data/admin-labels.js';
/**
 * Reporte proporcionado por el consumidor, con acceso a su detalle y estado confirmado.
 * @param {{report: object, card?: boolean}} props Reporte y composición de resumen.
 * @returns {import('react').ReactElement} Fila adaptable.
 */
export function AdminReportRow({ report, card = false }) {
  return (
    <article className={`admin-list-row admin-report-row ${card ? 'admin-report-card' : ''}`}>
      <div className="admin-row-name">
        <p className="admin-kicker">
          {report.reference} · {report.category || 'Contenido'}
        </p>
        <strong>{report.title}</strong>
        <p>
          {report.lesson} · {report.author}
        </p>
      </div>
      <ReportStatus status={report.status} />
      {!card && (
        <time className="admin-list-date" dateTime={report.createdAt}>
          {adminDate(report.createdAt)}
        </time>
      )}
      <AdminAction to={`/admin/reports/${report.id}`}>Revisar reporte</AdminAction>
    </article>
  );
}
