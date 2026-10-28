import { Input } from '../../../components/ui/Input.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { useAdminList } from '../data/use-admin-list.js';
import { AdminHeading } from '../components/AdminHeading.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
import { AdminUnavailable } from '../components/AdminUnavailable.jsx';
import { AdminReportRow } from '../components/AdminReportRow.jsx';
import { AdminPagination } from '../components/AdminPagination.jsx';

/**
 * Presenta reportes proporcionados por el consumidor; sin servicio publicado muestra integración pendiente.
 * @param {{reports?: object[], status?: string, error?: object, retry?: Function,
 * serverList?: object, complete?: boolean}} props Lectura y paginación del consumidor.
 * @returns {import('react').ReactElement} Listado adaptable y estados de lectura.
 */
export function AdminReports({
  reports = [],
  status = 'unavailable',
  error,
  retry,
  serverList,
  complete = true,
} = {}) {
  const localList = useAdminList(reports, 'status');
  const list = serverList ?? localList;
  const pending = reports.filter((report) => report.status === 'PENDING').length;
  const resolved = reports.filter((report) => report.status === 'RESOLVED').length;
  return (
    <div className="admin-page">
      <AdminHeading title="Reportes de la comunidad">
        Revisa cada caso y acompaña el aprendizaje.
      </AdminHeading>
      {status === 'ready' && complete && (
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
            density="compact"
            appearance="plain"
            label="Buscar reportes"
            placeholder="Asunto o referencia"
            value={list.query}
            disabled={status === 'unavailable'}
            onChange={(event) => list.search(event.target.value)}
          />
          <Select
            label="Estado"
            value={list.filter}
            disabled={status === 'unavailable'}
            onChange={(event) => list.select(event.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="RESOLVED">Resuelto</option>
          </Select>
        </div>
        {status === 'unavailable' ? (
          <AdminUnavailable title="Reportes no disponibles">
            La consulta y resolución de reportes requiere un servicio de backend que todavía no está
            disponible.
          </AdminUnavailable>
        ) : status !== 'ready' ? (
          <AdminFeedback status={status} error={error} retry={retry} noun="reportes" />
        ) : !list.items.length ? (
          <AdminFeedback
            status={list.total ? 'empty-page' : list.query || list.filter ? 'empty' : 'no-data'}
            noun="reportes"
            retry={
              list.total ? () => list.go(1) : list.query || list.filter ? list.reset : undefined
            }
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
