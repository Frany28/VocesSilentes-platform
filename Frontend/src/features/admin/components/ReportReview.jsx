import { useState } from 'react';
import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { adminDate } from '../data/admin-labels.js';
import { useReportResolution } from '../data/use-report-resolution.js';
import { ReportStatusConfirmation } from './ReportStatusConfirmation.jsx';
import { AdminFacts } from './AdminFacts.jsx';
import { ReportStatus } from './ReportStatus.jsx';
import { ReportAttachment } from './ReportAttachment.jsx';

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
      <ReportAttachment report={current} />
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
        density="compact"
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
        <Alert
          tone="success"
          title={current.status === 'RESOLVED' ? 'Reporte resuelto' : 'Reporte reabierto'}
        >
          El cambio de estado fue confirmado por el servicio.
        </Alert>
      )}
      {(current.status !== 'RESOLVED' || onResolve) && (
        <div className="admin-actions">
          <Button
            density="compact"
            icon={null}
            onClick={() => setConfirm(current.status === 'RESOLVED' ? 'PENDING' : 'RESOLVED')}
          >
            {current.status === 'RESOLVED' ? 'Reabrir reporte' : 'Marcar como resuelto'}
          </Button>
        </div>
      )}
      {confirm && (
        <ReportStatusConfirmation
          target={confirm}
          reference={current.reference}
          operation={operation}
          comment={comment}
          enabled={Boolean(onResolve)}
          onClose={() => setConfirm(false)}
        />
      )}
    </section>
  );
}
