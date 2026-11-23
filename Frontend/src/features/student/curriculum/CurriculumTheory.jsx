import { LetterPractice } from './LetterPractice.jsx';
import { PersonalPractice } from './PersonalPractice.jsx';
import { LessonResources } from './LessonResources.jsx';
import { LessonIllustration } from './LessonIllustration.jsx';

/**
 * Presenta una sola unidad educativa, conservando su texto original y los recursos pendientes agrupados.
 * @param {{step: object, lessonId?: string, onPracticeContinue?: Function}} props Paso, lección y continuación.
 * @returns {import('react').ReactElement} Introducción, explicación, letras, recursos o práctica personal.
 */
export function CurriculumTheory({ step, lessonId, onPracticeContinue }) {
  if (step.type === 'letters')
    return <LetterPractice cards={step.cards} onContinue={onPracticeContinue} />;
  if (step.type === 'practice')
    return <PersonalPractice step={step} lessonId={lessonId} onContinue={onPracticeContinue} />;
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
      {step.type === 'intro' && <LessonIllustration lessonId={lessonId} />}
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
