import { AdminHeading } from '../components/AdminHeading.jsx';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
import { AdminFacts } from '../components/AdminFacts.jsx';
import { AdminPagination } from '../components/AdminPagination.jsx';
import { useAuditLog } from '../data/use-audit-log.js';
import { adminDate } from '../data/admin-labels.js';

const labels = {
  REPORT_EVIDENCE_ATTACHED: 'Imagen adjunta confirmada',
  USER_REGISTERED: 'Registro de usuario',
  USER_CREATED: 'Creación de usuario',
  USER_UPDATED: 'Modificación de usuario',
  USER_DELETED: 'Eliminación lógica de usuario',
  REPORT_CREATED: 'Creación de reporte',
  REPORT_RESOLVED: 'Resolución de reporte',
  REPORT_REOPENED: 'Reapertura de reporte',
  LESSON_PROGRESS_UPDATED: 'Avance de lectura',
  EXERCISE_PROGRESS_UPDATED: 'Actividad de práctica declarada',
};

/**
 * Consulta la bitácora real con las superficies y controles existentes del panel administrativo.
 * @returns {import('react').ReactElement} Historial paginado sin contraseñas, tokens ni snapshots personales.
 */
export function AdminAudit() {
  const list = useAuditLog();
  return (
    <div className="admin-page">
      <AdminHeading title="Bitácora de operaciones">
        Historial de cambios y actividad de la comunidad.
      </AdminHeading>
      {list.status !== 'ready' ? (
        <AdminFeedback
          status={list.status}
          error={list.error}
          retry={list.retry}
          noun="la bitácora"
        />
      ) : (
        <section className="admin-panel flex flex-col gap-4">
          {!list.items.length && (
            <p className="admin-muted">Todavía no hay operaciones registradas.</p>
          )}
          {list.items.map((event) => (
            <article key={event.id} className="admin-message">
              <h2>{labels[event.operation] ?? event.operation}</h2>
              <AdminFacts
                items={[
                  ['Actor (ID)', event.actorId ?? 'Evento sintético académico sin actor'],
                  ['Entidad', event.entityType],
                  ['Identificador afectado', event.entityId],
                  ['Fecha', adminDate(event.createdAt)],
                ]}
              />
            </article>
          ))}
          <AdminPagination list={list} />
        </section>
      )}
    </div>
  );
}
