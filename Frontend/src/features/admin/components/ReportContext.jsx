import { adminDate } from '../data/admin-labels.js';
import { AdminFacts } from './AdminFacts.jsx';
/**
 * Mensaje y referencias del reporte, sin inventar vídeo o enlaces a contenido no publicado.
 * @param {{report: object}} props Reporte de demostración.
 * @returns {import('react').ReactElement} Contexto legible de la revisión.
 */
export function ReportContext({ report }) {
  return (
    <>
      <section className="admin-panel admin-message">
        <p>Mensaje del usuario</p>
        <p className="admin-muted">{report.description}</p>
      </section>
      <AdminFacts
        items={[
          ['Categoría', 'Contenido / Vídeo'],
          ['Autor', `${report.author} · @${report.username}`],
          ['Módulo', report.module],
          ['Lección', report.lesson],
          ['Ejercicio', report.exercise || 'No aplica · Reporte de lección'],
          ['Creado', adminDate(report.createdAt)],
          ['Última actualización', adminDate(report.updatedAt)],
          ['Resuelto por', report.resolvedBy || 'Pendiente'],
          ['Fecha de resolución', adminDate(report.resolvedAt)],
        ]}
      />
    </>
  );
}
