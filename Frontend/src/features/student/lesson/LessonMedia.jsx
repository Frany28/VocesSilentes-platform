import { Icon } from '../../../components/ui/Icon.jsx';

/**
 * Reserva el espacio Figma con ilustración decorativa; no reproduce ni interpreta una seña.
 * @param {{visual?: boolean}} props Variante de reconocimiento visual, sin material aprobado.
 * @returns {import('react').ReactElement} Marcador explícito sin reproductor, red ni cámara.
 */
export function LessonMedia({ visual = false }) {
  return (
    <figure
      className="education-media flex min-w-0 flex-col gap-2"
      data-visual={visual || undefined}
    >
      <div className="education-media-stage flex flex-col items-center justify-center gap-3 rounded-control bg-accent p-4">
        <span className="education-media-art" aria-hidden="true" />
        <span className="education-media-preview flex max-w-full items-center gap-2 rounded-field bg-surface p-2">
          <Icon name="education-play" />
          <span>{visual ? 'Clip de la seña · pendiente' : 'Video de referencia · pendiente'}</span>
        </span>
      </div>
      <figcaption className={visual ? 'sr-only' : 'text-muted'}>
        Material LSV pendiente de aprobación. La ilustración es decorativa y no representa una seña.
      </figcaption>
    </figure>
  );
}
