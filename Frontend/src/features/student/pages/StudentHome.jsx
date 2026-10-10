import { useOutletContext } from 'react-router';
import { useStudent } from '../data/use-student.js';
import { moduleProgress } from '../data/module-progress.js';
import { StudentPageHeader } from '../components/StudentPageHeader.jsx';
import { StudentHero } from '../components/StudentHero.jsx';
import { ModuleCard } from '../components/ModuleCard.jsx';
import { LessonPreview } from '../components/LessonPreview.jsx';
import { LearningAside } from '../components/LearningAside.jsx';
import { StudentNote } from '../components/StudentNote.jsx';
import { StudentLoading } from '../components/StudentLoading.jsx';
import { DataFeedback } from '../components/DataFeedback.jsx';

/**
 * Inicio de estudiante con datos explícitos y secciones previstas en Figma.
 * @returns {import('react').ReactElement} Bienvenida, aprendizaje y resumen, sin actividad inventada.
 */
export function StudentHome() {
  const { status, snapshot, retry } = useStudent();
  const { onOpen } = useOutletContext();
  const modules = snapshot?.modules || [];
  const current = modules[0];
  const next = modules.find(
    (module) => module !== current && moduleProgress(module).state === 'available',
  );
  const lesson = (current && moduleProgress(current).state === 'completed' ? next : current)
    ?.nextLesson;
  const demo = snapshot?.source === 'demo';
  return (
    <div className="flex flex-col gap-6">
      <StudentPageHeader
        status={status}
        moduleState={current && moduleProgress(current).state}
        demo={demo}
      />
      {status === 'loading' ? (
        <StudentLoading />
      ) : status === 'error' ? (
        <DataFeedback kind="error" onRetry={retry} />
      ) : snapshot.source === 'unavailable' ? (
        <DataFeedback kind="unavailable" />
      ) : !current ? (
        <DataFeedback kind="empty" />
      ) : (
        <div className="student-home-grid grid items-start gap-6">
          <div className="flex min-w-0 flex-col gap-6">
            <StudentHero module={current} next={next} onOpen={onOpen} />
            <section className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="[font:var(--type-h3)]">Tu ruta en LSV</h2>
                <p className="text-muted [font:var(--type-label)]">
                  NIVEL 01 · PRIMERAS CONVERSACIONES
                </p>
              </div>
              <div className="grid items-start gap-4 min-[600px]:grid-cols-2">
                {modules.slice(0, 2).map((module) => (
                  <ModuleCard key={module.id} module={module} onOpen={onOpen} />
                ))}
              </div>
            </section>
            {lesson && <LessonPreview lesson={lesson} onOpen={onOpen} />}
            <StudentNote />
          </div>
          <LearningAside module={current} onOpen={onOpen} />
        </div>
      )}
    </div>
  );
}
