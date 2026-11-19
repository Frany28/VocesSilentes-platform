import { Button } from '../../../components/ui/Button.jsx';
import { practiceAdvice, practiceOutcome } from './practice-feedback.js';
import { useEffect, useRef } from 'react';
import './practice-result.css';

/**
 * Ayuda educativa sin convertir una candidata experimental en acierto, error o avance automático.
 * @param {{result: object, target?: string, onRetry: Function, onReference?: Function,
 * disabled?: boolean, onContinue?: Function}} props Resultado local y navegación del recorrido.
 * @returns {import('react').ReactElement} Ayuda para repetir, consultar la referencia o continuar voluntariamente.
 */
export function AttemptResult({ result, onRetry, onReference, disabled = false, onContinue }) {
  const panel = useRef(null);
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    panel.current?.scrollIntoView?.({ block: 'nearest', behavior: reduced ? 'instant' : 'smooth' });
  }, [result]);
  return (
    <section
      ref={panel}
      className="practice-result"
      data-outcome="retry"
      data-feedback={practiceOutcome(result)}
      aria-label="Resultado de tu práctica"
    >
      <div className="practice-result-message" role="status" aria-live="polite" aria-atomic="true">
        <div className="practice-result-heading">
          <h3>Vamos paso a paso</h3>
        </div>
        <p>{practiceAdvice(result)}</p>
      </div>
      <div className="practice-result-actions">
        <Button variant="secondary" icon={null} disabled={disabled} onClick={onRetry}>
          Repetir intento
        </Button>
        {onReference && (
          <Button variant="secondary" icon={null} onClick={onReference}>
            Ver referencia
          </Button>
        )}
        {onContinue && (
          <Button variant="secondary" icon={null} onClick={onContinue}>
            Continuar práctica
          </Button>
        )}
      </div>
    </section>
  );
}
