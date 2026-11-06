import { LessonMedia } from '../lesson/LessonMedia.jsx';
import { LetterPractice } from './LetterPractice.jsx';
import { PersonalPractice } from './PersonalPractice.jsx';

/**
 * Presenta una sola unidad educativa, conservando su texto original y los recursos pendientes agrupados.
 * @param {{step: object, pending: number}} props Paso del recorrido y número de preguntas no disponibles.
 * @returns {import('react').ReactElement} Introducción, explicación, letras, recursos o práctica personal.
 */
export function CurriculumTheory({ step, pending }) {
  if (step.type === 'letters') return <LetterPractice cards={step.cards} />;
  if (step.type === 'practice') return <PersonalPractice step={step} />;
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
      ) : step.type === 'resources' ? (
        <>
          <LessonMedia />
          <p>
            Las imágenes y los vídeos siguen pendientes de autorización y revisión LSV. Puedes
            estudiar la teoría mientras se preparan esos recursos.
          </p>
          <p className="text-muted">
            Puedes continuar con la lectura y las letras escritas.
            {pending > 0 && ` Hay ${pending} ejercicios pendientes; no cuentan como aciertos.`}
          </p>
        </>
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
