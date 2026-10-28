import { Button } from './Button.jsx';
import { Alert } from './Alert.jsx';
import { Dialog } from './Dialog.jsx';

/**
 * Confirmación nativa compartida; no comunica éxito ni ejecuta negocio por su cuenta.
 * @param {{title: string, children: import('react').ReactNode, confirm: string, onConfirm: Function,
 * onCancel: Function, pending?: boolean, error?: string, disabled?: boolean, danger?: boolean}} props Confirmación.
 * @returns {import('react').ReactElement} Diálogo con cancelación inicial y envío protegido.
 */
export function ConfirmationDialog({
  title,
  children,
  confirm,
  onConfirm,
  onCancel,
  pending,
  error,
  disabled,
  danger = false,
}) {
  return (
    <Dialog title={title} onClose={onCancel} pending={pending} initialFocus="[data-cancel]">
      <div className="vs-dialog-description">{children}</div>
      {error && (
        <Alert tone="error" title="No se pudo completar">
          {error}
        </Alert>
      )}
      <div className="vs-confirmation-actions">
        <Button
          density="compact"
          variant="secondary"
          icon={null}
          disabled={pending}
          onClick={onCancel}
          data-cancel
        >
          Cancelar
        </Button>
        <Button
          density="compact"
          icon={null}
          loading={pending}
          onClick={onConfirm}
          disabled={disabled}
          className={danger ? 'admin-danger' : ''}
        >
          {confirm}
        </Button>
      </div>
    </Dialog>
  );
}
