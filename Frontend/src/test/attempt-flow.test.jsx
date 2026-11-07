import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
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
  expect(await screen.findByText(/Modelo experimental cargado: A\./)).toBeVisible();
  expect(screen.getByText(/Ejemplos solo con la mano derecha/)).toBeVisible();
  expect(request).toHaveBeenCalledTimes(1);
  await attempt(camera, 'Right');
  expect(
    screen.getByText(/El modelo propone: A\. Coincide con la A que practicas\./),
  ).toBeVisible();
  expect(screen.getByText(/no califica ni completa el ejercicio/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Repetir intento' })).toBeEnabled();
});

test('sin ejemplos de esa lateralidad se abstiene e indica qué mano usar', async () => {
  serveRelease();
  const camera = fakeCamera();
  render(<Harness camera={camera} target="A" />, { wrapper: RecognitionModelProvider });
  await screen.findByText(/Modelo experimental cargado/);
  await attempt(camera, 'Left');
  expect(
    screen.getByText(
      /Sin evidencia suficiente\. El modelo solo tiene ejemplos con la mano derecha/,
    ),
  ).toBeVisible();
  expect(screen.queryByText(/El modelo propone/)).toBeNull();
});

test('una letra sin clasificación no descarga el modelo ni ofrece análisis', () => {
  const request = serveRelease();
  render(<Harness camera={fakeCamera()} target="B" />, { wrapper: RecognitionModelProvider });
  expect(screen.getByText(/La B todavía no tiene reconocimiento experimental/)).toBeVisible();
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
    screen.getByText(/No coincide con la E que practicas; el modelo puede equivocarse/),
  ).toBeVisible();
  expect(screen.queryByText(/correct/i)).toBeNull();
});
