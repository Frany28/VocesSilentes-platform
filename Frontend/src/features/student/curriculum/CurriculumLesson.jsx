import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { useLearningProgress } from '../data/use-learning-progress.js';
import { CurriculumTheory } from './CurriculumTheory.jsx';
import { CurriculumAssessment } from './CurriculumAssessment.jsx';
import './curriculum.css';

/**
 * Separa lectura, registro manual y evaluación del módulo, conservando los servicios de progreso existentes.
 * @param {{lesson: object, module: object, onContinue: Function}} props Lección y navegación por IDs.
 * @returns {import('react').ReactElement} Experiencia curricular con contenido real y materiales pendientes.
 */
export function CurriculumLesson({ lesson, module, onContinue }) {
  const [exercising, setExercising] = useState(false);
  const reading = useLearningProgress();
  if (exercising)
    return (
      <CurriculumAssessment
        lesson={lesson}
        module={module}
        onBack={() => setExercising(false)}
        onContinue={onContinue}
      />
    );
  return (
    <div className="flex flex-col gap-6">
      <CurriculumTheory content={lesson.content} />
      <div className="education-card">
        <div className="curriculum-actions flex w-full flex-wrap gap-4">
          <Button
            className="education-action"
            disabled={reading.pending || lesson.status === 'COMPLETED'}
            onClick={() => reading.submit('lessons', lesson.id, 'COMPLETED')}
          >
            {lesson.status === 'COMPLETED' ? 'Lectura registrada' : 'Registrar lectura completada'}
          </Button>
          <Button
            className="education-action"
            disabled={reading.pending}
            onClick={() => setExercising(true)}
          >
            Ir a los ejercicios
          </Button>
          <Button variant="secondary" icon={null} disabled={reading.pending} onClick={onContinue}>
            Continuar aprendiendo
          </Button>
        </div>
        <p className="text-muted">
          Registrar la lectura no completa las preguntas ni acredita dominio de LSV.
        </p>
        {reading.error && (
          <Alert tone="error" title="No se pudo guardar">
            {reading.error}
          </Alert>
        )}
        {reading.saved && (
          <Alert tone="success" title="Lectura guardada">
            Tu registro se guardó correctamente.
          </Alert>
        )}
      </div>
    </div>
  );
}
