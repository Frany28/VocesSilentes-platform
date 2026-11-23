import { JourneyControls } from './JourneyControls.jsx';
import { JourneyHeader } from './JourneyHeader.jsx';
import { VowelActivity } from './VowelActivity.jsx';
import { VowelCameraJourney } from './VowelCameraJourney.jsx';
import { VowelLessonSummary } from './VowelLessonSummary.jsx';
import { VowelIntroduction, VowelMicroclassStep, VowelStudy } from './VowelLearningContent.jsx';
import { useLessonJourney } from './use-lesson-journey.js';
import { useVowelProgress } from './use-vowel-progress.js';
import { vowelExperienceSteps, vowelLetters } from './vowel-lesson.js';
import './curriculum.css';
import './vowel-experience.css';

const phaseOrder = [
  { id: 'intro', label: 'Inicio' },
  { id: 'demo', label: 'Microclase' },
  { id: 'explain', label: 'Aprende' },
  { id: 'assess', label: 'Comprueba' },
  { id: 'practice', label: 'Cámara' },
  { id: 'review', label: 'Repaso' },
];

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
  if (!step)
    return (
      <div className="learning-journey education-page vowel-experience" data-position="summary">
        <JourneyHeader lesson={lesson} module={module} journey={journey} phaseOrder={phaseOrder} />
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
  const activityDone =
    step.type !== 'vowel-activity' ||
    vowelLetters.every(
      (letter) => formative.progress.activities[step.id]?.answers?.[letter]?.correct,
    );
  const cameraDone =
    step.type !== 'vowel-camera' ||
    vowelLetters.every((letter) => formative.progress.camera[step.mode].visited.includes(letter));
  let content;
  if (step.type === 'vowel-intro') content = <VowelIntroduction objectives={step.objectives} />;
  else if (step.type === 'vowel-microclass') content = <VowelMicroclassStep />;
  else if (step.type === 'vowel-study')
    content = <VowelStudy guide={step} onViewed={formative.markViewed} />;
  else if (step.type === 'vowel-activity')
    content = (
      <VowelActivity
        activity={step}
        saved={formative.progress.activities[step.id]}
        onAnswer={formative.recordAnswer}
        onReset={formative.resetActivity}
      />
    );
  else
    content = (
      <VowelCameraJourney
        mode={step.mode}
        saved={formative.progress.camera[step.mode]}
        onVisit={formative.visitCamera}
        onAttempt={formative.recordCamera}
      />
    );
  const label =
    step.type === 'vowel-intro'
      ? 'Comenzar lección'
      : step.id === 'camera-memory'
        ? 'Ver mi repaso'
        : 'Continuar';
  return (
    <div className="learning-journey education-page vowel-experience" data-position={step.id}>
      <JourneyHeader lesson={lesson} module={module} journey={journey} phaseOrder={phaseOrder} />
      <div className="journey-stage" data-step={step.type} key={step.id}>
        {content}
      </div>
      {step.type === 'vowel-activity' && !activityDone && (
        <p className="vowel-step-requirement" role="status">
          Completa las cinco rondas para continuar.
        </p>
      )}
      {step.type === 'vowel-camera' && !cameraDone && (
        <p className="vowel-step-requirement" role="status">
          Visita las cinco vocales. La cámara es voluntaria y los intentos pendientes quedarán
          indicados en el resumen.
        </p>
      )}
      <JourneyControls
        onBack={journey.back}
        onContinue={journey.next}
        disabled={!activityDone || !cameraDone}
        label={label}
      />
    </div>
  );
}
