import { useEffect } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { LessonQuestion } from '../lesson/LessonQuestion.jsx';
import { LessonFeedback } from '../lesson/LessonFeedback.jsx';
import { useLessonAssessment } from './use-lesson-assessment.js';
import { AssessmentSummary } from './AssessmentSummary.jsx';

/**
 * Presenta preguntas autorizadas y resultados del servidor; oculta tarjetas y letras durante la evaluación.
 * @param {{lesson: object, module: object, onBack: Function, onContinue: Function}} props Contenido autorizado.
 * @returns {import('react').ReactElement} Cuestionario, estados pendientes y resumen real.
 */
export function CurriculumAssessment({ lesson, module, onBack, onContinue }) {
  const operation = useLessonAssessment(lesson);
  const { question, result, questions, index } = operation;
  useEffect(() => {
    document.getElementById('student-content')?.focus();
  }, [index, result]);
  return (
    <section className="flex flex-col gap-4" aria-label="Ejercicios de la lección">
      <Button variant="secondary" icon={null} disabled={operation.pending} onClick={onBack}>
        Volver a la lectura
      </Button>
      {!question ? (
        <AssessmentSummary
          questions={questions}
          module={module}
          onContinue={onContinue}
          onReview={() => operation.go(0)}
        />
      ) : result ? (
        <LessonFeedback
          feedback={result.feedback}
          label="Retroalimentación de la respuesta"
          onContinue={result.isCorrect ? operation.next : operation.retry}
          continueLabel={result.isCorrect ? 'Siguiente pregunta' : 'Reintentar pregunta'}
        />
      ) : (
        <>
          <Select
            label="Pregunta de la lección"
            value={String(index)}
            disabled={operation.pending}
            onChange={(event) => operation.go(Number(event.target.value))}
          >
            {questions.map((item, position) => (
              <option key={item.id} value={String(position)}>
                Pregunta {position + 1}
                {item.availability === 'READY' ? '' : ' · pendiente'}
              </option>
            ))}
          </Select>
          <p className="text-muted">
            Pregunta {index + 1} de {questions.length}
          </p>
          {question.availability === 'READY' ? (
            <LessonQuestion
              question={question}
              selection={operation.selection}
              onSelect={operation.select}
              onCheck={operation.submit}
              busy={operation.pending}
            />
          ) : (
            <section className="education-card" aria-labelledby="pending-question">
              <h2 id="pending-question" className="[font:var(--type-h3)]">
                Pregunta pendiente
              </h2>
              <p>
                Este ejercicio necesita material autorizado y validado antes de poder responderse.
              </p>
              <p className="text-muted">
                Podrás practicar esta pregunta cuando su recurso esté autorizado y revisado.
              </p>
              <Button className="education-action" disabled>
                Comprobar respuesta
              </Button>
              <Button variant="secondary" icon={null} onClick={operation.next}>
                Ver siguiente pregunta
              </Button>
            </section>
          )}
          {operation.error && (
            <Alert tone="error" title="No se pudo comprobar">
              {operation.error}
            </Alert>
          )}
        </>
      )}
    </section>
  );
}
