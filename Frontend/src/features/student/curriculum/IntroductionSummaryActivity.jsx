import { introductionScenarios } from './introduction-lesson.js';

/**
 * @param {object} props Evidencia formativa local y disponibilidad del almacenamiento.
 * @returns {import('react').ReactElement} Resultado real de la actividad cotidiana.
 */
export function IntroductionSummaryActivity(props) {
  const { explored, remembered } = props;
  return (
    <section className="introduction-summary-activity" aria-labelledby="summary-activity">
      <h3 id="summary-activity">Situaciones exploradas</h3>
      <p>
        <b>
          {explored.length} de {introductionScenarios.length}
        </b>{' '}
        situaciones cotidianas revisadas.
      </p>
      {!remembered && (
        <p className="text-muted">Este navegador no pudo conservar esta evidencia formativa.</p>
      )}
    </section>
  );
}
