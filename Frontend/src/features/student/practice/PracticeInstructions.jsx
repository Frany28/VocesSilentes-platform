import { useEffect, useId, useRef } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { PracticeGuide } from './PracticeGuide.jsx';

/**
 * Presenta la composición Instrucciones de Figma en diálogo nativo con foco contenido y Escape.
 * @param {{onClose: Function}} props Cierre que restaura el foco del botón que lo abrió.
 * @returns {import('react').ReactElement} Instrucciones sin acciones de persistencia.
 */
export function PracticeInstructions({ onClose }) {
  const ref = useRef();
  const title = useId();
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
      className="practice-instructions"
      aria-labelledby={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <h2 id={title} className="sr-only">
        Instrucciones de práctica
      </h2>
      <PracticeGuide />
      <Button className="w-full!" icon={null} onClick={onClose} autoFocus>
        Volver a practicar
      </Button>
    </dialog>
  );
}
