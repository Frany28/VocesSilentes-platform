import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { AdminDialog } from './AdminDialog.jsx';

/**
 * Confirmación nativa compartida; no comunica éxito ni ejecuta negocio por su cuenta.
 * @param {{title: string, children: import('react').ReactNode, confirm: string, onConfirm: Function,
 * onCancel: Function, pending?: boolean, error?: string, disabled?: boolean, danger?: boolean}} props Confirmación.
 * @returns {import('react').ReactElement} Diálogo con cancelación inicial y envío protegido.
 */
export function AdminConfirmation({
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
    <AdminDialog title={title} onClose={onCancel} pending={pending} initialFocus="[data-cancel]">
      <div className="admin-dialog-description">{children}</div>
      {error && (
        <Alert tone="error" title="No se pudo completar">
          {error}
        </Alert>
      )}
      <div className="admin-actions">
        <Button variant="secondary" icon={null} disabled={pending} onClick={onCancel} data-cancel>
          Cancelar
        </Button>
        <Button
          icon={null}
          loading={pending}
          onClick={onConfirm}
          disabled={disabled}
          className={danger ? 'admin-danger' : ''}
        >
          {confirm}
        </Button>
      </div>
    </AdminDialog>
  );
}
