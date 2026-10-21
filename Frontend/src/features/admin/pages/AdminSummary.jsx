import { useUsersList } from '../data/use-users-list.js';
import { AdminHeading } from '../components/AdminHeading.jsx';
import { AdminAction } from '../components/AdminAction.jsx';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
import { AdminUnavailable } from '../components/AdminUnavailable.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';

/**
 * Resumen con censo real de cuentas y dependencias explícitas para métricas/reportes aún no publicados.
 * @returns {import('react').ReactElement} Indicadores sin cifras sintéticas ni progreso inventado.
 */
export function AdminSummary() {
  const list = useUsersList({ census: true });
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
              <strong>{list.total}</strong>
              <p>Cuentas no eliminadas</p>
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
            <strong aria-label="Sin datos disponibles">—</strong>
            <p>Consulta de reportes pendiente de integración</p>
          </article>
        ))}
      </section>
      <section className="admin-panel">
        <h2>Prioridad de hoy</h2>
        <AdminUnavailable title="Reportes no disponibles">
          El backend todavía no permite consultar ni resolver reportes. No hay un recuento
          verificable.
        </AdminUnavailable>
        <div className="admin-actions">
          <AdminAction to="/admin/reports">Ver todos los reportes</AdminAction>
          <AdminAction to="/admin/users">Gestionar usuarios</AdminAction>
        </div>
      </section>
    </div>
  );
}
