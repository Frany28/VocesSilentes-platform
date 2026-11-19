import { useAuth } from '../../auth/use-auth.js';

/**
 * Identidad real de sesión y origen visible de los indicadores de demostración.
 * @param {{catalog?: boolean, status?: string, moduleState?: string, demo?: boolean,
 * title?: string, description?: string, preview?: boolean}} props Página, lectura y textos de otras vistas Student.
 * @returns {import('react').ReactElement} Título accesible de página.
 */
export function StudentPageHeader({
  catalog = false,
  status,
  moduleState,
  demo = false,
  preview = false,
  title,
  description: custom,
}) {
  const { user } = useAuth();
  const description =
    custom ||
    (catalog
      ? 'Cada módulo es un nuevo puente para comunicarte.'
      : status === 'loading'
        ? 'Estamos preparando tus módulos y tu progreso.'
        : status === 'error'
          ? 'No pudimos cargar tu área de aprendizaje.'
          : moduleState === 'completed'
            ? 'Tu aprendizaje avanza, una seña a la vez.'
            : moduleState === 'available'
              ? 'Bienvenida a un mundo de nuevas conexiones.'
              : 'Un pequeño paso hoy. Más conexiones mañana.');
  return (
    <div className="student-page-header flex min-w-0 flex-col gap-2">
      <h1>{title || (catalog ? 'Mis módulos' : `Hola, ${user.firstName}.`)}</h1>
      <p className="text-base/[26px] text-muted">{description}</p>
      {demo && (
        <p className="text-info [font:var(--type-label)]">
          Demostración: estos datos no son tu progreso real.
        </p>
      )}
      {preview && (
        <p className="text-warning [font:var(--type-label)]">
          Vista previa local · Borrador pendiente de revisión lingüística. No es contenido
          publicado.
        </p>
      )}
    </div>
  );
}
