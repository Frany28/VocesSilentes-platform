import { Button } from '../../../components/ui/Button.jsx';
import { Progress } from '../../../components/ui/Progress.jsx';
import { moduleProgress } from '../data/module-progress.js';

/**
 * Resume preguntas efectivamente resueltas y lectura declarada, sin sumar material pendiente como acierto.
 * @param {{questions: object[], module: object, onContinue: Function, onReview: Function}} props Estado confirmado.
 * @returns {import('react').ReactElement} Porcentajes coherentes y alcance del resultado.
 */
export function AssessmentSummary({ questions, module, onContinue, onReview }) {
  const completed = questions.filter((item) => item.status === 'COMPLETED').length;
  const pending = questions.filter((item) => item.availability !== 'READY').length;
  const percent = questions.length ? Math.round((100 * completed) / questions.length) : 0;
  const reading = moduleProgress(module);
  return (
    <section className="education-card" aria-label="Resumen de la lección">
      <h2 className="[font:var(--type-h3)]">Tu recorrido en esta lección</h2>
      <Progress
        className="education-result-progress"
        label="Preguntas resueltas"
        value={percent}
        valueText={`${percent}% · ${completed} de ${questions.length} preguntas resueltas`}
      />
      <p>Preguntas pendientes de material o revisión: {pending}.</p>
      <Progress
        className="education-result-progress"
        label="Lectura del módulo"
        value={reading.percent}
        valueText={`${reading.percent}% · ${reading.completed} de ${reading.total} lecturas registradas`}
      />
      <p className="text-muted">
        Los aciertos registran comprensión del cuestionario; no certifican ejecución de LSV.
      </p>
      <div className="curriculum-actions flex w-full flex-wrap gap-4">
        <Button className="education-action education-action-result" onClick={onContinue}>
          Continuar aprendiendo
        </Button>
        <Button variant="secondary" icon={null} onClick={onReview}>
          Revisar preguntas
        </Button>
      </div>
    </section>
  );
}
