/**
 * Presenta texto plano revisable; reconoce el objetivo opcional sin interpretar HTML o Markdown.
 * @param {{lesson: object}} props Lección publicada con description del contrato actual.
 * @returns {import('react').ReactElement} Objetivo y explicación, sin contenido educativo inventado.
 */
export function LessonReading({ lesson }) {
  const paragraphs = lesson.description
    .split(/\r?\n\s*\r?\n/)
    .map((text) => text.trim())
    .filter(Boolean);
  const objective = paragraphs[0]?.startsWith('Objetivo:')
    ? paragraphs.shift().slice(9).trim()
    : null;
  return (
    <article className="flex flex-col gap-6 rounded-3xl border border-border bg-surface p-6 shadow-card">
      <section className="flex flex-col gap-3" aria-labelledby="lesson-objective">
        <h2 id="lesson-objective" className="[font:var(--type-h3)]">
          Objetivo de la lección
        </h2>
        <p>{objective || 'Esta lección todavía no tiene un objetivo educativo documentado.'}</p>
      </section>
      <section className="flex flex-col gap-4" aria-labelledby="lesson-explanation">
        <h2 id="lesson-explanation" className="[font:var(--type-h3)]">
          Explicación educativa
        </h2>
        {paragraphs.length ? (
          paragraphs.map((text, index) => (
            <p key={index} className="whitespace-pre-line">
              {text}
            </p>
          ))
        ) : (
          <p>El texto de esta lección todavía no está disponible.</p>
        )}
      </section>
    </article>
  );
}
