import { JourneyControls } from './JourneyControls.jsx';
import { JourneyHeader } from './JourneyHeader.jsx';
import { VowelActivity } from './VowelActivity.jsx';
import { VowelCameraJourney } from './VowelCameraJourney.jsx';
import { VowelJourneyStatus } from './VowelJourneyStatus.jsx';
import { VowelLessonSummary } from './VowelLessonSummary.jsx';
import { VowelIntroduction, VowelMicroclassStep, VowelStudy } from './VowelLearningContent.jsx';
import { VowelMixedReview } from './VowelMixedReview.jsx';
import { useLessonJourney } from './use-lesson-journey.js';
import { useVowelProgress } from './use-vowel-progress.js';
import { vowelExperienceSteps, vowelLetters } from './vowel-lesson.js';
import { mixedReviewDone } from './vowel-rounds.js';
import './curriculum.css';
import './vowel-experience.css';
import './vowel-activity.css';
import './vowel-layout.css';

const phaseOrder = [
  { id: 'intro', label: 'Inicio' },
  { id: 'demo', label: 'Microclase' },
  { id: 'explain', label: 'Aprende' },
  { id: 'assess', label: 'Comprueba' },
  { id: 'practice', label: 'Cámara' },
  { id: 'review', label: 'Repaso' },
];

const practiceTypes = new Set(['vowel-activity', 'vowel-camera', 'vowel-mixed']);

function stepDone(step, progress) {
  if (step.type === 'vowel-activity')
    return vowelLetters.every((letter) => progress.activities[step.id]?.answers?.[letter]?.correct);
  if (step.type === 'vowel-camera')
    return vowelLetters.every((letter) => progress.camera[step.mode].visited.includes(letter));
  if (step.type === 'vowel-mixed') return mixedReviewDone(progress);
  return true;
}

const hints = {
  'vowel-activity': 'Responde las cinco rondas para continuar.',
  'vowel-camera': 'Visita las cinco vocales. La cámara es voluntaria.',
  'vowel-mixed': 'Atiende los cinco retos para continuar.',
};

function StepContent({ step, formative }) {
  if (step.type === 'vowel-intro') return <VowelIntroduction objectives={step.objectives} />;
  if (step.type === 'vowel-microclass') return <VowelMicroclassStep />;
  if (step.type === 'vowel-study')
    return <VowelStudy guide={step} onViewed={formative.markViewed} />;
  if (step.type === 'vowel-activity')
    return (
      <VowelActivity
        activity={step}
        saved={formative.progress.activities[step.id]}
        onAnswer={formative.recordAnswer}
        onReset={formative.resetActivity}
        onPracticeAttempt={(letter, result) => formative.recordCamera('guided', letter, result)}
      />
    );
  if (step.type === 'vowel-mixed')
    return (
      <VowelMixedReview
        progress={formative.progress}
        onAnswer={formative.recordAnswer}
        onComplete={formative.completeMixed}
        onAttempt={formative.recordCamera}
      />
    );
  return (
    <VowelCameraJourney
      mode={step.mode}
      saved={formative.progress.camera[step.mode]}
      onVisit={formative.visitCamera}
      onAttempt={formative.recordCamera}
    />
  );
}

/**
 * Integra la experiencia completa en la lección de vocales publicada por el backend.
 * @param {object} props Lección, módulo y navegación real del catálogo.
 * @param {object} props.lesson Lección autorizada por la API.
 * @param {object} props.module Módulo que contiene la lección.
 * @param {Function} props.onContinue Navegación a la siguiente lección.
 * @param {string} [props.nextTitle] Título de la siguiente lección.
 * @param {string} [props.initialStep] Paso explícito al volver a repasar.
 * @returns {import('react').ReactElement} Recorrido pedagógico único con progreso diferenciado.
 */
export function VowelCurriculumLesson({ lesson, module, onContinue, nextTitle, initialStep }) {
  const steps = vowelExperienceSteps(lesson);
  const mappedInitial = initialStep === 'resources' ? 'microclass' : initialStep;
  const journey = useLessonJourney(lesson, module.id, steps, mappedInitial);
  const formative = useVowelProgress(module.id, lesson.id);
  const { step } = journey;
  const pending = steps.filter(
    (item) => practiceTypes.has(item.type) && !stepDone(item, formative.progress),
  ).length;
  const header = (
    <JourneyHeader
      lesson={lesson}
      module={module}
      journey={journey}
      phaseOrder={phaseOrder}
      compact
    >
      <VowelJourneyStatus
        journey={journey}
        letter={step?.type === 'vowel-study' ? step.letter : undefined}
        pending={pending}
      />
    </JourneyHeader>
  );
  if (!step)
    return (
      <div
        className="learning-journey education-page lesson-experience vowel-experience"
        data-position="summary"
      >
        {header}
        <VowelLessonSummary
          lesson={lesson}
          module={module}
          progress={formative.progress}
          remembered={formative.remembered}
          onBack={journey.back}
          onReview={journey.restart}
          onGoTo={journey.goTo}
          onContinue={onContinue}
          nextTitle={nextTitle}
        />
      </div>
    );
  const done = stepDone(step, formative.progress);
  const label =
    step.type === 'vowel-intro'
      ? 'Comenzar lección'
      : step.id === 'mixed-review'
        ? 'Ver mi repaso'
        : 'Continuar';
  return (
    <div
      className="learning-journey education-page lesson-experience vowel-experience"
      data-position={step.id}
    >
      {header}
      <div className="journey-stage" data-step={step.type} key={step.id}>
        <StepContent step={step} formative={formative} />
      </div>
      <JourneyControls
        onBack={journey.back}
        onContinue={journey.next}
        disabled={!done}
        hint={done ? undefined : hints[step.type]}
        label={label}
      />
    </div>
  );
}
