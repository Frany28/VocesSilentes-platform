import { useOutletContext } from 'react-router';
import { useStudent } from '../data/use-student.js';
import { StudentPageHeader } from '../components/StudentPageHeader.jsx';
import { ProgressSummary } from '../components/ProgressSummary.jsx';
import { ModuleCard } from '../components/ModuleCard.jsx';
import { StudentLoading } from '../components/StudentLoading.jsx';
import { DataFeedback } from '../components/DataFeedback.jsx';
import { moduleProgress } from '../data/module-progress.js';

/**
 * Presenta avances del mismo catálogo persistido; separa borradores de las lecciones disponibles.
 * No existe un frame propio de esta página: reutiliza componentes inspeccionados de Student.
 * @returns {import('react').ReactElement} Resumen y módulos con origen, carga y errores explícitos.
 */
export function StudentProgress() {
  const { status, snapshot, retry } = useStudent();
  const { onOpen } = useOutletContext();
  const modules = snapshot?.modules || [];
  const current = modules.find((module) => moduleProgress(module).total > 0);
  return (
    <div className="flex flex-col gap-6">
      <StudentPageHeader
        title="Mi progreso"
        description="Cada paso cuenta en tu ruta de aprendizaje."
        demo={snapshot?.source === 'demo'}
      />
      {status === 'loading' ? (
        <StudentLoading />
      ) : status === 'error' ? (
        <DataFeedback kind="error" onRetry={retry} />
      ) : snapshot.source === 'unavailable' ? (
        <DataFeedback kind="unavailable" />
      ) : !modules.length ? (
        <DataFeedback kind="empty" />
      ) : (
        <>
          {current ? <ProgressSummary module={current} /> : <DataFeedback kind="unpublished" />}
          <section className="flex flex-col gap-4" aria-labelledby="student-progress-modules">
            <h2 id="student-progress-modules" className="[font:var(--type-h3)]">
              Avance por módulo
            </h2>
            <div className="student-catalog grid items-start gap-4">
              {modules.map((module) => (
                <ModuleCard key={module.id} module={module} onOpen={onOpen} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
