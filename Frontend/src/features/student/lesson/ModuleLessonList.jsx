import { Link } from 'react-router';
import { LessonIllustration } from '../curriculum/LessonIllustration.jsx';
import { lessonSteps } from '../curriculum/lesson-steps.js';

/**
 * Conserva el catálogo autorizado y distingue lectura, reanudación y recursos.
 * @param {{module: object}} props Módulo y lecciones recibidos de la API.
 * @returns {import('react').ReactElement} Ruta visual sin modificar el progreso.
 */
export function ModuleLessonList({ module }) {
  const nextId = module.lessons.find((lesson) => lesson.status !== 'COMPLETED')?.id;
  return (
    <ol className="module-lesson-list" aria-label="Lecciones del módulo">
      {module.lessons.map((lesson, index) => {
        const path = `/student/modules/${module.id}/lessons/${lesson.id}`;
        const microclass = lesson.content && lessonSteps(lesson).some((step) => step.microclass);
        const completed = lesson.status === 'COMPLETED';
        const next = lesson.id === nextId;
        return (
          <li
            key={lesson.id}
            className="module-lesson-card"
            data-next={next || undefined}
            style={{ '--lesson-delay': `${Math.min(index, 6) * 45}ms` }}
          >
            <div className="module-lesson-cover">
              <LessonIllustration lessonId={lesson.id} />
              <span className="module-lesson-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="module-lesson-body">
              <div className="module-lesson-meta">
                <span>Lección {String(index + 1).padStart(2, '0')}</span>
                <span className="module-lesson-status" data-completed={completed || undefined}>
                  {completed ? '✓ Completada' : next ? 'Tu siguiente paso' : 'Por explorar'}
                </span>
              </div>
              <h2>{lesson.title}</h2>
              {lesson.content?.objectives?.length > 0 && (
                <ul className="module-lesson-objectives">
                  {lesson.content.objectives.map((objective) => (
                    <li key={objective}>{objective}</li>
                  ))}
                </ul>
              )}
              <div className="module-lesson-actions">
                <Link
                  className="module-lesson-primary"
                  to={path}
                  state={{ reviewStep: 'intro' }}
                  aria-label={`Estudiar lección ${index + 1} desde el inicio`}
                >
                  {completed ? 'Volver a estudiar' : 'Explorar lección'}
                  <span aria-hidden="true">→</span>
                </Link>
                <Link className="module-lesson-resume" to={path}>
                  Retomar lección {index + 1}
                </Link>
              </div>
              {microclass && (
                <Link className="module-lesson-resource" to={path} state={{ reviewStep: 'resources' }}>
                  <span aria-hidden="true">▷</span> Ver microclase de las vocales
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
