import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { EvidencePicker } from './EvidencePicker.jsx';
import { ReportFields } from './ReportFields.jsx';
import { ReportGuidance } from './ReportGuidance.jsx';
import { ReportSuccess } from './ReportSuccess.jsx';
import { useReportDraft } from './use-report-draft.js';
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
  const navigate = useNavigate();
  const home = () => navigate('/student');
  const cancel = () => {
    if (draft.confirmLeave()) home();
  };
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
            <div className="report-actions">
              <Button
                density="compact"
                variant="secondary"
                icon={null}
                disabled={draft.pending}
                onClick={cancel}
              >
                Cancelar
              </Button>
              <Button
                density="compact"
                type="submit"
                icon={null}
                loading={draft.pending}
                disabled={draft.invalidSelection}
                loadingLabel={
                  draft.status === 'uploading'
                    ? 'Subiendo imagen…'
                    : draft.status === 'validating'
                      ? 'Validando…'
                      : 'Guardando…'
                }
              >
                {draft.status === 'error' ? 'Reintentar envío' : 'Enviar reporte'}
              </Button>
            </div>
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
    </div>
  );
}
