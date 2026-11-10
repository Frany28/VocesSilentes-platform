import { act, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { ModelInference } from '../features/student/recognition/ModelInference.jsx';
import { RecognitionModelProvider } from '../features/student/recognition/RecognitionModelProvider.jsx';
import { useLocalModel } from '../features/student/recognition/use-local-model.js';
import { useSequenceCapture } from '../features/student/recognition/use-sequence-capture.js';
import { fakeCamera, samples, serveRelease } from './attempt-fixture.js';

// Mano sintética centrada y de buen tamaño (lista para capturar). No es una seña.
const centered = Array.from({ length: 21 }, (_, index) => ({
  x: 0.35 + (0.3 * (index % 5)) / 4,
  y: 0.35 + (0.3 * Math.floor(index / 5)) / 4,
  z: 0,
}));

function Harness({ camera }) {
  const capture = useSequenceCapture(camera);
  const operation = useLocalModel({ autoLoad: true });
  return <ModelInference operation={operation} capture={capture} camera={camera} target="A" />;
}

// Entrega un frame cada 100 ms con el reloj del navegador (como requestAnimationFrame).
function feed(camera, duration, landmarks) {
  for (let elapsed = 0; elapsed <= duration; elapsed += 100) {
    camera.receive(
      { landmarks, handedness: landmarks.map(() => [{ categoryName: 'Right' }]) },
      { time: performance.now(), width: 640, height: 480 },
    );
    vi.advanceTimersByTime(100);
  }
}

// Frames sintéticos de A durante la captura y fin de los 3 s.
function captureA(camera) {
  for (const frame of samples[0].frames) {
    camera.receive(
      {
        landmarks: [frame.points.map(([x, y, z]) => ({ x, y, z }))],
        handedness: [[{ categoryName: 'Right' }]],
      },
      { time: performance.now(), width: 640, height: 480 },
    );
    vi.advanceTimersByTime(100);
  }
  vi.advanceTimersByTime(1000);
}

test('captura sola con la mano quieta, analiza y no repite hasta bajar la mano', async () => {
  serveRelease();
  const camera = fakeCamera();
  render(<Harness camera={camera} />, { wrapper: RecognitionModelProvider });
  await screen.findByText(/Reconocimiento experimental listo/);
  expect(screen.getByText(/la captura empieza sola/)).toBeVisible();
  vi.useFakeTimers();
  try {
    act(() => feed(camera, 500, [centered]));
    expect(screen.getByText(/Mano detectada: mantén la seña/)).toBeVisible();
    act(() => feed(camera, 400, [centered]));
    expect(screen.getByText('Capturando… mantén la seña quieta.')).toBeVisible();
    act(() => captureA(camera));
    expect(screen.getByText(/El modelo propone: A\./)).toBeVisible();
    expect(screen.getByText(/baja la mano y vuelve a formar la seña/)).toBeVisible();
    act(() => feed(camera, 1500, [centered]));
    expect(screen.queryByText('Capturando… mantén la seña quieta.')).toBeNull();
    act(() => feed(camera, 700, []));
    act(() => feed(camera, 1000, [centered]));
    expect(screen.getByText('Capturando… mantén la seña quieta.')).toBeVisible();
  } finally {
    vi.useRealTimers();
  }
});

test('el estudiante practica sin controles de configuración de captura o lateralidad', async () => {
  serveRelease();
  const camera = fakeCamera();
  render(<Harness camera={camera} />, { wrapper: RecognitionModelProvider });
  await screen.findByText(/Reconocimiento experimental listo/);
  expect(screen.queryByRole('checkbox', { name: /Captura automática/ })).toBeNull();
  expect(screen.queryByRole('combobox', { name: /Mano/ })).toBeNull();
  vi.useFakeTimers();
  act(() => feed(camera, 2000, []));
  vi.useRealTimers();
  expect(screen.queryByText('Capturando… mantén la seña quieta.')).toBeNull();
  expect(
    screen.getByText('Forma la seña dentro del recuadro: la captura empieza sola.'),
  ).toBeVisible();
});
