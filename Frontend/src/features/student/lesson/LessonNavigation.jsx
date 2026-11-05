import { Link } from 'react-router';
import { NavigationItem } from '../../../components/ui/NavigationItem.jsx';

/**
 * Navega por el orden publicado del mismo módulo; no supone IDs consecutivos ni usa títulos como claves.
 * @param {{module: object, lessonId: string}} props Catálogo autorizado y selección actual.
 * @returns {import('react').ReactElement} Índice de lecturas y destinos anterior/siguiente disponibles.
 */
export function LessonNavigation({ module, lessonId }) {
  const position = module.lessons.findIndex((lesson) => lesson.id === lessonId);
  const previous = module.lessons[position - 1];
  const next = module.lessons[position + 1];
  const path = (lesson) => `/student/modules/${module.id}/lessons/${lesson.id}`;
  return (
    <nav className="flex flex-col gap-4" aria-label="Navegación de la lección">
      <p className="text-muted">
        Lección {position + 1} de {module.lessons.length}
      </p>
      <div className="flex flex-wrap gap-4">
        {previous && (
          <Link className="vs-ui vs-navigation" to={path(previous)}>
            Lección anterior
          </Link>
        )}
        {next && (
          <Link className="vs-ui vs-navigation" to={path(next)}>
            Lección siguiente
          </Link>
        )}
      </div>
      <h2 className="[font:var(--type-h3)]">Lecciones del módulo</h2>
      <ol className="flex flex-col gap-2">
        {module.lessons.map((lesson) => (
          <li key={lesson.id}>
            <NavigationItem as={Link} to={path(lesson)} active={lesson.id === lessonId}>
              {lesson.title}
            </NavigationItem>
          </li>
        ))}
      </ol>
    </nav>
  );
}
