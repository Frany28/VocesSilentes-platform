import { useEffect, useId, useRef } from 'react';
import { AdminIconButton } from './AdminIconButton.jsx';

/**
 * Diálogo nativo: contiene foco, restaura el disparador y bloquea scroll al anidar confirmaciones.
 * @param {{title: string, children: import('react').ReactNode, onClose: Function,
 * pending?: boolean, className?: string, initialFocus?: string}} props Configuración y contenido.
 * @returns {import('react').ReactElement} Modal accesible con Escape, cierre y backdrop.
 */
export function AdminDialog({
  title,
  children,
  onClose,
  pending = false,
  className = '',
  initialFocus,
}) {
  const ref = useRef();
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (dialog.showModal) dialog.showModal();
    else dialog.setAttribute('open', '');
    if (initialFocus) dialog.querySelector(initialFocus)?.focus();
    return () => {
      dialog.close?.();
      document.body.style.overflow = overflow;
      if (previous?.isConnected && !previous.closest('[inert]')) previous.focus();
    };
  }, [initialFocus]);
  const cancel = () => {
    if (!pending) onClose();
  };
  return (
    <dialog
      ref={ref}
      className={`admin-dialog ${className}`}
      aria-labelledby={titleId}
      aria-busy={pending || undefined}
      onCancel={(event) => {
        event.preventDefault();
        cancel();
      }}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.target === event.currentTarget &&
          (event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom)
        )
          cancel();
      }}
    >
      <header className="admin-dialog-heading">
        <h2 id={titleId}>{title}</h2>
        <AdminIconButton
          icon={className.includes('evidence-viewer') ? 'close' : 'close-muted'}
          label={`Cerrar ${title.toLocaleLowerCase('es')}`}
          onClick={cancel}
          disabled={pending}
        />
      </header>
      {children}
    </dialog>
  );
}
