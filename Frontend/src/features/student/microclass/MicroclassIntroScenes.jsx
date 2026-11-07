import { letterResource } from '../resources/letter-resources.js';
import { vowelLetters } from './microclass-script.js';

/**
 * Cinco láminas flotantes que acompañan la introducción; son decorativas.
 * @returns {import('react').ReactElement} Grupo oculto a tecnologías de apoyo.
 */
export function MicroclassOrbit() {
  return (
    <div className="mc-orbit" aria-hidden="true">
      {vowelLetters.map((letter) => (
        <img key={letter} src={letterResource(letter).url} alt="" />
      ))}
    </div>
  );
}

const Chip = ({ show, cue, tone, children }) => (
  <li className="mc-chip" data-tone={tone} data-on={String(show.includes(cue))}>
    {children}
  </li>
);

/**
 * Escenas de introducción: por qué aprender LSV, el alfabeto manual y el método de práctica.
 * @param {{type: string, cue: number}} props Escena y frase actual.
 * @returns {import('react').ReactElement} Escena con palabras clave sincronizadas con la narración.
 */
export function MicroclassIntroScene({ type, cue }) {
  if (type === 'method')
    return (
      <div className="mc-scene mc-method">
        <p className="mc-eyebrow">Para cada vocal</p>
        <p className="mc-display">Tres pasos</p>
        <ol className="mc-steps">
          <li>
            <b>1</b>
            <span>Observa</span>
            <small>La mano, los dedos y el pulgar</small>
          </li>
          <li>
            <b>2</b>
            <span>Lee</span>
            <small>Qué distingue a cada vocal</small>
          </li>
          <li>
            <b>3</b>
            <span>Intenta</span>
            <small>Forma la letra con calma</small>
          </li>
        </ol>
      </div>
    );
  const why = type === 'why';
  return (
    <div className="mc-scene mc-split">
      <MicroclassOrbit />
      <div className="mc-say">
        <p className="mc-eyebrow">{why ? 'Lengua de Señas Venezolana' : 'Primer paso'}</p>
        <p className="mc-display">
          {why ? 'Una lengua ' : 'El '}
          <em>{why ? 'que se ve' : 'alfabeto manual'}</em>
        </p>
        <ul className="mc-chips">
          {why ? (
            <>
              <Chip show={[0, 1]} cue={cue} tone="key">
                LSV
              </Chip>
              <Chip show={[0, 1]} cue={cue}>
                Comunidad sorda de Venezuela
              </Chip>
              <Chip show={[1]} cue={cue}>
                Comunicación
              </Chip>
              <Chip show={[1]} cue={cue}>
                Inclusión
              </Chip>
            </>
          ) : (
            <>
              <Chip show={[0, 1]} cue={cue} tone="key">
                Deletrear nombres
              </Chip>
              <Chip show={[0, 1]} cue={cue}>
                Algunas palabras
              </Chip>
              <Chip show={[1]} cue={cue} tone="warn">
                No sustituye el vocabulario LSV
              </Chip>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
