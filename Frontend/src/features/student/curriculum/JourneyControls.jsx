import { Button } from '../../../components/ui/Button.jsx';

/**
 * Fija acciones de regreso y avance; también envía un formulario nativo desde el pie.
 * @param {{onBack?: Function, onContinue?: Function, label?: string, disabled?: boolean,
 * pending?: boolean, form?: string, loadingLabel?: string}} props Acciones del paso actual.
 * @returns {import('react').ReactElement} Controles accesibles, sin navegación durante una comprobación.
 */
export function JourneyControls({
  onBack,
  onContinue,
  label = 'Continuar',
  disabled,
  pending,
  form,
  loadingLabel = 'Comprobando…',
}) {
  return (
    <footer className="journey-controls">
      <Button variant="secondary" icon={null} disabled={!onBack || pending} onClick={onBack}>
        Volver
      </Button>
      <Button
        form={form}
        type={form ? 'submit' : 'button'}
        onClick={onContinue}
        disabled={disabled}
        loading={pending}
        loadingLabel={loadingLabel}
      >
        {label}
      </Button>
    </footer>
  );
}
