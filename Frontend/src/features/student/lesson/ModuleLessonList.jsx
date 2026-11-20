import { Link } from 'react-router';
import { LessonIllustration } from '../curriculum/LessonIllustration.jsx';
import { lessonSteps } from '../curriculum/lesson-steps.js';

/**
 * Conserva todo el catálogo recibido y ofrece inicio, reanudación y acceso a la microclase existente.
 * @param {{module: object}} props Módulo y lecciones autorizados por la API.
 * @returns {import('react').ReactElement} Índice de lectura sin publicar borradores ni simular recursos.
 */
export function ModuleLessonList({ module }) {
  return (
    <ol className="flex min-w-0 flex-col gap-6" aria-label="Lecciones del módulo">
      {module.lessons.map((lesson, index) => {
        const path = `/student/modules/${module.id}/lessons/${lesson.id}`;
        const microclass = lesson.content && lessonSteps(lesson).some((step) => step.microclass);
        return (
          <li key={lesson.id} className="education-card flex min-w-0 flex-col gap-4">
            <LessonIllustration lessonId={lesson.id} />
            <h2 className="[font:var(--type-h3)]">
              {index + 1}. {lesson.title}
            </h2>
            {lesson.content?.objectives?.length > 0 && (
              <ul className="list-disc space-y-2 pl-6">
                {lesson.content.objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            )}
            <p className="text-muted">
              {lesson.status === 'COMPLETED'
                ? 'Lectura completada · Puedes volver a estudiarla.'
                : 'Disponible para estudiar.'}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link className="vs-ui vs-navigation" to={path} state={{ reviewStep: 'intro' }}>
                Estudiar lección {index + 1} desde el inicio
              </Link>
              <Link className="education-back inline-flex min-h-11 items-center" to={path}>
                Retomar lección {index + 1}
              </Link>
              {microclass && (
                <Link className="vs-ui vs-navigation" to={path} state={{ reviewStep: 'resources' }}>
                  Ver microclase de las vocales
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
