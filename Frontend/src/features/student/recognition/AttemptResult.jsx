import { Button } from '../../../components/ui/Button.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { useCandidateContinuation } from './use-candidate-continuation.js';
import { practiceAdvice } from './practice-feedback.js';
import { useEffect, useRef } from 'react';
import './practice-result.css';

/**
 * Presenta la predicción real como guía educativa: solo la coincidencia permite continuar.
 * No convierte detección, falta de datos ni candidata en una evaluación lingüística o nota.
 * @param {{result: object, target?: string, onRetry: Function,
 * disabled?: boolean, onContinue?: Function}} props Resultado local y navegación del recorrido.
 * @returns {import('react').ReactElement} Confirmación, ayuda para repetir y siguiente acción.
 */
export function AttemptResult({ result, target, onRetry, disabled = false, onContinue }) {
  const continuation = useCandidateContinuation(result, target, onContinue, !disabled);
  const matched = Boolean(result.label && result.label === target);
  const panel = useRef(null);
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    panel.current?.scrollIntoView?.({ block: 'nearest', behavior: reduced ? 'instant' : 'smooth' });
  }, [result]);
  const title = matched
    ? '¡Muy bien!'
    : result.label
      ? target
        ? 'Vamos a intentarlo de nuevo'
        : 'Vocal encontrada'
      : 'Vamos paso a paso';
  return (
    <section
      ref={panel}
      className="practice-result"
      data-outcome={matched ? 'success' : result.label && !target ? 'candidate' : 'retry'}
      aria-label="Resultado de tu práctica"
    >
      <div className="practice-result-message" role="status" aria-live="polite" aria-atomic="true">
        <div className="practice-result-heading">
          {matched && <Icon name="check" tone="success" size={20} />}
          <h3>{title}</h3>
          {result.label && (
            <span className="recognition-candidate" aria-label={`Letra candidata ${result.label}`}>
              {result.label}
            </span>
          )}
        </div>
        <p>
          {matched ? `Tu intento coincide con la letra ${target}.` : practiceAdvice(result, target)}
        </p>
        {matched && (
          <p className="practice-achieved">Paso de práctica logrado · Puedes continuar</p>
        )}
      </div>
      <div className="practice-result-actions">
        {matched && onContinue && <Button onClick={continuation.continueNow}>Continuar</Button>}
        <Button variant="secondary" icon={null} disabled={disabled} onClick={onRetry}>
          Repetir intento
        </Button>
      </div>
      {continuation.advancing && (
        <div className="practice-next">
          <p>Seguimos al siguiente paso en 3 segundos.</p>
          <Button variant="secondary" icon={null} onClick={continuation.stay}>
            Seguir practicando aquí
          </Button>
        </div>
      )}
    </section>
  );
}
