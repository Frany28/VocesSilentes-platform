import { CurriculumAssessment } from './CurriculumAssessment.jsx';
import { AssessmentSummary } from './AssessmentSummary.jsx';
import { JourneyControls } from './JourneyControls.jsx';
import { JourneyHeader } from './JourneyHeader.jsx';
import { IntroductionApplications } from './IntroductionApplications.jsx';
import { IntroductionConcept, IntroductionWelcome } from './IntroductionLearningContent.jsx';
import { IntroductionSummaryActivity } from './IntroductionSummaryActivity.jsx';
import { introductionExperienceSteps, introductionPhases } from './introduction-lesson.js';
import { useIntroductionProgress } from './use-introduction-progress.js';
import { useLessonJourney } from './use-lesson-journey.js';
import './curriculum.css';
import './introduction-experience.css';

function StepContent({ lesson, step, formative }) {
  if (step.type === 'introduction-welcome')
    return <IntroductionWelcome lesson={lesson} step={step} />;
  if (step.type === 'introduction-concept') return <IntroductionConcept step={step} />;
  return (
    <IntroductionApplications
      step={step}
      explored={formative.progress.explored}
      onExplore={formative.explore}
    />
  );
}

/**
 * Recorrido completo de la introducción: conceptos, aplicaciones, evaluación real y resumen.
 * @param {object} props Lección, módulo y navegación del catálogo.
 * @returns {import('react').ReactElement} Experiencia especializada que conserva servicios académicos.
 */
export function IntroductionCurriculumLesson(props) {
  const { lesson, module, onContinue, nextTitle, initialStep } = props;
  const steps = introductionExperienceSteps(lesson);
  const journey = useLessonJourney(lesson, module.id, steps, initialStep);
  const formative = useIntroductionProgress(module.id, lesson.id);
  const { step } = journey;
  const phaseOrder = steps.some((item) => item.type === 'question')
    ? introductionPhases
    : introductionPhases.filter((phase) => phase.id !== 'assess');
  const header = (
    <JourneyHeader lesson={lesson} module={module} journey={journey} phaseOrder={phaseOrder} />
  );
  if (!step)
    return (
      <div
        className="learning-journey education-page lesson-experience introduction-experience"
        data-position="summary"
      >
        {header}
        <AssessmentSummary
          questions={journey.questions}
          lesson={lesson}
          module={module}
          onContinue={onContinue}
          onReview={journey.restart}
          onBack={journey.back}
          nextTitle={nextTitle}
          activityResults={
            <IntroductionSummaryActivity
              explored={formative.progress.explored}
              remembered={formative.remembered}
            />
          }
        />
      </div>
    );
  return (
    <div
      className="learning-journey education-page lesson-experience introduction-experience"
      data-position={step.id}
    >
      {header}
      {step.type === 'question' ? (
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
            <StepContent lesson={lesson} step={step} formative={formative} />
          </div>
          <JourneyControls
            onBack={journey.back}
            onContinue={journey.next}
            label={step.type === 'introduction-welcome' ? 'Comenzar lección' : 'Continuar'}
          />
        </>
      )}
    </div>
  );
}
