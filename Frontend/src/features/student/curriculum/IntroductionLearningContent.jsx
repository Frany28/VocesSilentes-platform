import { LessonIllustration } from './LessonIllustration.jsx';
import { LessonContent, LessonIntroduction } from './LessonExperience.jsx';

/**
 * @param {object} props Lección y primer paso derivados del contenido público.
 * @returns {import('react').ReactElement} Bienvenida, objetivos y mapa del recorrido.
 */
export function IntroductionWelcome(props) {
  const { lesson, step } = props;
  const route = ['Bienvenida', 'Qué es la LSV', 'Alfabeto manual', 'Situaciones'];
  if (step.hasAssessment) route.push('Comprobación');
  return (
    <LessonIntroduction
      id="introduction-welcome-title"
      eyebrow="TU PRIMER RECORRIDO"
      title={lesson.title}
      description={step.section?.body}
      objectives={step.objectives}
      route={route}
      media={<LessonIllustration lessonId={lesson.id} />}
      footer={
        <p className="text-muted">
          Avanza a tu ritmo. Puedes volver, salir y retomar exactamente donde te quedaste.
        </p>
      }
    />
  );
}

const conceptDetails = {
  lsv: {
    eyebrow: 'ETAPA 2 · COMPRENDE LA LENGUA',
    facts: ['Lengua natural', 'Visual-gestual', 'Comunidad sorda venezolana'],
    comparisonTitle: 'Una lengua completa',
    comparison:
      'Organiza y expresa significados con recursos propios. No es una traducción palabra por palabra del español.',
  },
  alphabet: {
    eyebrow: 'ETAPA 3 · CONOCE EL RECURSO',
    facts: ['Representa letras', 'Apoya el deletreo', 'Puede incluir movimiento'],
    comparisonTitle: 'Un recurso dentro de la LSV',
    comparison:
      'Ayuda a representar determinados nombres y términos, pero no sustituye el vocabulario, la gramática ni las expresiones de la LSV.',
  },
};

/**
 * @param {object} props Concepto y sección académica correspondiente.
 * @returns {import('react').ReactElement} Explicación visual de LSV o alfabeto manual.
 */
export function IntroductionConcept(props) {
  const { step } = props;
  const details = conceptDetails[step.concept];
  return (
    <LessonContent
      id={`introduction-${step.concept}`}
      eyebrow={details.eyebrow}
      title={step.section.heading}
      body={step.section.body}
      visual={
        <div className="introduction-concept-map" aria-label="Ideas clave">
          {details.facts.map((fact, index) => (
            <div key={fact}>
              <span aria-hidden="true">{index + 1}</span>
              <b>{fact}</b>
            </div>
          ))}
        </div>
      }
    >
      <section className="introduction-contrast">
        <span aria-hidden="true">{step.concept === 'lsv' ? 'LSV' : 'A·B·C'}</span>
        <div>
          <h3>{details.comparisonTitle}</h3>
          <p>{details.comparison}</p>
        </div>
      </section>
    </LessonContent>
  );
}
