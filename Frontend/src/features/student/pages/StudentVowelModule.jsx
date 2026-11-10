import { useLessonJourney } from '../curriculum/use-lesson-journey.js';
import { JourneyHeader } from '../curriculum/JourneyHeader.jsx';
import { JourneyControls } from '../curriculum/JourneyControls.jsx';
import { VowelLearningStep } from '../curriculum/VowelLearningStep.jsx';
import { VowelLearningSummary } from '../curriculum/VowelLearningSummary.jsx';
import { vowelLesson, vowelModule, vowelLearningSteps } from '../curriculum/vowel-lesson.js';
import '../curriculum/curriculum.css';
import '../lesson/lesson.css';
import '../recognition/recognition.css';

/**
 * Publica el módulo guiado de vocales: introducción, explicación/práctica por letra y repaso.
 * @returns {import('react').ReactElement} Recorrido recordado por usuario sin escrituras académicas.
 */
export function StudentVowelModule() {
  const journey = useLessonJourney(vowelLesson, vowelModule.id, vowelLearningSteps);
  const { step } = journey;
  const label = !step
    ? undefined
    : step.type === 'vowel'
      ? `Practicar ${step.letter} con cámara`
      : journey.index === journey.steps.length - 1
        ? 'Ver mi repaso'
        : 'Continuar';
  return (
    <div className="learning-journey education-page" data-position={step?.id ?? 'summary'}>
      <JourneyHeader lesson={vowelLesson} module={vowelModule} journey={journey} />
      <div
        className="journey-stage"
        key={step?.id ?? 'summary'}
        data-step={step?.type ?? 'summary'}
      >
        {step ? (
          <VowelLearningStep step={step} onContinue={journey.next} />
        ) : (
          <VowelLearningSummary onReview={journey.restart} />
        )}
      </div>
      <JourneyControls
        onBack={journey.back}
        onContinue={step ? journey.next : undefined}
        disabled={!step}
        label={label ?? 'Recorrido consultado'}
      />
    </div>
  );
}
