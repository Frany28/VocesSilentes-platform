import { handReferencePolicy } from '../resources/hand-reference-policy.js';
import './hand-reference.css';

/**
 * Reutiliza la ficha sin rótulo y muestra la letra fuera de la imagen para poder reflejarla.
 * @param {{resource: object, letter: string, hand: string, alt?: string, showLabel?: boolean}} props Imagen y mano.
 * @returns {import('react').ReactElement} Ilustración con letra HTML legible; sin archivos duplicados.
 */
export function HandIllustration({ resource, letter, hand, alt = '', showLabel = true }) {
  const mirrored = hand === 'Left' && handReferencePolicy(letter).mode === 'STATIC_MIRROR_PREVIEW';
  return (
    <div className="manual-hand" data-mirrored={mirrored || undefined}>
      <img src={resource.url} alt={alt} />
      {showLabel && (
        <span className="manual-hand-letter" aria-hidden="true">
          {letter}
        </span>
      )}
    </div>
  );
}
