import { letterResource } from '../resources/letter-resources.js';
import { useContext } from 'react';
import { RecognitionModelContext } from './model-context.js';
import { HandIllustration } from './HandIllustration.jsx';
import { handReferencePolicy } from '../resources/hand-reference-policy.js';
import { manualReference } from './manual-reference.js';

/**
 * Muestra la ficha de la letra y su orientación. El laboratorio también muestra su crédito.
 * Las letras publicadas se ven en producción; las demás solo en la vista previa de desarrollo.
 * @param {{letter: string, compact?: boolean, hand?: string, educational?: boolean,
 * laboratory?: boolean}} props Presentación, lateralidad y revisión local explícita.
 * @returns {import('react').ReactElement} Referencia visual o aviso de material pendiente.
 */
export function ManualReference({
  letter,
  compact = false,
  hand,
  educational = false,
  laboratory = false,
}) {
  const context = useContext(RecognitionModelContext);
  const selected = hand ?? context?.referenceHand ?? 'Right';
  const policy = handReferencePolicy(letter);
  const mirrored = selected === 'Left' && policy.mode === 'STATIC_MIRROR_PREVIEW';
  const published = letterResource(letter);
  const preview = laboratory && !published.url ? manualReference(letter, true) : null;
  const resource = preview ? { ...preview, status: 'preview' } : published;
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
        alt={`Ilustración de referencia de la letra ${letter} en LSV${
          mirrored ? ' (reflejo orientativo)' : ''
        }`}
      />
      {selected === 'Left' &&
        (educational ? (
          <details className="practice-source text-muted [font:var(--type-label)]">
            <summary>{mirrored ? 'Reflejo orientativo' : 'Orientación de la mano'}</summary>
            <p>{policy.message}</p>
          </details>
        ) : (
          <p className="text-muted">{policy.message}</p>
        ))}
      {laboratory && (
        <figcaption className="text-muted [font:var(--type-label)]">
          Manual LSV, página {resource.page}. Yulianny Fuentes, 2022. Revisión lingüística
          pendiente.
          {resource.status === 'preview' && ' Vista previa de desarrollo: no publicada.'}
        </figcaption>
      )}
    </figure>
  );
}
