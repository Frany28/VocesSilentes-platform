import { Button } from '../../components/ui/Button.jsx';

/**
 * Acciones existentes del reporte, separadas de campos y evidencia; no envía peticiones.
 * @param {{draft: object, onCancel: Function}} props Estado de envío y solicitud de salida confirmada.
 * @returns {import('react').ReactElement} Cancelar y enviar con sus estados reales.
 */
export function ReportActions({ draft, onCancel }) {
  return (
    <div className="report-actions">
      <Button
        density="compact"
        variant="secondary"
        icon={null}
        disabled={draft.pending}
        onClick={onCancel}
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
  );
}
