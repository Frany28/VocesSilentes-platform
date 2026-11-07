import { lazy, Suspense } from 'react';

const VowelMicroclass = lazy(() =>
  import('./VowelMicroclass.jsx').then((module) => ({ default: module.VowelMicroclass })),
);

/**
 * Carga la microclase y sus cinco ilustraciones solo cuando la lección de vocales la muestra.
 * @returns {import('react').ReactElement} Microclase o estado de carga existente.
 */
export function LazyVowelMicroclass() {
  return (
    <Suspense
      fallback={
        <p className="text-muted" role="status">
          Cargando la microclase…
        </p>
      }
    >
      <VowelMicroclass />
    </Suspense>
  );
}
