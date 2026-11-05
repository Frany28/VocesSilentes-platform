import { LessonMedia } from '../lesson/LessonMedia.jsx';
import { AlphabetCards } from './AlphabetCards.jsx';

/**
 * Conserva los objetivos, secciones y práctica originales del JSON, recibidos mediante la API autorizada.
 * @param {{content: object}} props Contenido público de la lección; nunca contiene claves de respuesta.
 * @returns {import('react').ReactElement} Lectura estructurada y referencias visuales pendientes.
 */
export function CurriculumTheory({ content }) {
  return (
    <>
      <article className="education-card">
        <div className="education-columns">
          <div className="flex min-w-0 flex-col gap-6">
            <section className="flex flex-col gap-3" aria-labelledby="curriculum-objectives">
              <h2 id="curriculum-objectives" className="[font:var(--type-h3)]">
                Objetivos de aprendizaje
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                {content.objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            </section>
            {content.sections.map((section) => (
              <section key={section.heading} className="flex flex-col gap-3">
                <h2 className="[font:var(--type-subtitle)]">{section.heading}</h2>
                <p className="education-paragraph text-muted">{section.body}</p>
              </section>
            ))}
          </div>
          <LessonMedia />
        </div>
      </article>
      <AlphabetCards cards={content.letterCards} />
      <section className="education-card" aria-labelledby="curriculum-practice">
        <h2 id="curriculum-practice" className="[font:var(--type-subtitle)]">
          Actividad personal
        </h2>
        <p>{content.practiceInstructions}</p>
        <p className="text-muted">
          Utiliza únicamente material autorizado y validado. Esta actividad no evalúa ejecución
          manual.
        </p>
      </section>
    </>
  );
}
