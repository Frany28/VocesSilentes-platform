import { useEffect, useRef } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';

/**
 * Modal nativo con foco contenido, Escape, restauración de foco y scroll bloqueado.
 * @param {{title: string, children: import('react').ReactNode, confirm: string, onConfirm: Function,
 * onCancel: Function, pending?: boolean, error?: string}} props Mensaje y acciones del diálogo.
 * @returns {import('react').ReactElement} Diálogo; no confirma una operación antes de completarla.
 */
export function AdminConfirmation({
  title,
  children,
  confirm,
  onConfirm,
  onCancel,
  pending,
  error,
}) {
  const ref = useRef();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (dialog.showModal) dialog.showModal();
    else dialog.setAttribute('open', '');
    return () => {
      dialog.close?.();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="admin-dialog"
      aria-labelledby="admin-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onCancel();
      }}
    >
      <h2 id="admin-dialog-title">{title}</h2>
      <p>{children}</p>
      {error && (
        <Alert tone="error" title="No se pudo completar">
          {error}
        </Alert>
      )}
      <div className="admin-actions">
        <Button variant="secondary" icon={null} disabled={pending} onClick={onCancel} autoFocus>
          Cancelar
        </Button>
        <Button icon={null} loading={pending} onClick={onConfirm}>
          {confirm}
        </Button>
      </div>
    </dialog>
  );
}
