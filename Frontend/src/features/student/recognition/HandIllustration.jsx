import { handReferencePolicy } from '../resources/hand-reference-policy.js';
import './hand-reference.css';

/**
 * Reutiliza el archivo original y separa su rótulo antes de reflejar solo el dibujo de mano.
 * @param {{resource: object, letter: string, hand: string, alt?: string, showLabel?: boolean}} props Imagen y mano.
 * @returns {import('react').ReactElement} Ilustración con letra HTML legible; sin archivos duplicados.
 */
export function HandIllustration({ resource, letter, hand, alt = '', showLabel = true }) {
  const policy = handReferencePolicy(letter);
  const separated = policy.mode === 'STATIC_MIRROR_PREVIEW';
  return (
    <div
      className="manual-hand"
      data-separated={separated || undefined}
      data-mirrored={(separated && hand === 'Left') || undefined}
      style={separated ? { '--reference-aspect': policy.width / policy.height } : undefined}
    >
      <img src={resource.url} alt={alt} style={separated ? { clipPath: policy.clip } : undefined} />
      {separated && showLabel && (
        <span className="manual-hand-letter" aria-hidden="true">
          {letter}
        </span>
      )}
    </div>
  );
}
