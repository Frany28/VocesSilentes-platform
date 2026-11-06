import { Link, Navigate } from 'react-router';
import { useStudent } from '../data/use-student.js';
import { DataFeedback } from '../components/DataFeedback.jsx';

/**
 * Conserva el enlace antiguo dirigiéndolo a la segunda lección real del alfabeto, solo si está disponible.
 * @returns {import('react').ReactElement} Destino por IDs de API o estado editorial sin contenido sustituto.
 */
export function PublishedVowels() {
  const { status, snapshot, retry } = useStudent();
  if (status === 'loading') return <DataFeedback kind="loading" />;
  if (status === 'error') return <DataFeedback kind="error" onRetry={retry} />;
  const module =
    snapshot?.source === 'api' &&
    snapshot.modules.find(
      (item) => item.contentKey === 'modulo-01-alfabeto-manual-lsv' && item.access === 'available',
    );
  const lesson = module?.lessons.find(
    (item) => item.order === 2 && item.publicationStatus === 'PUBLISHED',
  );
  if (lesson) return <Navigate replace to={`/student/modules/${module.id}/lessons/${lesson.id}`} />;
  return (
    <section className="education-card flex flex-col gap-3">
      <h1 className="[font:var(--type-h3)]">La lección de vocales está en preparación</h1>
      <p>Estará disponible dentro de Abecedario LSV cuando se apruebe y publique su contenido.</p>
      <Link to="/student/modules">Volver a mis módulos</Link>
    </section>
  );
}
