import { Badge } from '../../../components/ui/Badge.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { useAdmin } from '../data/admin-context.js';
import { useAdminList } from '../data/use-admin-list.js';
import { AdminHeading } from '../components/AdminHeading.jsx';
import { AdminSelect } from '../components/AdminSelect.jsx';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
import { AdminReportRow } from '../components/AdminReportRow.jsx';
import { AdminPagination } from '../components/AdminPagination.jsx';
/**
 * Reportes de demostración filtrables y paginados; no implementa endpoints nuevos de reportes.
 * @returns {import('react').ReactElement} Listado y estados del diseño.
 */
export function AdminReports() {
  const { reports, preview, retry } = useAdmin();
  const list = useAdminList(reports, 'status');
  return (
    <div className="admin-page">
      <AdminHeading title="Reportes">Escucha lo que la comunidad necesita mejorar.</AdminHeading>
      <p className="admin-demo-note">
        Reportes de demostración. Los cambios permanecen en memoria y se reinician al recargar.
      </p>
      {['loading', 'error'].includes(preview) ? (
        <AdminFeedback status={preview} noun="reportes" retry={retry} />
      ) : (
        <section className="admin-panel">
          <div className="admin-list-heading">
            <div>
              <h2>Reportes recibidos</h2>
              <p className="admin-muted">Revisa errores de contenido y ejercicios.</p>
            </div>
            <Badge tone="info">{list.total} reportes demo</Badge>
          </div>
          <div className="admin-filters">
            <Input
              appearance="plain"
              label="Buscar"
              placeholder="Asunto o referencia"
              value={list.query}
              onChange={(event) => list.search(event.target.value)}
            />
            <AdminSelect
              label="Estado"
              value={list.filter}
              onChange={(event) => list.select(event.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="RESOLVED">Resuelto</option>
            </AdminSelect>
          </div>
          {preview === 'empty' || !list.total ? (
            <AdminFeedback
              status="empty"
              noun="reportes"
              retry={preview === 'empty' ? retry : list.reset}
            />
          ) : (
            <>
              <div className="admin-list-head admin-report-row" aria-hidden="true">
                <span>Referencia y asunto</span>
                <span>Estado</span>
                <span>Fecha</span>
                <span>Acciones</span>
              </div>
              {list.items.map((report) => (
                <AdminReportRow key={report.id} report={report} />
              ))}
              <AdminPagination list={list} />
            </>
          )}
        </section>
      )}
    </div>
  );
}
