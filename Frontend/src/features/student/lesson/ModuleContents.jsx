import { Link, useParams } from 'react-router';
import { useStudent } from '../data/use-student.js';
import { StudentPageHeader } from '../components/StudentPageHeader.jsx';
import { DataFeedback } from '../components/DataFeedback.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { ModuleLessonList } from './ModuleLessonList.jsx';
import { VowelPracticeEntry } from '../curriculum/VowelPracticeEntry.jsx';
import './lesson.css';

/**
 * Reúne las lecciones reales para estudiar o repasar sin quedar atrapado en un resumen guardado.
 * @returns {import('react').ReactElement} Índice autorizado; abrirlo no modifica el progreso.
 */
export function ModuleContents() {
  const { moduleId } = useParams();
  const { status, snapshot, retry } = useStudent();
  const module =
    snapshot?.source === 'api' && snapshot.modules.find((item) => item.id === moduleId);
  return (
    <div className="education-page flex min-w-0 flex-col gap-6">
      <Link className="education-back inline-flex min-h-11 items-center" to="/student/modules">
        Volver a Mis módulos
      </Link>
      <StudentPageHeader
        title={module?.title || 'Contenido del módulo'}
        description="Elige una lección para estudiar o repasar sus explicaciones, imágenes y recursos."
      />
      {status !== 'ready' ? (
        <DataFeedback kind={status} onRetry={retry} />
      ) : !module || module.access !== 'available' ? (
        <Alert tone="warning" title="Módulo no disponible">
          No encontramos lecciones disponibles en este módulo. Vuelve a Mis módulos para elegir
          otro.
        </Alert>
      ) : (
        <>
          {module.contentKey === 'modulo-01-alfabeto-manual-lsv' && <VowelPracticeEntry />}
          <ModuleLessonList module={module} />
        </>
      )}
    </div>
  );
}
