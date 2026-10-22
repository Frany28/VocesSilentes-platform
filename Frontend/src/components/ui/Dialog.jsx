import { useId } from 'react';
import { IconAction } from './IconAction.jsx';
import { useDialog } from '../../hooks/use-dialog.js';

/**
 * Diálogo nativo: contiene foco, restaura el disparador y bloquea scroll al anidar confirmaciones.
 * @param {{title: string, children: import('react').ReactNode, onClose: Function,
 * pending?: boolean, className?: string, initialFocus?: string}} props Configuración y contenido.
 * @returns {import('react').ReactElement} Modal accesible con Escape, cierre y backdrop.
 */
export function Dialog({
  title,
  children,
  onClose,
  pending = false,
  className = '',
  initialFocus,
}) {
  const { ref, trapFocus } = useDialog(initialFocus);
  const titleId = useId();
  const cancel = () => {
    if (!pending) onClose();
  };
  return (
    <dialog
      ref={ref}
      className={`vs-dialog ${className}`}
      aria-labelledby={titleId}
      aria-modal="true"
      aria-busy={pending || undefined}
      onKeyDown={trapFocus}
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
      <header className="vs-dialog-heading">
        <h2 id={titleId}>{title}</h2>
        <IconAction
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
