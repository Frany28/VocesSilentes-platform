import { Button } from '../../../components/ui/Button.jsx';
import { LessonMedia } from './LessonMedia.jsx';

/**
 * Presenta texto plano revisable; reconoce el objetivo opcional sin interpretar HTML o Markdown.
 * @param {{lesson: object, onContinue?: Function, continueLabel?: string}} props Texto y acción del consumidor.
 * @returns {import('react').ReactElement} Objetivo y explicación, sin contenido educativo inventado.
 */
export function LessonReading({ lesson, onContinue, continueLabel = 'Continuar al ejercicio' }) {
  const paragraphs = lesson.description
    .split(/\r?\n\s*\r?\n/)
    .map((text) => text.trim())
    .filter(Boolean);
  const objective = paragraphs[0]?.startsWith('Objetivo:')
    ? paragraphs.shift().slice(9).trim()
    : null;
  return (
    <article className="education-card">
      <div className="education-columns">
        <div className="flex min-w-0 flex-col gap-3">
          <section className="flex flex-col gap-3" aria-label="Objetivo de la lección">
            <h2 id="lesson-objective" className="[font:var(--type-h3)]">
              Objetivo de la clase
            </h2>
            <p className="education-paragraph">
              {objective || 'Esta lección todavía no tiene un objetivo educativo documentado.'}
            </p>
          </section>
          <section className="flex flex-col gap-3" aria-labelledby="lesson-explanation">
            <h2 id="lesson-explanation" className="[font:var(--type-button)]">
              {lesson.explanationTitle || 'Explicación educativa'}
            </h2>
            {paragraphs.length ? (
              paragraphs.map((text, index) => (
                <p key={index} className="education-paragraph whitespace-pre-line text-muted">
                  {text}
                </p>
              ))
            ) : (
              <p>El texto de esta lección todavía no está disponible.</p>
            )}
          </section>
        </div>
        <LessonMedia />
      </div>
      {onContinue && (
        <Button className="education-action education-action-continue" onClick={onContinue}>
          {continueLabel}
        </Button>
      )}
    </article>
  );
}
