import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ReportActions } from './ReportActions.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { EvidencePicker } from './EvidencePicker.jsx';
import { ReportFields } from './ReportFields.jsx';
import { ReportGuidance } from './ReportGuidance.jsx';
import { ReportSuccess } from './ReportSuccess.jsx';
import { useReportDraft } from './use-report-draft.js';
import { useDraftLeave } from '../../hooks/use-draft-leave.js';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog.jsx';
import '../account/styles/account.css';
import './report.css';

/**
 * Formulario real: la clave del borrador solo cambia al crear otro reporte tras éxito confirmado.
 * @returns {import('react').ReactElement} Composición de Figma con evidencia opcional y reintento.
 */
export function ReportForm() {
  const [revision, setRevision] = useState(0);
  return <ReportDraft key={revision} onReset={() => setRevision((value) => value + 1)} />;
}

function ReportDraft({ onReset }) {
  const draft = useReportDraft();
  const leave = useDraftLeave(draft.dirty, draft.pending, '/student');
  const navigate = useNavigate();
  const home = () => navigate('/student');
  return (
    <div className="account-page report-page">
      <header className="account-heading">
        <p className="account-kicker">AYUDA Y CUENTA / REPORTAR UN ERROR</p>
        <h1>Una barrera menos.</h1>
        <p>Cuéntanos qué pasó para seguir mejorando VocesSilentes.</p>
      </header>
      {draft.status === 'success' ? (
        <ReportSuccess id={draft.savedId} onReset={onReset} onHome={home} />
      ) : (
        <form className="report-grid" onSubmit={draft.submit} noValidate aria-busy={draft.pending}>
          <section className="account-panel report-form-panel">
            <h2>¿Qué ocurrió?</h2>
            <p className="account-caption">Los campos con * son obligatorios.</p>
            <ReportFields draft={draft} />
            {draft.savedId && (
              <p role="status">Reporte guardado. La imagen se confirma por separado.</p>
            )}
            {draft.error && (
              <Alert density="compact" tone="error" title="No se completó el envío">
                {draft.error}
              </Alert>
            )}
            <ReportActions draft={draft} onCancel={() => leave.requestLeave(home)} />
          </section>
          <div className="report-aside">
            <EvidencePicker
              selection={draft.selection}
              onSelect={draft.select}
              disabled={draft.pending || draft.selectionLocked}
              invalid={draft.invalidSelection}
            />
            <ReportGuidance />
          </div>
        </form>
      )}
      {draft.status !== 'success' && (
        <p className="account-caption">Tu reporte se enviará desde tu cuenta de VocesSilentes.</p>
      )}
      {leave.confirm && (
        <ConfirmationDialog
          title="¿Descartar los cambios?"
          confirm="Descartar cambios"
          onCancel={leave.cancel}
          onConfirm={leave.proceed}
          pending={draft.pending}
        >
          El envío no está completo. Los datos que no has guardado se perderán al salir.
        </ConfirmationDialog>
      )}
    </div>
  );
}
