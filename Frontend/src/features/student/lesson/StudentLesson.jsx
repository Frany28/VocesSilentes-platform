import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Alert } from '../../../components/ui/Alert.jsx';
import { useStudent } from '../data/use-student.js';
import { StudentPageHeader } from '../components/StudentPageHeader.jsx';
import { DataFeedback } from '../components/DataFeedback.jsx';
import { LessonReading } from './LessonReading.jsx';
import { LessonNavigation } from './LessonNavigation.jsx';
import { LessonTrail } from './LessonTrail.jsx';
import './lesson.css';
import { CurriculumLesson } from '../curriculum/CurriculumLesson.jsx';

/**
 * Lee una lección del catálogo autorizado por IDs; abrirla no modifica el progreso.
 * @returns {import('react').ReactElement} Lectura, navegación o estado de consulta accesible.
 */
export function StudentLesson() {
  const { moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { status, snapshot, retry } = useStudent();
  const module = snapshot?.modules.find((item) => item.id === moduleId);
  const lesson = module?.lessons.find((item) => item.id === lessonId);
  const position = module?.lessons.findIndex((item) => item.id === lessonId) ?? -1;
  const next = module?.lessons[position + 1];
  useEffect(() => {
    document.getElementById('student-content')?.focus();
  }, [lessonId, status]);
  const available = snapshot?.source === 'api' && module?.access === 'available' && lesson;
  const continueLearning = () =>
    navigate(next ? `/student/modules/${moduleId}/lessons/${next.id}` : '/student/modules');
  return (
    <div className="education-page flex w-full flex-col gap-6">
      <StudentPageHeader
        title={available ? lesson.title : 'Lección'}
        description={available ? module.title : 'Tu espacio de lectura educativa.'}
        preview={available && module.preview}
      />
      <LessonTrail
        step={available ? position + 1 : 0}
        total={available ? module.lessons.length : 0}
        segmented={false}
      />
      {status !== 'ready' ? (
        <DataFeedback kind={status} onRetry={retry} />
      ) : !available ? (
        <Alert tone="warning" title="Lección no disponible">
          No encontramos esta lección publicada en el módulo indicado. Vuelve al catálogo para
          elegir otra.
        </Alert>
      ) : (
        <>
          {lesson.content ? (
            <CurriculumLesson
              key={lesson.id}
              lesson={lesson}
              module={module}
              onContinue={continueLearning}
            />
          ) : (
            <LessonReading
              lesson={lesson}
              continueLabel="Continuar aprendiendo"
              onContinue={continueLearning}
            />
          )}
          <LessonNavigation module={module} lessonId={lessonId} />
        </>
      )}
    </div>
  );
}
