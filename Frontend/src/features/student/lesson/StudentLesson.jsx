import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { Alert } from '../../../components/ui/Alert.jsx';
import { useStudent } from '../data/use-student.js';
import { StudentPageHeader } from '../components/StudentPageHeader.jsx';
import { DataFeedback } from '../components/DataFeedback.jsx';
import { LessonReading } from './LessonReading.jsx';
import { LessonNavigation } from './LessonNavigation.jsx';

/**
 * Lee una lección del catálogo autorizado por IDs; abrirla no modifica el progreso.
 * @returns {import('react').ReactElement} Lectura, navegación o estado de consulta accesible.
 */
export function StudentLesson() {
  const { moduleId, lessonId } = useParams();
  const { status, snapshot, retry } = useStudent();
  const module = snapshot?.modules.find((item) => item.id === moduleId);
  const lesson = module?.lessons.find((item) => item.id === lessonId);
  useEffect(() => {
    document.getElementById('student-content')?.focus();
  }, [lessonId, status]);
  const available = snapshot?.source === 'api' && module?.access === 'available' && lesson;
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link className="vs-ui vs-navigation self-start" to="/student/modules">
        Volver a Mis módulos
      </Link>
      <StudentPageHeader
        title={available ? lesson.title : 'Lección'}
        description={available ? module.title : 'Tu espacio de lectura educativa.'}
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
          <LessonReading lesson={lesson} />
          <LessonNavigation module={module} lessonId={lessonId} />
        </>
      )}
    </div>
  );
}
