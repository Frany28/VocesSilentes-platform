import { useId } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { PracticeGuide } from './PracticeGuide.jsx';
import { useDialog } from '../../../hooks/use-dialog.js';

/**
 * Presenta la composición Instrucciones de Figma en diálogo nativo con foco contenido y Escape.
 * @param {{onClose: Function}} props Cierre que restaura el foco del botón que lo abrió.
 * @returns {import('react').ReactElement} Instrucciones sin acciones de persistencia.
 */
export function PracticeInstructions({ onClose }) {
  const { ref, trapFocus } = useDialog('[data-practice-close]');
  const title = useId();
  return (
    <dialog
      ref={ref}
      className="practice-instructions"
      aria-labelledby={title}
      aria-modal="true"
      onKeyDown={trapFocus}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <h2 id={title} className="sr-only">
        Instrucciones de práctica
      </h2>
      <PracticeGuide />
      <Button data-practice-close className="w-full!" icon={null} onClick={onClose}>
        Volver a practicar
      </Button>
    </dialog>
  );
}
