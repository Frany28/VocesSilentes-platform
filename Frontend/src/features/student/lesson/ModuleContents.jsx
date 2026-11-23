import { Link, useParams } from 'react-router';
import { useStudent } from '../data/use-student.js';
import { StudentPageHeader } from '../components/StudentPageHeader.jsx';
import { DataFeedback } from '../components/DataFeedback.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { ModuleLessonList } from './ModuleLessonList.jsx';
import { VowelPracticeEntry } from '../curriculum/VowelPracticeEntry.jsx';
import './lesson.css';
import './module-contents.css';

/**
 * Reúne las lecciones reales para estudiar o repasar sin quedar atrapado en un resumen guardado.
 * @returns {import('react').ReactElement} Índice autorizado; abrirlo no modifica el progreso.
 */
export function ModuleContents() {
  const { moduleId } = useParams();
  const { status, snapshot, retry } = useStudent();
  const module =
    snapshot?.source === 'api' && snapshot.modules.find((item) => item.id === moduleId);
  const completed = module?.lessons.filter((lesson) => lesson.status === 'COMPLETED').length ?? 0;
  const total = module?.lessons.length ?? 0;
  return (
    <div className="education-page module-contents flex min-w-0 flex-col gap-6">
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
          <section className="module-journey-summary" aria-label="Progreso del módulo">
            <div className="module-journey-intro">
              <span className="module-journey-eyebrow">TU RUTA DE APRENDIZAJE</span>
              <h2>
                {total > 0 && completed === total
                  ? '¡Cada lección cuenta!'
                  : 'Paso a paso, nuevas formas de comunicar'}
              </h2>
              <p>Explora, practica y vuelve cuando lo necesites. Aprende a tu ritmo.</p>
            </div>
            <div className="module-journey-progress">
              <span>
                <strong>{completed}</strong> de {total} lecciones completadas
              </span>
              {total > 0 && (
                <progress max={total} value={completed} aria-label="Lecciones completadas" />
              )}
              <span className="module-journey-caption">
                Tu avance se conserva al retomar una lección.
              </span>
            </div>
          </section>
          {module.contentKey === 'modulo-01-alfabeto-manual-lsv' && <VowelPracticeEntry />}
          <ModuleLessonList module={module} />
        </>
      )}
    </div>
  );
}
