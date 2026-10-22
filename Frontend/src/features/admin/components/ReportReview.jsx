import { useState } from 'react';
import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { adminDate } from '../data/admin-labels.js';
import { useReportResolution } from '../data/use-report-resolution.js';
import { AdminConfirmation } from './AdminConfirmation.jsx';
import { AdminFacts } from './AdminFacts.jsx';
import { ReportStatus } from './ReportStatus.jsx';
import { ReportEvidence } from './ReportEvidence.jsx';
import { AuthorizedEvidence } from './AuthorizedEvidence.jsx';

/**
 * Revisión de un reporte suministrado, sin peticiones en la presentación ni éxito antes de persistir.
 * @param {{report: object, onResolve?: Function}} props Reporte autorizado y operación futura de resolución.
 * @returns {import('react').ReactElement} Mensaje, evidencia, contexto y modal de resolución.
 */
export function ReportReview({ report, onResolve }) {
  const [comment, setComment] = useState(report.internalComment ?? '');
  const [confirm, setConfirm] = useState(false);
  const operation = useReportResolution(onResolve, report);
  const current = operation.saved;
  return (
    <section className="admin-panel">
      <div className="admin-report-heading">
        <p className="admin-demo-note">
          {current.reference} · {current.category || 'CONTENIDO'}
        </p>
        <ReportStatus status={current.status} />
      </div>
      <h2>{current.title}</h2>
      <p className="admin-muted">
        {current.lesson} · {current.author} · {adminDate(current.createdAt)}
      </p>
      <section className="admin-message">
        <h3>Mensaje de la comunidad</h3>
        <p className="admin-muted">{current.description}</p>
      </section>
      {current.evidence?.state === 'READY' ? (
        <AuthorizedEvidence report={current} />
      ) : (
        <ReportEvidence evidence={current.evidence} />
      )}
      {current.evidence && current.evidence.state !== 'READY' && (
        <p role="status">La imagen todavía no está confirmada.</p>
      )}
      <AdminFacts
        items={[
          ['Categoría', current.categoryLabel || current.category || 'No indicada'],
          ['Creado', adminDate(current.createdAt)],
          ['Autor', `${current.author} · @${current.username}`],
          ['Última actualización', adminDate(current.updatedAt)],
          ['Módulo', current.module || 'No aplica'],
          ['Resuelto por', current.resolvedBy || 'Pendiente'],
          ['Lección', current.lesson || 'No aplica'],
          ['Fecha de resolución', adminDate(current.resolvedAt)],
          ['Ejercicio', current.exercise || 'No aplica · Reporte de lección'],
        ]}
      />
      <Input
        appearance="plain"
        label="Comentario interno (opcional)"
        placeholder="Agrega una nota para el equipo"
        help={
          onResolve
            ? 'Visible solo para administradores'
            : 'Guardado de comentarios pendiente de backend'
        }
        value={comment}
        maxLength={2000}
        disabled={operation.pending || current.status === 'RESOLVED'}
        onChange={(event) => setComment(event.target.value)}
      />
      {operation.success && (
        <Alert tone="success" title="Reporte resuelto">
          La resolución fue confirmada por el servicio.
        </Alert>
      )}
      {current.status !== 'RESOLVED' && (
        <div className="admin-actions">
          <Button icon={null} onClick={() => setConfirm(true)}>
            Marcar como resuelto
          </Button>
        </div>
      )}
      {confirm && (
        <AdminConfirmation
          title="Resolver reporte"
          confirm="Confirmar resolución"
          pending={operation.pending}
          error={operation.error}
          disabled={!onResolve}
          onCancel={() => setConfirm(false)}
          onConfirm={async () => {
            if (await operation.submit(comment)) setConfirm(false);
          }}
        >
          <p>Confirma que el problema de {current.reference} fue atendido.</p>
          <p>
            {onResolve
              ? 'Esta acción actualizará el estado del reporte a Resuelto.'
              : 'Acción no disponible: falta el servicio de resolución y guardado de comentarios.'}
          </p>
        </AdminConfirmation>
      )}
    </section>
  );
}
