import { Button } from '../../../components/ui/Button.jsx';
import { practiceAdvice, practiceOutcome } from './practice-feedback.js';
import { useEffect, useRef } from 'react';
import './practice-result.css';

/**
 * Recupera la candidata y distingue coincidencia, otra letra y abstención, sin validar LSV ni avanzar sola.
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
  const outcome = practiceOutcome(result, target);
  const candidate = outcome.startsWith('EXPERIMENTAL_') ? result.label : null;
  const matched = outcome === 'EXPERIMENTAL_MATCH';
  const title = matched
    ? 'Coincidencia experimental'
    : candidate
      ? target
        ? 'Buen intento'
        : 'Letra candidata'
      : outcome === 'REFERENCE_ONLY'
        ? 'Practica con la referencia'
        : 'Seña no reconocida';
  const panel = useRef(null);
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    panel.current?.scrollIntoView?.({ block: 'nearest', behavior: reduced ? 'instant' : 'smooth' });
  }, [result]);
  return (
    <section
      ref={panel}
      className="practice-result"
      data-outcome={matched ? 'success' : candidate ? 'candidate' : 'retry'}
      data-feedback={outcome}
      aria-label="Resultado de tu práctica"
    >
      <div className="practice-result-message" role="status" aria-live="polite" aria-atomic="true">
        <div className="practice-result-heading">
          <h3>{title}</h3>
          {candidate && (
            <span className="recognition-candidate" aria-label={`Letra candidata ${candidate}`}>
              {candidate}
            </span>
          )}
        </div>
        <p>{practiceAdvice(result, target)}</p>
        {candidate && (
          <p className="text-muted">
            Resultado experimental: no valida tu ejecución de LSV ni registra una calificación.
          </p>
        )}
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
