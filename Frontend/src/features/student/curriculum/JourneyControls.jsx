import { Button } from '../../../components/ui/Button.jsx';

/**
 * Fija acciones de regreso y avance; también envía un formulario nativo desde el pie.
 * @param {{onBack?: Function, onContinue?: Function, label?: string, disabled?: boolean,
 * pending?: boolean, form?: string, loadingLabel?: string, hint?: string}} props Acciones del paso
 * actual; hint explica junto al botón qué falta para continuar.
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
  hint,
}) {
  return (
    <footer className="journey-controls">
      <Button variant="secondary" icon={null} disabled={!onBack || pending} onClick={onBack}>
        Volver
      </Button>
      {hint && (
        <p className="journey-controls-hint" role="status">
          {hint}
        </p>
      )}
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
