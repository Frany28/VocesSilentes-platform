import { HandIllustration } from '../recognition/HandIllustration.jsx';
import { letterResource } from '../resources/letter-resources.js';
import { vowelLetters } from './vowel-lesson.js';
import { differentiateChoices, recallChoices, vowelGuideMap } from './vowel-rounds.js';

/**
 * Referencia sin rótulo: la vocal sólo se nombra cuando el estudiante ya respondió.
 * @param {{letter: string, alt?: string}} props Vocal ilustrada y texto alternativo neutro.
 * @returns {import('react').ReactElement} Ilustración del manual.
 */
export function VowelReference({ letter, alt }) {
  return (
    <HandIllustration
      resource={letterResource(letter)}
      letter={letter}
      hand="Right"
      alt={alt ?? 'Referencia visual de una vocal por identificar'}
      showLabel={false}
    />
  );
}

/**
 * Estímulo principal de la ronda. Tras acertar se revela el rasgo que conviene recordar.
 * @param {{activityId: string, letter: string, revealed: boolean}} props Ronda y estado de respuesta.
 * @returns {import('react').ReactElement} Imagen o vocal solicitada.
 */
export function VowelStimulus({ activityId, letter, revealed }) {
  const guide = vowelGuideMap[letter];
  const showImage = activityId === 'identify' || revealed;
  return (
    <figure className="vowel-stimulus" data-kind={activityId} data-revealed={revealed || undefined}>
      {activityId !== 'identify' && (
        <span className="vowel-stimulus-letter" aria-label={`Vocal ${letter}`}>
          {letter}
        </span>
      )}
      {showImage && (
        <div
          className="vowel-stimulus-image"
          key={activityId === 'identify' || !revealed ? 'image' : 'revealed'}
        >
          <VowelReference
            letter={letter}
            alt={revealed ? `Referencia de la vocal ${letter}` : undefined}
          />
        </div>
      )}
      {revealed && (
        <figcaption className="vowel-stimulus-caption">
          <b>Rasgo clave de la {letter}</b>
          <span>{guide.comparison}</span>
        </figcaption>
      )}
    </figure>
  );
}

const prompts = {
  identify: () => '¿Qué vocal muestra esta referencia?',
  differentiate: (letter) => `¿Cuál referencia corresponde a la vocal ${letter}?`,
  recall: (letter) => `Sin mirar la ficha, ¿qué rasgo buscarías al formar la vocal ${letter}?`,
};

const groups = {
  identify: 'Selecciona una vocal',
  differentiate: 'Compara las dos referencias',
  recall: 'Selecciona el rasgo principal',
};

/**
 * Opciones de respuesta con estados visibles: elegida, correcta, incorrecta o ya probada.
 * @param {{activityId: string, letter: string, round: number, result: object|null,
 * tried: string[], onAnswer: Function}} props Ronda actual y respuestas previas.
 * @returns {import('react').ReactElement} Consigna y opciones accesibles.
 */
export function VowelOptions({ activityId, letter, round, result, tried, onAnswer }) {
  const choices =
    activityId === 'identify'
      ? vowelLetters
      : activityId === 'differentiate'
        ? differentiateChoices(letter, round)
        : recallChoices(letter);
  const stateOf = (choice) => {
    if (result?.choice === choice) return result.correct ? 'correct' : 'wrong';
    return tried.includes(choice) ? 'tried' : undefined;
  };
  return (
    <>
      <p className="vowel-question-prompt">{prompts[activityId](letter)}</p>
      <div
        className="vowel-options"
        data-kind={activityId}
        role="group"
        aria-label={groups[activityId]}
      >
        {choices.map((choice, index) => {
          const state = stateOf(choice);
          return (
            <button
              key={`${choice}-${index}`}
              type="button"
              data-state={state}
              disabled={Boolean(result) || state === 'tried'}
              onClick={() => onAnswer(choice)}
            >
              {activityId === 'identify' && choice}
              {activityId === 'recall' && vowelGuideMap[choice].description}
              {activityId === 'differentiate' && (
                <>
                  <VowelReference letter={choice} alt={`Referencia visual Opción ${index + 1}`} />
                  <span className="vowel-option-caption">Opción {index + 1}</span>
                </>
              )}
              {state === 'tried' && <span className="sr-only"> (ya probaste esta opción)</span>}
            </button>
          );
        })}
      </div>
    </>
  );
}
