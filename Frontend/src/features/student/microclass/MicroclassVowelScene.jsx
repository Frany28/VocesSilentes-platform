import { MicroclassHand } from './MicroclassHand.jsx';
import { MicroclassCompare, MicroclassPractice } from './MicroclassVowelParts.jsx';
import { vowelFocus } from './microclass-focus.js';
import { vowelLetters } from './microclass-script.js';

/**
 * Escena de una vocal: presentación, detalle con acercamiento, foco/comparación y práctica.
 * @param {{letter: string, cue: number, elapsed: number, seconds: number}} props Vocal, frase y tiempo de la frase.
 * @returns {import('react').ReactElement} Mano a un lado y explicación al otro, sin superponerse.
 */
export function MicroclassVowelScene({ letter, cue, elapsed, seconds }) {
  const focus = vowelFocus[letter];
  const view = cue === 1 ? focus.detail : cue === 2 ? focus.focus : undefined;
  const position = vowelLetters.indexOf(letter);
  return (
    <div className="mc-scene mc-split mc-vowel">
      <div className="mc-hand-pane">
        <span className="mc-ghost" aria-hidden="true">
          {letter}
        </span>
        <MicroclassHand
          letter={letter}
          view={view}
          pulse={cue === 3}
          alt={`Ilustración del manual de LSV: mano realizando la vocal ${letter}`}
        />
      </div>
      <div className="mc-info">
        <ol className="mc-track" aria-label={`Vocal ${position + 1} de 5`}>
          {vowelLetters.map((item, index) => (
            <li
              key={item}
              data-state={index < position ? 'done' : index === position ? 'now' : undefined}
            >
              {item}
            </li>
          ))}
        </ol>
        <p className="mc-vtitle">
          <small>Vocal</small>
          <b>{letter}</b>
        </p>
        <div className="mc-slot">
          {cue === 1 && (
            <ul className="mc-chips" data-pop>
              {focus.keys.map((key, index) => (
                <li key={key} className="mc-chip" data-tone={index === 0 ? 'key' : undefined}>
                  {key}
                </li>
              ))}
            </ul>
          )}
          {cue === 2 && <MicroclassCompare letter={letter} other={focus.compare} />}
          {cue === 3 && (
            <MicroclassPractice
              letter={letter}
              left={seconds - elapsed}
              fraction={Math.min(1, elapsed / seconds)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
