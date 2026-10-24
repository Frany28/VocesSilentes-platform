import { DataFeedback } from './DataFeedback.jsx';

/**
 * Esqueleto de datos, sin números ni actividad ficticia durante la lectura.
 * @param {{catalog?: boolean}} props Tipo de página.
 * @returns {import('react').ReactElement} Estado de carga sin animación obligatoria.
 */
export function StudentLoading({ catalog = false }) {
  return (
    <div className="flex flex-col gap-6">
      <DataFeedback kind="loading" catalog={catalog} />
      {[0, 1, ...(catalog ? [] : [2])].map((item) => (
        <div
          key={item}
          className="flex flex-col gap-3 rounded-3xl bg-surface p-6"
          aria-hidden="true"
        >
          <div className="h-4 w-2/3 rounded-lg bg-neutral" />
          <div className="h-4 w-full rounded-lg bg-neutral" />
        </div>
      ))}
    </div>
  );
}
