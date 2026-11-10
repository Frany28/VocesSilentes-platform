import { MicroclassHand } from './MicroclassHand.jsx';
import { quizLetter, vowelLetters } from './microclass-script.js';

/**
 * Repaso: las cinco láminas se resaltan una a una mientras avanza la frase.
 * @param {{elapsed: number}} props Segundos transcurridos en la frase de repaso.
 * @returns {import('react').ReactElement} Fila de referencias con su letra escrita.
 */
export function MicroclassReview({ elapsed }) {
  const active = Math.floor((elapsed - 1.5) / 1.5);
  return (
    <div className="mc-scene mc-center">
      <p className="mc-eyebrow">Repaso</p>
      <p className="mc-display">Las cinco vocales</p>
      <div className="mc-review">
        {vowelLetters.map((letter, index) => (
          <div
            key={letter}
            className="mc-review-card"
            data-state={
              index === active ? 'now' : index < active || active >= 5 ? 'seen' : undefined
            }
          >
            <MicroclassHand letter={letter} credit={false} alt={`Vocal ${letter}`} />
            <b>{letter}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Pregunta «¿Puedes identificar esta vocal?» con la ficha sin rótulo y respuesta tras resolverla.
 * Acertar no certifica la ejecución de la seña y no se guarda en el progreso.
 * @param {{quiz: object, solved: boolean, onAnswer: Function, onReveal: Function}} props Estado y acciones.
 * @returns {import('react').ReactElement} Ilustración y cinco opciones accesibles.
 */
export function MicroclassQuiz({ quiz, solved, onAnswer, onReveal }) {
  const feedback = solved
    ? `Es la ${quizLetter}.`
    : quiz.wrong.length > 0
      ? 'Todavía no. Fíjate en el pulgar.'
      : '';
  return (
    <div className="mc-scene mc-split">
      <div className="mc-hand-pane">
        <MicroclassHand
          letter={quizLetter}
          hidePage={!solved}
          alt={
            solved
              ? `Ilustración de la vocal ${quizLetter}`
              : 'Ilustración del manual con una vocal por identificar'
          }
        />
      </div>
      <div className="mc-info">
        <p className="mc-eyebrow">Pregunta</p>
        <p className="mc-display" id="mc-quiz-question">
          ¿Puedes identificar esta vocal?
        </p>
        <div className="mc-options" role="group" aria-labelledby="mc-quiz-question">
          {vowelLetters.map((letter) => {
            const right = solved && letter === quizLetter;
            const wrong = quiz.wrong.includes(letter);
            return (
              <button
                key={letter}
                type="button"
                className="mc-option"
                data-state={right ? 'right' : wrong ? 'wrong' : undefined}
                disabled={solved || wrong}
                onClick={() => onAnswer(letter)}
              >
                {letter}
              </button>
            );
          })}
        </div>
        <div className="mc-quiz-foot">
          <p className="mc-feedback" data-state={solved ? 'right' : 'wrong'} role="status">
            {feedback}
          </p>
          {!solved && (
            <button className="mc-link" type="button" onClick={onReveal}>
              Mostrar respuesta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
