import { manualReference } from './manual-reference.js';

/**
 * Muestra la ilustración original como referencia, sin reconstruir dedos, trayectorias ni vídeos.
 * @param {{letter: string, compact?: boolean}} props Letra y densidad del visor.
 * @returns {import('react').ReactElement | null} Referencia del manual con crédito y límite editorial.
 */
export function ManualReference({ letter, compact = false }) {
  const image = manualReference(letter);
  if (!image) return null;
  return (
    <figure className="manual-reference" data-compact={compact || undefined}>
      <img
        src={image.url}
        alt={`Ilustración de referencia de la letra ${letter} en el manual LSV`}
      />
      <figcaption className="text-muted [font:var(--type-label)]">
        Manual LSV, página {image.page}. Yulianny Fuentes, 2022. Revisión lingüística pendiente.
      </figcaption>
    </figure>
  );
}
