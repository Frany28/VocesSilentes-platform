import { useEffect, useState } from 'react';
import { Alert } from '../../../components/ui/Alert.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { LessonQuestion } from '../lesson/LessonQuestion.jsx';
import { LessonFeedback } from '../lesson/LessonFeedback.jsx';
import { useLessonAssessment } from './use-lesson-assessment.js';
import { JourneyControls } from './JourneyControls.jsx';

/**
 * Presenta una pregunta con avance guiado y la explicación del servidor junto a la respuesta.
 * @param {{question: object, onConfirmed: Function, onBack?: Function, onContinue: Function}} props Paso actual.
 * @returns {import('react').ReactElement} Actividad, respuesta del servidor y pie de navegación.
 */
export function CurriculumAssessment({ question, onConfirmed, onBack, onContinue }) {
  const operation = useLessonAssessment(question, onConfirmed);
  const [review, setReview] = useState(false);
  const { result } = operation;
  const selected = question.options.find(
    (option, index) =>
      (typeof option === 'string' ? String(index) : option.id) === operation.selection,
  );
  const saved = !review && !result && question.status === 'COMPLETED';
  useEffect(() => {
    const stage = document.querySelector('.journey-stage');
    if (stage) stage.scrollTop = 0;
    document.getElementById('student-content')?.focus();
  }, [result]);
  return (
    <>
      <div className="journey-stage" data-step="question">
        <div className="journey-activity flex w-full flex-col gap-4">
          {saved ? (
            <article className="education-card journey-copy">
              <p className="journey-eyebrow text-muted">Tu progreso guardado</p>
              <h2>Esta pregunta ya está resuelta</h2>
              <p>
                El servidor conserva tu respuesta correcta. Puedes continuar o practicar de nuevo.
              </p>
              <Button variant="secondary" icon={null} onClick={() => setReview(true)}>
                Responder de nuevo
              </Button>
            </article>
          ) : result ? (
            <div className="assessment-result-layout">
              <section className="education-card" aria-label="Tu respuesta">
                <h2 className="education-question-title">{question.prompt}</h2>
                <p>
                  Elegiste:{' '}
                  <strong>{typeof selected === 'string' ? selected : selected?.text}</strong>
                </p>
              </section>
              <LessonFeedback
                feedback={result.feedback}
                showAction={false}
                label="Retroalimentación de la respuesta"
              />
            </div>
          ) : (
            <LessonQuestion
              question={question}
              selection={operation.selection}
              onSelect={operation.select}
              onCheck={operation.submit}
              busy={operation.pending}
              formId="journey-question"
              showAction={false}
            />
          )}
          {operation.error && (
            <Alert tone="error" title="No se pudo comprobar">
              {operation.error}
            </Alert>
          )}
        </div>
      </div>
      <JourneyControls
        onBack={onBack}
        pending={operation.pending}
        disabled={!saved && !result && !operation.selection}
        form={!saved && !result ? 'journey-question' : undefined}
        label={
          result && !result.isCorrect
            ? 'Reintentar'
            : saved || result
              ? 'Continuar'
              : 'Comprobar respuesta'
        }
        onContinue={saved || result?.isCorrect ? onContinue : result ? operation.retry : undefined}
      />
    </>
  );
}
