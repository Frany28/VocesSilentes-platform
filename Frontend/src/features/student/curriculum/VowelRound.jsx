import { useState } from 'react';
import { VowelFeedbackPanel } from './VowelFeedbackPanel.jsx';
import { VowelOptions, VowelStimulus } from './VowelQuestion.jsx';

/**
 * Una ronda de selección múltiple en dos zonas: el estímulo a un lado y, al otro, consigna,
 * opciones y retroalimentación en un panel de altura estable. Las opciones falladas quedan
 * marcadas para que el reintento se centre en las restantes.
 * @param {{activityId: string, letter: string, round: number, onAnswer: Function, onNext: Function,
 * nextLabel: string, onPractice?: Function}} props Ronda y acciones del recorrido.
 * @returns {import('react').ReactElement} Ronda interactiva sin revelar la clave antes de responder.
 */
export function VowelRound({ activityId, letter, round, onAnswer, onNext, nextLabel, onPractice }) {
  const [result, setResult] = useState(null);
  const [tried, setTried] = useState([]);
  const answer = (choice) => {
    const correct = choice === letter;
    onAnswer(letter, correct);
    setResult({ choice, correct });
    if (!correct) setTried((previous) => [...previous, choice]);
  };
  return (
    <div
      className="vowel-round"
      data-kind={activityId}
      data-state={result ? (result.correct ? 'correct' : 'wrong') : 'idle'}
    >
      <div className="vowel-round-stimulus">
        <VowelStimulus
          activityId={activityId}
          letter={letter}
          revealed={Boolean(result?.correct)}
        />
      </div>
      <div className="vowel-round-response">
        <VowelOptions
          activityId={activityId}
          letter={letter}
          round={round}
          result={result}
          tried={tried}
          onAnswer={answer}
        />
        <VowelFeedbackPanel
          activityId={activityId}
          letter={letter}
          result={result}
          onRetry={() => setResult(null)}
          onNext={onNext}
          nextLabel={nextLabel}
          onPractice={onPractice}
        />
      </div>
    </div>
  );
}
