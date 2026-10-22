import { Link } from 'react-router';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { EvidencePicker } from './EvidencePicker.jsx';
import { useReportDraft } from './use-report-draft.js';

/**
 * Envía un reporte general real y su evidencia opcional; conserva el borrador tras fallo de carga.
 * @returns {import('react').ReactElement} Formulario con progreso real por etapas y reintento explícito.
 */
export function ReportForm() {
  const draft = useReportDraft();
  return (
    <section className="flex flex-col gap-6 rounded-3xl border border-border bg-surface p-6">
      <h1 className="[font:var(--type-h3)]">Reportar un error</h1>
      {draft.status === 'success' ? (
        <Alert tone="success" title="Reporte enviado">
          Guardamos tu reporte y confirmamos el envío.
        </Alert>
      ) : (
        <form className="flex flex-col gap-6" onSubmit={draft.submit} aria-busy={draft.pending}>
          <fieldset disabled={draft.pending || draft.submitted} className="flex flex-col gap-4">
            <Input
              label="Descripción"
              value={draft.description}
              required
              maxLength={4000}
              onChange={(event) => draft.setDescription(event.target.value)}
            />
            <label className="flex flex-col gap-2">
              Categoría
              <select
                value={draft.category}
                onChange={(event) => draft.setCategory(event.target.value)}
                className="rounded-xl border border-border bg-surface p-3 text-content"
              >
                <option value="TECHNICAL">Problema técnico</option>
                <option value="CONTENT">Contenido</option>
                <option value="OTHER">Otro</option>
              </select>
            </label>
          </fieldset>
          <EvidencePicker
            selection={draft.selection}
            onSelect={draft.select}
            disabled={draft.pending || draft.selectionLocked}
            invalid={draft.invalidSelection}
          />
          {draft.savedId && (
            <p role="status">Reporte guardado. La imagen se confirma por separado.</p>
          )}
          {draft.error && (
            <Alert tone="error" title="No se completó el envío">
              {draft.error}
            </Alert>
          )}
          <Button
            type="submit"
            loading={draft.pending}
            disabled={draft.pending || draft.invalidSelection || !draft.description.trim()}
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
        </form>
      )}
      <Link
        to="/student"
        onClick={(event) => {
          if (
            draft.dirty &&
            !window.confirm('El envío no está completo. ¿Salir y dejar este borrador?')
          )
            event.preventDefault();
        }}
      >
        Volver a mi inicio
      </Link>
    </section>
  );
}
