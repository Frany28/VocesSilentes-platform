import { useMemo, useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { HandIllustration } from '../recognition/HandIllustration.jsx';
import { letterResource } from '../resources/letter-resources.js';
import { vowelGuides, vowelLetters } from './vowel-lesson.js';

const guides = Object.fromEntries(vowelGuides.map((guide) => [guide.letter, guide]));

function HiddenReference({ letter, option }) {
  return (
    <figure className="vowel-hidden-reference">
      <HandIllustration
        resource={letterResource(letter)}
        letter={letter}
        hand="Right"
        alt={
          option ? `Referencia visual ${option}` : 'Referencia visual de una vocal por identificar'
        }
        showLabel={false}
      />
      {option && <figcaption>{option}</figcaption>}
    </figure>
  );
}

function IdentifyQuestion({ letter, onAnswer, disabled }) {
  return (
    <>
      <HiddenReference letter={letter} />
      <p className="vowel-question-prompt">¿Qué vocal muestra esta referencia?</p>
      <div className="vowel-answer-grid" role="group" aria-label="Selecciona una vocal">
        {vowelLetters.map((option) => (
          <button key={option} type="button" disabled={disabled} onClick={() => onAnswer(option)}>
            {option}
          </button>
        ))}
      </div>
    </>
  );
}

function DifferentiateQuestion({ letter, round, onAnswer, disabled }) {
  const other = guides[letter].compareWith;
  const choices = round % 2 ? [other, letter] : [letter, other];
  return (
    <>
      <p className="vowel-question-prompt">¿Cuál referencia corresponde a la vocal {letter}?</p>
      <div className="vowel-visual-options" role="group" aria-label="Compara las dos referencias">
        {choices.map((choice, index) => (
          <button
            key={`${choice}-${index}`}
            type="button"
            disabled={disabled}
            onClick={() => onAnswer(choice)}
          >
            <HiddenReference letter={choice} option={`Opción ${index + 1}`} />
          </button>
        ))}
      </div>
    </>
  );
}

function RecallQuestion({ letter, onAnswer, disabled }) {
  const options = useMemo(() => {
    const start = vowelLetters.indexOf(letter);
    return vowelLetters.map((_, index) => vowelLetters[(start + index * 2) % vowelLetters.length]);
  }, [letter]);
  return (
    <>
      <div className="vowel-recall-letter" aria-hidden="true">
        {letter}
      </div>
      <p className="vowel-question-prompt">
        Sin mirar la ficha, ¿qué rasgo buscarías al formar la vocal {letter}?
      </p>
      <div className="vowel-text-options" role="group" aria-label="Selecciona el rasgo principal">
        {options.map((option) => (
          <button key={option} type="button" disabled={disabled} onClick={() => onAnswer(option)}>
            {guides[option].description}
          </button>
        ))}
      </div>
    </>
  );
}

/**
 * Actividad formativa de cinco rondas. La respuesta permanece oculta hasta elegir y cada error se
 * explica antes de reintentar; el resultado sólo se conserva como práctica local.
 * @param {{activity: object, saved: object, onAnswer: Function, onReset: Function}} props Estado formativo.
 * @returns {import('react').ReactElement} Identificación, comparación o recuperación activa.
 */
export function VowelActivity({ activity, saved, onAnswer, onReset }) {
  const firstPending = vowelLetters.findIndex((letter) => !saved?.answers?.[letter]?.correct);
  const [round, setRound] = useState(firstPending < 0 ? 0 : firstPending);
  const [result, setResult] = useState(null);
  const completed = vowelLetters.every((letter) => saved?.answers?.[letter]?.correct);
  const letter = vowelLetters[round];
  const answer = (choice) => {
    const correct = choice === letter;
    onAnswer(activity.id, letter, correct);
    setResult({ choice, correct });
  };
  const next = () => {
    setResult(null);
    const pending = vowelLetters.findIndex(
      (item, index) => index > round && !saved?.answers?.[item]?.correct,
    );
    setRound(pending >= 0 ? pending : Math.min(vowelLetters.length - 1, round + 1));
  };
  const Question = {
    identify: IdentifyQuestion,
    differentiate: DifferentiateQuestion,
    recall: RecallQuestion,
  }[activity.id];
  if (completed)
    return (
      <section
        className="education-card vowel-activity-complete"
        aria-label={`${activity.title} completada`}
      >
        <p className="journey-eyebrow text-action">ACTIVIDAD COMPLETADA</p>
        <h2>{activity.title}</h2>
        <p>Respondiste las cinco vocales. Puedes repetir para reforzar la memoria.</p>
        <Button
          variant="secondary"
          icon={null}
          onClick={() => {
            onReset(activity.id);
            setRound(0);
            setResult(null);
          }}
        >
          Repetir actividad
        </Button>
      </section>
    );
  return (
    <section className="education-card vowel-activity" aria-labelledby={`activity-${activity.id}`}>
      <header className="vowel-section-heading">
        <p className="journey-eyebrow text-action">COMPRUEBA LO APRENDIDO</p>
        <h2 id={`activity-${activity.id}`}>{activity.title}</h2>
        <p>{activity.description}</p>
      </header>
      <div className="vowel-round-track" aria-label={`Ronda ${round + 1} de 5`}>
        {vowelLetters.map((item, index) => (
          <span
            key={item}
            data-state={
              saved?.answers?.[item]?.correct ? 'done' : index === round ? 'now' : undefined
            }
          >
            {index + 1}
          </span>
        ))}
      </div>
      <div className="vowel-question">
        <Question letter={letter} round={round} onAnswer={answer} disabled={Boolean(result)} />
      </div>
      {result && (
        <div
          className="vowel-answer-feedback"
          data-correct={result.correct || undefined}
          role="status"
          aria-live="polite"
        >
          <h3>{result.correct ? '¡Bien observado!' : 'Miremos la diferencia'}</h3>
          <p>
            {result.correct
              ? `La respuesta es ${letter}. ${guides[letter].description}`
              : `La opción elegida corresponde a ${result.choice}. Para ${letter}: ${guides[letter].focus}`}
          </p>
          {activity.id !== 'recall' && (
            <div className="vowel-feedback-reference">
              <HiddenReference letter={letter} />
              <span>Respuesta: vocal {letter}</span>
            </div>
          )}
          {result.correct ? (
            <Button onClick={next}>Siguiente vocal</Button>
          ) : (
            <Button variant="secondary" icon={null} onClick={() => setResult(null)}>
              Intentar de nuevo
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
