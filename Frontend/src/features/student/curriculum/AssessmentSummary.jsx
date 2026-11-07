import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { moduleProgress } from '../data/module-progress.js';
import { useLearningProgress } from '../data/use-learning-progress.js';
import { JourneyControls } from './JourneyControls.jsx';
import { SummaryResults } from './SummaryResults.jsx';

/**
 * Cierre de la lección (etapa Repaso): felicita, recuerda lo trabajado y ofrece una sola acción
 * explícita para guardar la lectura y seguir con la siguiente lección. En la última lección, guardar
 * muestra el cierre del módulo. Guardar sigue siendo manual: nunca se registra solo al llegar aquí.
 * @param {{questions: object[], lesson: object, module: object, onContinue: Function, onReview: Function,
 * onBack?: Function, nextTitle?: string}} props Mejor avance del servidor y navegación autorizada.
 * @returns {import('react').ReactElement} Resumen, resultados reales y navegación.
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
  const operation = useLearningProgress();
  const registered = lesson.status === 'COMPLETED' || operation.saved;
  const reading = moduleProgress(module);
  // La felicitación del módulo se reserva para la última lección, no para repasos intermedios.
  const moduleDone =
    !nextTitle && registered && reading.total > 0 && reading.completed === reading.total;
  const position = module.lessons.findIndex((item) => item.id === lesson.id) + 1;
  const title = moduleDone
    ? `¡Felicidades! Completaste ${module.title}`
    : registered
      ? '¡Lección completada!'
      : '¡Muy bien, terminaste la lección!';
  const advance = async () => {
    if (registered) return onContinue();
    const saved = await operation.submit('lessons', lesson.id, 'COMPLETED');
    // En la última lección se queda para mostrar el cierre del módulo.
    if (saved && nextTitle) onContinue();
  };
  let label = nextTitle ? 'Guardar y continuar' : 'Guardar y terminar';
  if (registered) label = nextTitle ? 'Siguiente lección' : 'Volver a mis módulos';
  return (
    <>
      <div className="journey-stage" data-step="summary">
        <section
          className="education-card journey-copy journey-summary"
          aria-label="Resumen de la lección"
        >
          <p className="journey-eyebrow text-muted">
            Lección {position} de {module.lessons.length}
          </p>
          <h2>{title}</h2>
          {registered && (
            <p className="summary-saved" role="status">
              Lectura registrada en tu progreso.
            </p>
          )}
          {lesson.content?.objectives?.length > 0 && (
            <section aria-labelledby="summary-learned" className="flex flex-col gap-2">
              <h3 id="summary-learned" className="[font:var(--type-subtitle)]">
                Lo que trabajaste
              </h3>
              <ul className="list-disc space-y-2 pl-6">
                {lesson.content.objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            </section>
          )}
          <SummaryResults questions={questions} reading={reading} />
          <p className="summary-next">
            {nextTitle
              ? `Siguiente: Lección ${position + 1} · ${nextTitle}`
              : moduleDone
                ? 'Has terminado todas las lecciones del módulo. Puedes repasar cualquiera cuando quieras.'
                : 'Esta es la última lección del módulo.'}
          </p>
          {operation.error && (
            <Alert tone="error" title="No se pudo guardar">
              {operation.error} Vuelve a intentarlo.
            </Alert>
          )}
          <p className="text-muted">
            Guardar registra tu lectura en el progreso. No certifica ejecución de LSV.
          </p>
          <Button variant="secondary" icon={null} onClick={onReview}>
            Repasar desde el inicio
          </Button>
        </section>
      </div>
      <JourneyControls
        onBack={onBack}
        onContinue={advance}
        pending={operation.pending}
        loadingLabel="Guardando…"
        label={label}
      />
    </>
  );
}
