import { LetterPractice } from './LetterPractice.jsx';
import { PersonalPractice } from './PersonalPractice.jsx';
import { LessonResources } from './LessonResources.jsx';

/**
 * Presenta una sola unidad educativa, conservando su texto original y los recursos pendientes agrupados.
 * @param {{step: object}} props Paso del recorrido.
 * @returns {import('react').ReactElement} Introducción, explicación, letras, recursos o práctica personal.
 */
export function CurriculumTheory({ step }) {
  if (step.type === 'letters') return <LetterPractice cards={step.cards} />;
  if (step.type === 'practice') return <PersonalPractice step={step} />;
  if (step.type === 'resources') return <LessonResources step={step} />;
  return (
    <article className="journey-copy education-card" aria-labelledby="journey-title">
      <p className="journey-eyebrow text-muted">
        {
          {
            intro: 'Antes de empezar',
            theory: 'Descubre',
            resources: 'Material de referencia',
            practice: 'Ponlo en práctica',
          }[step.type]
        }
      </p>
      {step.type === 'intro' && (
        <div className="journey-welcome bg-accent rounded-control">
          <span className="education-media-art" aria-hidden="true" />
        </div>
      )}
      <h2 id="journey-title">{step.title}</h2>
      {step.type === 'intro' ? (
        <section aria-labelledby="curriculum-objectives" className="flex flex-col gap-4">
          <h3 id="curriculum-objectives" className="[font:var(--type-subtitle)]">
            Tu objetivo en esta lección
          </h3>
          <ul className="journey-objectives list-disc space-y-3 pl-6">
            {step.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
          <p className="text-muted">
            Avanza a tu ritmo. Puedes volver o salir y retomar donde te quedaste.
          </p>
        </section>
      ) : (
        <>
          <p className="journey-reading">{step.body}</p>
          {step.type === 'practice' && (
            <p className="text-muted">
              Utiliza únicamente material autorizado y validado. Esta actividad personal no evalúa
              tu ejecución de LSV.
            </p>
          )}
        </>
      )}
    </article>
  );
}
