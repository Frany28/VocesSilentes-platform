import { Button } from '../../../components/ui/Button.jsx';
import { Progress } from '../../../components/ui/Progress.jsx';

/**
 * Presenta cifras de muestra con un único porcentaje derivado para texto, barra y accesibilidad.
 * @param {{result: object, onContinue: Function}} props Resumen explícito de la demo, sin persistencia.
 * @returns {import('react').ReactElement} Resultado visual que no modifica el progreso del usuario.
 */
export function LessonResult({ result, onContinue }) {
  const percent = result.totalLessons
    ? Math.round((100 * result.completedLessons) / result.totalLessons)
    : 0;
  return (
    <section className="education-card" aria-label="Resultado de ejemplo">
      <h2 className="[font:var(--type-h3)]">Tu práctica de hoy</h2>
      <dl className="education-result-stats">
        <div>
          <dt>Respuestas correctas</dt>
          <dd>
            {result.correct} / {result.questions}
          </dd>
        </div>
        <div>
          <dt>Lecciones completadas</dt>
          <dd>
            {result.completedLessons} / {result.totalLessons}
          </dd>
        </div>
      </dl>
      <Progress
        className="education-result-progress"
        value={percent}
        label="Progreso del módulo"
        valueText={`${percent}% · ${result.completedLessons} de ${result.totalLessons} lecciones`}
      />
      <p className="text-muted">Siguiente lección · {result.nextTitle}</p>
      <Button className="education-action education-action-result" onClick={onContinue}>
        Continuar aprendiendo
      </Button>
    </section>
  );
}
