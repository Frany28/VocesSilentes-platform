import { AdminHeading } from '../components/AdminHeading.jsx';
import { AdminIconButton } from '../components/AdminIconButton.jsx';
import { AdminUnavailable } from '../components/AdminUnavailable.jsx';
import { ReportReview } from '../components/ReportReview.jsx';

/**
 * Conserva el destino de revisión sin fingir que un identificador de ruta representa un reporte consultado.
 * @param {{report?: object, onResolve?: Function}} props Datos/operación autorizados por el consumidor, si existen.
 * @returns {import('react').ReactElement} Revisión diseñada o dependencia pendiente, sin fallback sintético.
 */
export function AdminReportDetail({ report, onResolve } = {}) {
  return (
    <div className="admin-page">
      <div className="admin-title-row">
        <AdminIconButton to="/admin/reports" icon="back" label="Volver a reportes" />
        <AdminHeading title="Revisión de reporte">
          Toda la información para tomar una decisión.
        </AdminHeading>
      </div>
      {report ? (
        <ReportReview key={report.id} report={report} onResolve={onResolve} />
      ) : (
        <AdminUnavailable title="Reporte no disponible">
          El backend todavía no permite consultar reportes, obtener su evidencia ni guardar una
          resolución.
        </AdminUnavailable>
      )}
    </div>
  );
}
