/**
 * Orientación compacta del recorrido: actividad actual, vocal en estudio, siguiente actividad y
 * actividades pendientes. Lo pendiente se cuenta con el progreso real del estudiante.
 * @param {{journey: object, letter?: string, pending: number}} props Recorrido y vocal visible.
 * @returns {import('react').ReactElement} Resumen de navegación legible sin desplazarse.
 */
export function VowelJourneyStatus({ journey, letter, pending }) {
  const next = journey.steps[journey.index + 1];
  return (
    <dl className="vowel-journey-status" aria-label="Dónde estás">
      <div>
        <dt>Ahora</dt>
        <dd>{journey.step?.title ?? 'Tu repaso'}</dd>
      </div>
      {letter && (
        <div data-kind="letter">
          <dt>Vocal</dt>
          <dd>{letter}</dd>
        </div>
      )}
      <div>
        <dt>Después</dt>
        <dd>{next?.title ?? (journey.step ? 'Tu repaso final' : 'Siguiente lección')}</dd>
      </div>
      <div>
        <dt>Pendientes</dt>
        <dd>
          {pending === 0 ? 'Ninguna' : `${pending} ${pending === 1 ? 'actividad' : 'actividades'}`}
        </dd>
      </div>
    </dl>
  );
}
