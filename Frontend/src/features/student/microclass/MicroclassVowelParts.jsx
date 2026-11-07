import { vowelFocus } from './microclass-focus.js';
import { letterResource } from '../resources/letter-resources.js';

const CIRCLE = 289; // perímetro del anillo de cuenta atrás (r = 46)

/**
 * Compara la vocal con la que suele confundirse; la O, sin comparación en la guía, pide observar la referencia.
 * @param {{letter: string, other: string|null}} props Vocal actual y vocal comparada.
 * @returns {import('react').ReactElement} Dos miniaturas o palabras clave.
 */
export function MicroclassCompare({ letter, other }) {
  if (!other)
    return (
      <ul className="mc-chips" data-pop>
        <li className="mc-chip" data-tone="warn">
          Mira la orientación en la referencia
        </li>
        <li className="mc-chip">Espacio redondeado</li>
      </ul>
    );
  return (
    <div className="mc-compare" data-pop>
      {[letter, other].map((item) => (
        <div className="mc-mini" key={item}>
          <img src={letterResource(item).url} alt={`Vocal ${item}`} />
          <div>
            <b>{item}</b>
            <span>{vowelFocus[item].short}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Cuenta atrás de práctica; la ilustración permanece visible a su lado.
 * @param {{letter: string, left: number, fraction: number}} props Vocal, segundos restantes y avance (0–1).
 * @returns {import('react').ReactElement} Anillo de tiempo e instrucción breve.
 */
export function MicroclassPractice({ letter, left, fraction }) {
  return (
    <div className="mc-practice" data-pop>
      <div className="mc-count">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle className="mc-count-track" cx="50" cy="50" r="46" />
          <circle
            className="mc-count-fill"
            cx="50"
            cy="50"
            r="46"
            style={{ strokeDashoffset: CIRCLE * fraction }}
          />
        </svg>
        <b aria-hidden="true">{left > 0 ? Math.ceil(Math.min(5, left)) : '✓'}</b>
      </div>
      <div>
        <p className="mc-practice-title">Inténtalo tú</p>
        <p className="mc-practice-copy">
          Forma la {letter} y mantenla mientras comparas con la ilustración.
        </p>
      </div>
    </div>
  );
}
