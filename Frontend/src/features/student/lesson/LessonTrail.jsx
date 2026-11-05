import { Link } from 'react-router';
import { Icon } from '../../../components/ui/Icon.jsx';

/**
 * Indica la ubicación de lectura o el paso de la demo; no representa progreso guardado.
 * @param {{step?: number, total?: number, segmented?: boolean}} props Posición y composición visual.
 * @returns {import('react').ReactElement} Regreso al catálogo e indicador textual accesible.
 */
export function LessonTrail({ step = 1, total = 4, segmented = true }) {
  return (
    <div className="education-trail flex flex-col gap-4">
      <div className="flex items-center gap-2 text-muted">
        <Link
          className="education-back flex min-w-0 flex-1 items-center gap-2"
          to="/student/modules"
          aria-label="Volver a Mis módulos"
        >
          <Icon name="education-back" />
          <span>Mis módulos</span>
        </Link>
        {total > 0 && (
          <span
            aria-label={`${segmented ? 'Paso de demostración' : 'Lección'} ${step} de ${total}`}
          >
            {String(step).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        )}
      </div>
      {segmented && (
        <div className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: total }, (_, index) => (
            <span
              key={index}
              className={
                index < step
                  ? 'h-1.5 min-w-0 flex-1 rounded-full bg-action'
                  : 'h-1.5 min-w-0 flex-1 rounded-full bg-secondary'
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
