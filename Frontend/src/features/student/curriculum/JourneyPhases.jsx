import { phaseOf, presentPhases } from './journey-phases.js';

/**
 * Indicador de etapas de la lección (introducción → repaso) con la etapa actual marcada.
 * Complementa la barra de pasos: la barra mide avance; las etapas muestran en qué parte del método estás.
 * @param {{steps: object[], step: object | undefined}} props Pasos del recorrido y paso actual.
 * @returns {import('react').ReactElement} Lista ordenada accesible.
 */
export function JourneyPhases({ steps, step }) {
  const phases = presentPhases(steps);
  const current = phases.findIndex((phase) => phase.id === phaseOf(step));
  return (
    <ol className="journey-phases" aria-label="Etapas de la lección">
      {phases.map((phase, index) => (
        <li
          key={phase.id}
          data-state={index < current ? 'done' : index === current ? 'now' : undefined}
          aria-current={index === current ? 'step' : undefined}
        >
          <span aria-hidden="true">{index + 1}</span>
          <span className="journey-phase-label">{phase.label}</span>
        </li>
      ))}
    </ol>
  );
}
