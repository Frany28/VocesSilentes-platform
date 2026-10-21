import { Input } from '../../../components/ui/Input.jsx';
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
  return (
    <div className="admin-page">
      <AdminHeading title="Reportes">Escucha lo que la comunidad necesita mejorar.</AdminHeading>
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
          <AdminFeedback status="empty" noun="reportes" retry={list.reset} />
        ) : (
          <>
            <div className="admin-list-head admin-report-row" aria-hidden="true">
              <span>Referencia y asunto</span>
              <span>Estado</span>
              <span>Registro</span>
              <span>Acción</span>
            </div>
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
