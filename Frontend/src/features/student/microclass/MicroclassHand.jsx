import { vowelIllustration } from './vowel-illustrations.js';

const fullView = { x: 50, y: 50, scale: 1, rings: [] };

/**
 * Ilustración original con acercamiento y marcas; el texto nunca se superpone a la mano.
 * @param {object} props Propiedades del visor.
 * @param {string} props.letter Vocal ilustrada.
 * @param {import('./microclass-focus.js').FocusView} [props.view] Zona ampliada y anillos visibles.
 * @param {boolean} [props.hideLetter] Oculta la letra impresa en la lámina para la pregunta.
 * @param {boolean} [props.pulse] Resalta la tarjeta durante la práctica.
 * @param {string} [props.alt] Texto alternativo; vacío cuando la imagen es decorativa.
 * @param {boolean} [props.credit] Muestra la página de origen debajo de la imagen.
 * @returns {import('react').ReactElement} Figura con la referencia del manual.
 */
export function MicroclassHand({
  letter,
  view = fullView,
  hideLetter,
  pulse,
  alt = '',
  credit = true,
}) {
  const image = vowelIllustration(letter);
  return (
    <figure className="mc-hand">
      <div className="mc-card" data-pulse={pulse || undefined}>
        <div
          className="mc-zoom"
          style={{
            transformOrigin: `${view.x}% ${view.y}%`,
            transform: `scale(${view.scale})`,
            '--mc-scale': view.scale,
          }}
        >
          <img src={image.url} alt={alt} />
          {view.rings.map(([x, y, width, height]) => (
            <span
              key={`${x}-${y}`}
              className="mc-ring"
              style={{ left: `${x}%`, top: `${y}%`, width: `${width}%`, height: `${height}%` }}
              aria-hidden="true"
            />
          ))}
        </div>
        {hideLetter && (
          <span className="mc-mask" aria-hidden="true">
            ?
          </span>
        )}
      </div>
      {credit && (
        <figcaption className="mc-credit">
          Ilustración: Y. Fuentes, Manual básico de LSV (2022)
          {hideLetter ? '' : `, p. ${image.page}`}
        </figcaption>
      )}
    </figure>
  );
}
