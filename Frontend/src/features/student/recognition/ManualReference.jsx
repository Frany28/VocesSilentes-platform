import { letterResource } from '../resources/letter-resources.js';
import { useContext } from 'react';
import { RecognitionModelContext } from './model-context.js';
import { HandIllustration } from './HandIllustration.jsx';
import { handReferencePolicy } from '../resources/hand-reference-policy.js';

/**
 * Muestra la ficha basada en el trazado del manual, con su crédito y límites de uso.
 * Las letras publicadas se ven en producción; las demás solo en la vista previa de desarrollo.
 * @param {{letter: string, compact?: boolean, hand?: string, educational?: boolean}} props Presentación y lateralidad.
 * @returns {import('react').ReactElement} Referencia con crédito y estado editorial, o aviso de pendiente.
 */
export function ManualReference({ letter, compact = false, hand, educational = false }) {
  const context = useContext(RecognitionModelContext);
  const selected = hand ?? context?.referenceHand ?? 'Right';
  const policy = handReferencePolicy(letter);
  const mirrored = selected === 'Left' && policy.mode === 'STATIC_MIRROR_PREVIEW';
  const resource = letterResource(letter);
  if (!resource.url)
    return (
      <div className="manual-reference manual-pending" data-compact={compact || undefined}>
        <span aria-hidden="true">{letter}</span>
        <p className="text-muted">Referencia visual pendiente de autorización y revisión LSV.</p>
      </div>
    );
  return (
    <figure className="manual-reference" data-compact={compact || undefined}>
      <HandIllustration
        resource={resource}
        letter={letter}
        hand={selected}
        alt={`Ilustración de referencia de la letra ${letter} en el manual LSV${
          mirrored ? ' (reflejo orientativo)' : ''
        }`}
      />
      {selected === 'Left' && !educational && <p className="text-muted">{policy.message}</p>}
      <figcaption className="text-muted [font:var(--type-label)]">
        {educational ? (
          <details className="practice-source">
            <summary>Sobre esta referencia{mirrored ? ' · reflejo orientativo' : ''}</summary>
            <p>
              Manual LSV, página {resource.page}. Yulianny Fuentes, 2022. Revisión lingüística
              pendiente.
            </p>
            {selected === 'Left' && <p>{policy.message}</p>}
            {resource.status === 'preview' && <p>Vista previa de desarrollo: no publicada.</p>}
          </details>
        ) : (
          <>
            Manual LSV, página {resource.page}. Yulianny Fuentes, 2022. Revisión lingüística
            pendiente.
            {resource.status === 'preview' && ' Vista previa de desarrollo: no publicada.'}
          </>
        )}
      </figcaption>
    </figure>
  );
}
