import { Input } from '../../../components/ui/Input.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { useAdminList } from '../data/use-admin-list.js';
import { AdminHeading } from '../components/AdminHeading.jsx';
import { AdminSelect } from '../components/AdminSelect.jsx';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
import { AdminUnavailable } from '../components/AdminUnavailable.jsx';
import { AdminReportRow } from '../components/AdminReportRow.jsx';
import { AdminPagination } from '../components/AdminPagination.jsx';

/**
 * Presenta reportes proporcionados por el consumidor; sin servicio publicado muestra integración pendiente.
 * @param {{reports?: object[], status?: string, error?: object, retry?: Function}} props Lectura del consumidor.
 * @returns {import('react').ReactElement} Listado adaptable y estados de lectura.
 */
export function AdminReports({ reports = [], status = 'unavailable', error, retry } = {}) {
  const list = useAdminList(reports, 'status');
  const pending = reports.filter((report) => report.status === 'PENDING').length;
  const resolved = reports.filter((report) => report.status === 'RESOLVED').length;
  return (
    <div className="admin-page">
      <AdminHeading title="Reportes de la comunidad">
        Revisa cada caso y acompaña el aprendizaje.
      </AdminHeading>
      {status === 'ready' && (
        <div className="admin-status-line admin-report-counts">
          <Badge tone="warning">
            {pending} {pending === 1 ? 'pendiente' : 'pendientes'}
          </Badge>
          <Badge tone="success">
            {resolved} {resolved === 1 ? 'resuelto' : 'resueltos'}
          </Badge>
        </div>
      )}
      <section className="admin-panel">
        <div className="admin-filters">
          <Input
            appearance="plain"
            label="Buscar reportes"
            placeholder="Asunto o referencia"
            value={list.query}
            disabled={status === 'unavailable'}
            onChange={(event) => list.search(event.target.value)}
          />
          <AdminSelect
            label="Estado"
            value={list.filter}
            disabled={status === 'unavailable'}
            onChange={(event) => list.select(event.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="RESOLVED">Resuelto</option>
          </AdminSelect>
        </div>
        {status === 'unavailable' ? (
          <AdminUnavailable title="Reportes no disponibles">
            La consulta y resolución de reportes requiere un servicio de backend que todavía no está
            disponible.
          </AdminUnavailable>
        ) : status !== 'ready' ? (
          <AdminFeedback status={status} error={error} retry={retry} noun="reportes" />
        ) : !list.total ? (
          <AdminFeedback
            status={list.query || list.filter ? 'empty' : 'no-data'}
            noun="reportes"
            retry={list.query || list.filter ? list.reset : undefined}
          />
        ) : (
          <>
            {list.items.map((report) => (
              <AdminReportRow key={report.id} report={report} />
            ))}
            <AdminPagination list={list} />
          </>
        )}
      </section>
    </div>
  );
}
