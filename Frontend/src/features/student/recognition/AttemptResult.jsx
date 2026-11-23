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
export function AttemptResult({
  result,
  target,
  onRetry,
  onReference,
  disabled = false,
  onContinue,
}) {
  const candidate =
    practiceOutcome(result) === 'UNCERTAIN' && result.reason === 'CANDIDATE'
      ? result.label
      : null;
  const matches = candidate && candidate === target;
  const otherVowel = target
    ? ` Estás practicando la ${target}. Compara tu mano con la referencia.`
    : '';
  const panel = useRef(null);
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    panel.current?.scrollIntoView?.({ block: 'nearest', behavior: reduced ? 'instant' : 'smooth' });
  }, [result]);
  return (
    <section
      ref={panel}
      className="practice-result"
      data-outcome={matches ? 'success' : candidate && !target ? 'candidate' : 'retry'}
      data-feedback={practiceOutcome(result)}
      aria-label="Resultado de tu práctica"
    >
      <div className="practice-result-message" role="status" aria-live="polite" aria-atomic="true">
        <div className="practice-result-heading">
          <h3>
            {matches ? 'Coincide con la vocal' : candidate ? 'Vocal reconocida' : 'Vamos paso a paso'}
          </h3>
        </div>
        <p>
          {matches
            ? `El modelo reconoció la ${candidate}, la vocal solicitada.`
            : candidate
              ? `El modelo reconoció la ${candidate}.${otherVowel}`
              : result.reason === 'UNSUPPORTED_HAND' && !result.captureIssue
                ? 'La cámara detectó tu mano, pero el modelo no puede reconocer vocales con esa mano.'
                : practiceAdvice(result)}
        </p>
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
