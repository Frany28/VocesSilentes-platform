import { useState } from 'react';
import { useParams } from 'react-router';
import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { useAdmin } from '../data/admin-context.js';
import { adminDate } from '../data/admin-labels.js';
import { AdminHeading } from '../components/AdminHeading.jsx';
import { AdminAction } from '../components/AdminAction.jsx';
import { ReportContext } from '../components/ReportContext.jsx';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
import { AdminConfirmation } from '../components/AdminConfirmation.jsx';
import { ReportStatus } from '../components/ReportStatus.jsx';
/**
 * Revisión de un reporte demo: comentario, confirmación y resolución/reapertura en memoria.
 * @returns {import('react').ReactElement} Detalle identificado, sin peticiones de persistencia.
 */
export function AdminReportDetail() {
  const { id } = useParams();
  const { reports, demoAction, preview, retry } = useAdmin();
  const report = reports.find((item) => item.id === id);
  const [comment, setComment] = useState(report?.internalComment ?? '');
  const [confirm, setConfirm] = useState(false);
  const [notice, setNotice] = useState(null);
  const update = () => {
    const resolved = report.status !== 'RESOLVED';
    demoAction('reports', id, {
      status: resolved ? 'RESOLVED' : 'PENDING',
      internalComment: comment,
      resolvedBy: resolved ? 'Administrador de demostración' : null,
      resolvedAt: resolved ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    });
    setConfirm(false);
    setNotice(
      'Demostración actualizada en memoria. El reporte y el comentario no se guardaron en la base de datos.',
    );
  };
  return (
    <div className="admin-page">
      <AdminHeading title="Detalle de reporte">
        Revisa el contexto y registra el estado del reporte.
      </AdminHeading>
      <p className="admin-demo-note">
        Reporte de demostración. Resolver, reabrir y comentar solo modifica datos en memoria.
      </p>
      {!report || preview !== 'ready' ? (
        <AdminFeedback noun="el reporte" status={!report ? 'error' : preview} retry={retry} />
      ) : (
        <>
          {notice && (
            <Alert title="Demostración" tone="info">
              {notice}
            </Alert>
          )}
          <section className="admin-panel">
            <p className="admin-kicker">{report.reference} · CONTENIDO</p>
            <h2>{report.title}</h2>
            <ReportStatus status={report.status} />
            <p className="admin-muted">
              {report.lesson} · {report.author} · {adminDate(report.createdAt)}
            </p>
            <ReportContext report={report} />
            <Input
              appearance="plain"
              label="Comentario interno (opcional)"
              placeholder="Agrega una nota para el equipo"
              help="Nota de demostración; no se guarda en el servidor"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={2000}
            />
            <div className="admin-actions">
              <Button icon={null} onClick={() => setConfirm(true)}>
                {report.status === 'RESOLVED' ? 'Reabrir reporte' : 'Marcar como resuelto'}
              </Button>
              <AdminAction to="/admin/reports">Volver a reportes</AdminAction>
            </div>
          </section>
          {confirm && (
            <AdminConfirmation
              title={
                report.status === 'RESOLVED'
                  ? '¿Reabrir este reporte de demostración?'
                  : '¿Marcar como resuelto?'
              }
              confirm="Aplicar demostración"
              onConfirm={update}
              onCancel={() => setConfirm(false)}
            >
              Confirma que revisaste el reporte {report.reference}. Este cambio es una simulación
              local y se reinicia al recargar.
            </AdminConfirmation>
          )}
        </>
      )}
    </div>
  );
}
