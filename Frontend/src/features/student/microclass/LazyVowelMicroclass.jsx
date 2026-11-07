import { lazy, Suspense } from 'react';
import { DataFeedback } from '../components/DataFeedback.jsx';

const VowelMicroclass = lazy(() =>
  import('./VowelMicroclass.jsx').then((module) => ({ default: module.VowelMicroclass })),
);

/**
 * Carga la microclase y sus cinco ilustraciones solo cuando la lección de vocales la muestra.
 * @returns {import('react').ReactElement} Microclase o estado de carga existente.
 */
export function LazyVowelMicroclass() {
  return (
    <Suspense fallback={<DataFeedback kind="loading" />}>
      <VowelMicroclass />
    </Suspense>
  );
}
