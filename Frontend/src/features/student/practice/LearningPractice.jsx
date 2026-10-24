import { useState } from 'react';
import { useLocation } from 'react-router';
import { Button } from '../../../components/ui/Button.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { useStudent } from '../data/use-student.js';
import { useLearningProgress } from '../data/use-learning-progress.js';
import { DataFeedback } from '../components/DataFeedback.jsx';
import { PracticeBrief } from './PracticeBrief.jsx';
import { PracticeGuide } from './PracticeGuide.jsx';
import { LearningExercise } from './LearningExercise.jsx';
import { learningStatus } from '../data/learning-status.js';

/**
 * Reutiliza los paneles de práctica para lectura y actividad declarada, con persistencia real.
 * @returns {import('react').ReactElement} Formulario educativo sin cámara ni evaluación de LSV.
 */
export function LearningPractice() {
  const { status, snapshot, retry } = useStudent();
  const [selection, setSelection] = useState('');
  const title = useLocation().state?.moduleTitle;
  const operation = useLearningProgress();
  if (status !== 'ready') return <DataFeedback kind={status} onRetry={retry} />;
  const modules = snapshot.modules;
  const preferred = modules.find(
    (item) => item.title === title || item.lessons.some((lesson) => lesson.title === title),
  );
  const lessons = modules.flatMap((module) => module.lessons);
  const lesson =
    lessons.find((item) => item.id === selection) ?? preferred?.nextLesson ?? lessons[0];
  if (!lesson) return <DataFeedback kind="empty" />;
  return (
    <>
      <PracticeBrief />
      <div className="practice-grid grid items-start gap-6">
        <section className="practice-camera flex min-w-0 flex-col gap-4 rounded-card bg-surface p-6 shadow-card">
          <h2 className="[font:var(--type-h3)]">Tu lección y tu práctica</h2>
          <Select
            label="Lección publicada"
            value={lesson.id}
            disabled={operation.pending}
            onChange={(event) => setSelection(event.target.value)}
          >
            {modules.map((module) => (
              <optgroup key={module.id} label={module.title}>
                {module.lessons.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
          <p>{lesson.description}</p>
          <p className="text-muted">Avance de lectura: {learningStatus[lesson.status]}</p>
          <p className="text-muted">
            Este registro expresa tu actividad declarada. No activa la cámara ni evalúa señas LSV.
          </p>
          <div className="account-actions">
            <Button
              density="compact"
              icon={null}
              disabled={operation.pending || lesson.status !== 'NOT_STARTED'}
              onClick={() => operation.submit('lessons', lesson.id, 'IN_PROGRESS')}
            >
              Registrar inicio de lectura
            </Button>
            <Button
              density="compact"
              icon={null}
              disabled={operation.pending || lesson.status === 'COMPLETED'}
              onClick={() => operation.submit('lessons', lesson.id, 'COMPLETED')}
            >
              Marcar lectura completada
            </Button>
          </div>
          {lesson.exercises.map((exercise) => (
            <LearningExercise key={exercise.id} exercise={exercise} operation={operation} />
          ))}
          {operation.error && (
            <Alert tone="error" title="No se pudo guardar">
              {operation.error}
            </Alert>
          )}
          {operation.saved && (
            <Alert tone="success" title="Avance guardado">
              Tu actividad se guardó correctamente.
            </Alert>
          )}
        </section>
        <PracticeGuide demo={false} />
      </div>
    </>
  );
}
