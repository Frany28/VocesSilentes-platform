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
  expect(screen.getByText('Tu intento coincide con la letra A.')).toBeVisible();
  expect(screen.getByText('¡Muy bien!')).toBeVisible();
  expect(screen.queryByText(/experimental|no califica|frames reales|Inferencia:/i)).toBeNull();
  expect(screen.getByRole('button', { name: 'Repetir intento' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Repetir intento' }));
  expect(screen.queryByText('¡Muy bien!')).toBeNull();
  expect(screen.getByRole('button', { name: 'Capturar intento' })).toBeEnabled();
});

test('sin ejemplos de esa lateralidad se abstiene e indica qué mano usar', async () => {
  serveRelease();
  const camera = fakeCamera();
  render(<Harness camera={camera} target="A" />, { wrapper: RecognitionModelProvider });
  await screen.findByText('Todo listo para practicar.');
  await attempt(camera, 'Left');
  expect(screen.getByText(/Esta mano necesita más entrenamiento/)).toBeVisible();
  expect(screen.queryByText(/El modelo propone/)).toBeNull();
});

test('una letra sin clasificación no descarga el modelo ni ofrece análisis', () => {
  const request = serveRelease();
  render(<Harness camera={fakeCamera()} target="B" />, { wrapper: RecognitionModelProvider });
  expect(screen.getByText(/Esta letra aún no tiene ayuda automática/)).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Capturar intento' })).toBeNull();
  expect(request).not.toHaveBeenCalled();
});

test('si la hipótesis no coincide con la letra objetivo lo dice sin convertirlo en calificación', () => {
  render(
    <AttemptResult
      result={{ label: 'A', reason: 'CANDIDATE' }}
      model={release}
      target="E"
      onRetry={() => {}}
    />,
  );
  expect(
    screen.getByText(/La forma se parece a la A\. Observa la E y vuelve a intentarlo/),
  ).toBeVisible();
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
