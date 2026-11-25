import { Button } from '../../../components/ui/Button.jsx';
import { practiceAdvice, practiceOutcome } from './practice-feedback.js';
import { evidenceSummary } from './camera-stage.js';
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
    practiceOutcome(result) === 'UNCERTAIN' && result.reason === 'CANDIDATE' ? result.label : null;
  const matches = candidate && candidate === target;
  const otherVowel = target
    ? ` Estás practicando la ${target}. Compara tu mano con la referencia.`
    : '';
  const panel = useRef(null);
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    panel.current?.scrollIntoView?.({ block: 'nearest', behavior: reduced ? 'instant' : 'smooth' });
  }, [result]);
  // Con evidencia del motor geométrico, el resumen proviene de la misma fuente que el workspace.
  const summary =
    result.evidence && target && !result.captureIssue ? evidenceSummary(result, target) : null;
  return (
    <section
      ref={panel}
      className="practice-result"
      data-outcome={summary ? summary.id : candidate ? 'candidate' : 'retry'}
      data-feedback={practiceOutcome(result)}
      aria-label="Resultado de tu práctica"
    >
      <div className="practice-result-message" role="status" aria-live="polite" aria-atomic="true">
        <div className="practice-result-heading">
          <h3>
            {summary
              ? summary.title
              : matches
                ? 'Predicción coincidente'
                : candidate
                  ? 'El modelo propuso otra vocal'
                  : 'Vamos paso a paso'}
          </h3>
        </div>
        <p>
          {summary
            ? summary.guidance
            : matches
              ? `El modelo experimental propuso la ${candidate}, igual a la vocal solicitada. Esta coincidencia no certifica la ejecución.`
              : candidate
                ? `El modelo experimental propuso la ${candidate}.${otherVowel}`
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
