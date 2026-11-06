import { lazy, Suspense } from 'react';
import { DataFeedback } from '../components/DataFeedback.jsx';
import { publicConfig } from '../../../lib/config.js';
import { PublishedVowels } from '../lesson/PublishedVowels.jsx';

const ModelLab = lazy(() =>
  import('../pages/StudentModelLab.jsx').then((module) => ({ default: module.StudentModelLab })),
);
const CameraPractice = lazy(() =>
  import('../pages/StudentCameraPractice.jsx').then((module) => ({
    default: module.StudentCameraPractice,
  })),
);
const VowelPractice = lazy(() =>
  import('../pages/StudentVowelPractice.jsx').then((module) => ({
    default: module.StudentVowelPractice,
  })),
);
const VowelModule = import.meta.env.DEV
  ? lazy(() =>
      import('../pages/StudentVowelModule.jsx').then((module) => ({
        default: module.StudentVowelModule,
      })),
    )
  : null;

/**
 * Carga el recorrido educativo de vocales sin activar la cámara ni pedir el modelo de inferencia.
 * @returns {import('react').ReactElement} Módulo protegido con introducción, explicaciones y práctica.
 */
export function VowelModuleRoute() {
  if (!publicConfig.studentDemo) return <PublishedVowels />;
  return (
    <Suspense fallback={<DataFeedback kind="loading" />}>
      <VowelModule />
    </Suspense>
  );
}

/**
 * Abre la actividad de vocales con referencia y modelo educativo sin cargar la cámara al navegar.
 * @returns {import('react').ReactElement} Actividad protegida por el layout Student.
 */
export function VowelPracticeRoute() {
  return (
    <Suspense fallback={<DataFeedback kind="loading" />}>
      <VowelPractice />
    </Suspense>
  );
}

/**
 * Carga la práctica de cámara bajo demanda, dentro del layout y guard USER existentes.
 * @returns {import('react').ReactElement} Destino de cámara con estado de carga.
 */
export function CameraPracticeRoute() {
  return (
    <Suspense fallback={<DataFeedback kind="loading" />}>
      <CameraPractice />
    </Suspense>
  );
}

/**
 * Carga el laboratorio sin incluir herramientas de entrenamiento en el inicio de las lecciones.
 * @returns {import('react').ReactElement} Laboratorio local con estado de carga.
 */
export function ModelLabRoute() {
  return (
    <Suspense fallback={<DataFeedback kind="loading" />}>
      <ModelLab />
    </Suspense>
  );
}
