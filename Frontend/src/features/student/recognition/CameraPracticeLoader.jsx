import { lazy, Suspense } from 'react';
import { DataFeedback } from '../components/DataFeedback.jsx';

const CameraExercise = lazy(() =>
  import('./CameraExercise.jsx').then((module) => ({ default: module.CameraExercise })),
);

/**
 * Difiere la interfaz y el código de cámara hasta elegir practicar, conservando un estado de carga accesible.
 * @param {{letter?: string, onContinue?: Function}} props Referencia y avance opcional del recorrido de observación.
 * @returns {import('react').ReactElement} Práctica cargada bajo demanda; el permiso sigue siendo una acción posterior.
 */
export function CameraPracticeLoader(props) {
  return (
    <Suspense fallback={<DataFeedback kind="loading" />}>
      <CameraExercise {...props} />
    </Suspense>
  );
}
