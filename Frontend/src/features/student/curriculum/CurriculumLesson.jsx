import { useLessonJourney } from './use-lesson-journey.js';
import { CurriculumTheory } from './CurriculumTheory.jsx';
import { CurriculumAssessment } from './CurriculumAssessment.jsx';
import { AssessmentSummary } from './AssessmentSummary.jsx';
import { JourneyHeader } from './JourneyHeader.jsx';
import { JourneyControls } from './JourneyControls.jsx';
import './curriculum.css';

/**
 * Compone una lección progresiva, un paso por pantalla, conservando el progreso y los servicios académicos.
 * @param {{lesson: object, module: object, onContinue: Function, nextTitle?: string}} props Contenido y siguiente destino.
 * @returns {import('react').ReactElement} Recorrido enfocado con punto local separado del avance del backend.
 */
export function CurriculumLesson({ lesson, module, onContinue, nextTitle }) {
  const journey = useLessonJourney(lesson, module.id);
  const { step } = journey;
  return (
    <div className="learning-journey education-page" data-position={step?.id ?? 'summary'}>
      <JourneyHeader lesson={lesson} module={module} journey={journey} />
      {!step ? (
        <AssessmentSummary
          questions={journey.questions}
          lesson={lesson}
          module={module}
          onContinue={onContinue}
          onReview={journey.restart}
          onBack={journey.back}
          nextTitle={nextTitle}
        />
      ) : step.type === 'question' ? (
        <CurriculumAssessment
          key={step.id}
          question={journey.questions.find((item) => item.id === step.questionId)}
          onConfirmed={journey.confirm}
          onContinue={journey.next}
          onBack={journey.back}
        />
      ) : (
        <>
          <div className="journey-stage" data-step={step.type} key={step.id}>
            <CurriculumTheory step={step} onPracticeContinue={journey.next} />
          </div>
          <JourneyControls
            onBack={journey.back}
            onContinue={journey.next}
            label={journey.index === journey.steps.length - 1 ? 'Ver mi resumen' : 'Continuar'}
          />
        </>
      )}
    </div>
  );
}
