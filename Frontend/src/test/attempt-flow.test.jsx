import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { AttemptResult } from '../features/student/recognition/AttemptResult.jsx';
import { RecognitionModelProvider } from '../features/student/recognition/RecognitionModelProvider.jsx';
import { ModelInference } from '../features/student/recognition/ModelInference.jsx';
import { recognitionSupports } from '../features/student/recognition/recognition-support.js';
import { useLocalModel } from '../features/student/recognition/use-local-model.js';
import { useSequenceCapture } from '../features/student/recognition/use-sequence-capture.js';
import { attempt, fakeCamera, release, serveRelease } from './attempt-fixture.js';

/**
 * Compone captura real, modelo con carga automática e interfaz, como CameraExercise.
 * @param {{camera: object, target: string}} props Cámara simulada y letra objetivo.
 * @returns {import("react").ReactElement} Flujo del intento.
 */
function Harness({ camera, target }) {
  const capture = useSequenceCapture(camera);
  const operation = useLocalModel({ autoLoad: recognitionSupports(target) });
  return <ModelInference operation={operation} capture={capture} camera={camera} target={target} />;
}

test('descarga sola el modelo, cuenta atrás, captura y analiza sin otro clic', async () => {
  const request = serveRelease();
  const camera = fakeCamera();
  render(<Harness camera={camera} target="A" />, { wrapper: RecognitionModelProvider });
  expect(await screen.findByText('Todo listo para practicar.')).toBeInTheDocument();
  expect(request).toHaveBeenCalledTimes(1);
  await attempt(camera, 'Right');
  expect(screen.getByRole('heading', { name: 'Predicción coincidente' })).toBeVisible();
  expect(screen.getByText(/Esta coincidencia no certifica la ejecución/)).toBeVisible();
  expect(screen.queryByText('¡Muy bien!')).toBeNull();
  expect(screen.queryByText(/no califica|frames reales|Inferencia:/i)).toBeNull();
  expect(screen.getByRole('button', { name: 'Repetir intento' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Repetir intento' }));
  expect(screen.queryByText('¡Muy bien!')).toBeNull();
  expect(screen.getByRole('button', { name: 'Capturar intento' })).toBeEnabled();
});

test('sin cobertura izquierda permite repetir sin culpar al alumno ni pedir cambiar de mano', async () => {
  serveRelease();
  const camera = fakeCamera();
  render(<Harness camera={camera} target="A" />, { wrapper: RecognitionModelProvider });
  await screen.findByText('Todo listo para practicar.');
  await attempt(camera, 'Left');
  expect(screen.getByRole('heading', { name: 'Vamos paso a paso' })).toBeVisible();
  expect(screen.getByText(/el modelo no puede reconocer vocales con esa mano/)).toBeVisible();
  expect(screen.queryByText(/entrenamiento|muestras|prototipos|mano derecha/i)).toBeNull();
  expect(screen.queryByText(/El modelo propone/)).toBeNull();
});

test('una letra sin clasificación no descarga el modelo ni ofrece análisis', () => {
  const request = serveRelease();
  render(<Harness camera={fakeCamera()} target="B" />, { wrapper: RecognitionModelProvider });
  expect(screen.getByText(/Observa la referencia y practica a tu ritmo/)).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Capturar intento' })).toBeNull();
  expect(request).not.toHaveBeenCalled();
});

test('una hipótesis distinta no demuestra que el alumno se equivocó', () => {
  render(
    <AttemptResult
      result={{ label: 'A', reason: 'CANDIDATE' }}
      model={release}
      target="E"
      onRetry={() => {}}
    />,
  );
  expect(screen.getByRole('heading', { name: 'El modelo propuso otra vocal' })).toBeVisible();
  expect(screen.getByText(/Estás practicando la E/)).toBeVisible();
  expect(screen.queryByText(/correct/i)).toBeNull();
});

test('tras un fallo de descarga, cambiar de letra conserva el error y el reintento sin otra descarga', async () => {
  const request = vi.fn().mockResolvedValue(new Response('', { status: 404 }));
  vi.stubGlobal('fetch', request);
  const camera = fakeCamera();
  const view = render(<Harness key="A" camera={camera} target="A" />, {
    wrapper: RecognitionModelProvider,
  });
  expect(await screen.findByText(/La ayuda automática no está disponible/)).toBeVisible();
  view.rerender(<Harness key="E" camera={camera} target="E" />);
  expect(screen.getByText(/La ayuda automática no está disponible/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled();
  expect(request).toHaveBeenCalledTimes(1);
});
