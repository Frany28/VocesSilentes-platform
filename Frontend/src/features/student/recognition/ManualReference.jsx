import { letterResource } from '../resources/letter-resources.js';

/**
 * Muestra la ilustración original como referencia, sin reconstruir dedos, trayectorias ni vídeos.
 * Las letras publicadas se ven en producción; las demás solo en la vista previa de desarrollo.
 * @param {{letter: string, compact?: boolean}} props Letra y densidad del visor.
 * @returns {import('react').ReactElement} Referencia con crédito y estado editorial, o aviso de pendiente.
 */
export function ManualReference({ letter, compact = false }) {
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
      <img
        src={resource.url}
        alt={`Ilustración de referencia de la letra ${letter} en el manual LSV`}
      />
      <figcaption className="text-muted [font:var(--type-label)]">
        Manual LSV, página {resource.page}. Yulianny Fuentes, 2022. Revisión lingüística pendiente.
        {resource.status === 'preview' && ' Vista previa de desarrollo: no publicada.'}
      </figcaption>
    </figure>
  );
}
