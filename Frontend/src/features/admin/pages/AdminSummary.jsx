import { useAdmin } from '../data/admin-context.js';
import { AdminHeading } from '../components/AdminHeading.jsx';
import { AdminAction } from '../components/AdminAction.jsx';
import { AdminReportRow } from '../components/AdminReportRow.jsx';
import { AdminUserRow } from '../components/AdminUserRow.jsx';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
/**
 * Resumen de demostración del diseño; no presenta métricas como integración de base de datos.
 * @returns {import('react').ReactElement} Hero, métricas demo y enlaces a gestión.
 */
export function AdminSummary() {
  const { users, reports, preview, retry } = useAdmin();
  const examples = users.filter((user) => user.source === 'demo');
  const pending = reports.filter((report) => report.status === 'PENDING');
  return (
    <div className="admin-page">
      <AdminHeading title="Resumen">
        Cuida la comunidad. Mantén el aprendizaje en movimiento.
      </AdminHeading>
      <section className="admin-hero">
        <p className="admin-demo-note">VOCESSILENTES / ADMINISTRACIÓN</p>
        <h2>Más cuidado. Menos barreras.</h2>
        <p>Un vistazo a las cuentas y los reportes que necesitan tu atención.</p>
      </section>
      <p className="admin-demo-note">
        Métricas de demostración. No representan los datos de la base de datos.
      </p>
      {preview !== 'ready' ? (
        <AdminFeedback status={preview} retry={retry} noun="resumen" />
      ) : (
        <>
          <section className="admin-metrics" aria-label="Métricas de demostración">
            {[
              [
                'Usuarios registrados',
                examples.length,
                `${examples.filter((user) => user.isActive).length} activos · ${examples.filter((user) => !user.isActive).length} desactivados`,
              ],
              ['Reportes pendientes', pending.length, 'Revisa el contexto antes de actuar'],
              [
                'Reportes resueltos',
                reports.length - pending.length,
                `De ${reports.length} reportes recibidos`,
              ],
            ].map(([label, value, description]) => (
              <article className="admin-metric" key={label}>
                <p>{label}</p>
                <strong>{value}</strong>
                <p>{description}</p>
              </article>
            ))}
          </section>
          <div className="admin-attention">
            <section className="admin-panel">
              <h2>Necesitan tu atención</h2>
              <p className="admin-muted">Reportes pendientes de revisión · Demostración</p>
              {pending[0] ? (
                <AdminReportRow report={pending[0]} card />
              ) : (
                <p>No hay reportes pendientes de demostración.</p>
              )}
              <AdminAction to="/admin/reports">Ver todos los reportes</AdminAction>
            </section>
            <section className="admin-panel">
              <h2>La comunidad</h2>
              <p className="admin-muted">Cuentas recientes</p>
              <AdminUserRow user={users[0]} card />
              <AdminAction to="/admin/users">Gestionar usuarios</AdminAction>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
