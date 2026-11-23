import { useEffect, useRef } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { VowelReference } from './VowelQuestion.jsx';
import { vowelGuideMap } from './vowel-rounds.js';

const hints = {
  identify: 'Fíjate en qué dedos están extendidos y en dónde queda el pulgar antes de elegir.',
  differentiate: (letter) => vowelGuideMap[letter].focus,
  recall: () => 'Imagina la forma de la mano antes de leer las opciones.',
};

function Message({ kicker, title, children }) {
  return (
    <>
      <p className="vowel-feedback-kicker">{kicker}</p>
      <h3>{title}</h3>
      {children}
    </>
  );
}

/**
 * Panel de explicación con altura estable: muestra una pista antes de responder y, después, por
 * qué la respuesta es correcta o qué distingue la opción elegida. Las acciones quedan fuera de la
 * región anunciada para no repetirlas al lector de pantalla.
 * @param {{activityId: string, letter: string, result: object|null, onRetry: Function,
 * onNext: Function, nextLabel: string, onPractice?: Function}} props Ronda y acciones.
 * @returns {import('react').ReactElement} Retroalimentación contextual de la ronda.
 */
export function VowelFeedbackPanel({
  activityId,
  letter,
  result,
  onRetry,
  onNext,
  nextLabel,
  onPractice,
}) {
  const guide = vowelGuideMap[letter];
  const state = !result ? 'idle' : result.correct ? 'correct' : 'wrong';
  const hint =
    typeof hints[activityId] === 'function' ? hints[activityId](letter) : hints[activityId];
  const panel = useRef(null);
  // En pantallas bajas la explicación puede quedar bajo el pie fijo: se acerca sin saltos bruscos.
  useEffect(() => {
    if (state === 'idle') return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    panel.current?.scrollIntoView?.({ block: 'nearest', behavior: reduced ? 'instant' : 'smooth' });
  }, [state]);
  return (
    <div className="vowel-feedback-panel" data-state={state} ref={panel}>
      <div className="vowel-feedback-message" role="status" aria-live="polite">
        <div className="vowel-feedback-body" key={state}>
          {state === 'idle' && (
            <Message kicker="Pista" title="Observa antes de elegir">
              <p>{hint}</p>
            </Message>
          )}
          {state === 'correct' && (
            <Message kicker="Respuesta correcta" title="¡Bien observado!">
              <p>
                La respuesta es {letter}. {guide.description}
              </p>
            </Message>
          )}
          {state === 'wrong' && (
            <Message kicker="Revisemos" title="Miremos la diferencia">
              <p>
                La opción elegida corresponde a {result.choice}. Para {letter}: {guide.focus}
              </p>
              {activityId !== 'recall' && (
                <div className="vowel-feedback-compare">
                  <VowelReference
                    letter={result.choice}
                    alt={`Referencia de la vocal ${result.choice}`}
                  />
                  <span>
                    <b>Así es la {result.choice}:</b> {vowelGuideMap[result.choice].description}
                  </span>
                </div>
              )}
            </Message>
          )}
        </div>
      </div>
      <div className="vowel-feedback-actions">
        {state === 'correct' && onPractice && (
          <Button variant="secondary" icon={null} onClick={onPractice}>
            Ahora realiza la seña
          </Button>
        )}
        {state === 'correct' && <Button onClick={onNext}>{nextLabel}</Button>}
        {state === 'wrong' && (
          <Button variant="secondary" icon={null} onClick={onRetry}>
            Intentar de nuevo
          </Button>
        )}
      </div>
    </div>
  );
}
