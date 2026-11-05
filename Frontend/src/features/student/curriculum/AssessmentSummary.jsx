import { Button } from '../../../components/ui/Button.jsx';
import { Progress } from '../../../components/ui/Progress.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { moduleProgress } from '../data/module-progress.js';
import { useLearningProgress } from '../data/use-learning-progress.js';
import { JourneyControls } from './JourneyControls.jsx';

/**
 * Distingue recorrido, respuestas confirmadas y lectura manual, sin dar pendientes por acertados.
 * @param {{questions: object[], lesson: object, module: object, onContinue: Function, onReview: Function,
 * onBack?: Function, nextTitle?: string}} props Mejor avance del servidor y navegación autorizada.
 * @returns {import('react').ReactElement} Resultados reales y registro de lectura exclusivamente explícito.
 */
export function AssessmentSummary({
  questions,
  lesson,
  module,
  onContinue,
  onReview,
  onBack,
  nextTitle,
}) {
  const completed = questions.filter((item) => item.status === 'COMPLETED').length;
  const pending = questions.filter((item) => item.availability !== 'READY').length;
  const percent = questions.length ? Math.round((100 * completed) / questions.length) : 0;
  const reading = moduleProgress(module);
  const operation = useLearningProgress();
  const registered = lesson.status === 'COMPLETED' || operation.saved;
  return (
    <>
      <div className="journey-stage" data-step="summary">
        <section
          className="education-card journey-copy journey-summary"
          aria-label="Resumen de la lección"
        >
          <h2>Has recorrido esta lección</h2>
          <Progress
            className="education-result-progress"
            label="Preguntas resueltas"
            value={percent}
            valueText={`${percent}% · ${completed} de ${questions.length} preguntas resueltas`}
          />
          <p>Preguntas pendientes de material o revisión: {pending}.</p>
          <p className="text-muted">Resultados del mejor avance guardado.</p>
          <Progress
            className="education-result-progress"
            label="Lectura del módulo"
            value={reading.percent}
            valueText={`${reading.percent}% · ${reading.completed} de ${reading.total} lecturas registradas`}
          />
          <Button
            disabled={registered}
            loading={operation.pending}
            loadingLabel="Guardando lectura…"
            onClick={() => operation.submit('lessons', lesson.id, 'COMPLETED')}
          >
            {registered ? 'Lectura registrada' : 'Registrar lectura completada'}
          </Button>
          <p className="text-muted">
            Registrar la lectura es una acción manual. No certifica ejecución de LSV.
          </p>
          {operation.error && (
            <Alert tone="error" title="No se pudo guardar">
              {operation.error}
            </Alert>
          )}
          {operation.saved && <p role="status">Tu lectura se guardó correctamente.</p>}
          <Button variant="secondary" icon={null} onClick={onReview}>
            Repasar desde el inicio
          </Button>
        </section>
      </div>
      <JourneyControls
        onBack={onBack}
        onContinue={onContinue}
        pending={operation.pending}
        label={nextTitle ? 'Siguiente lección' : 'Volver a mis módulos'}
      />
    </>
  );
}
