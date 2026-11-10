import { act, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { handGuidance } from '../features/student/recognition/hand-guidance.js';
import { CameraControls } from '../features/student/recognition/CameraControls.jsx';
import { ModelStatus } from '../features/student/recognition/ModelStatus.jsx';

// Mano sintética: 21 puntos en un cuadrado de lado `size` centrado en (x, y). No es una seña.
const hand = (x, y, size) =>
  Array.from({ length: 21 }, (_, index) => ({
    x: x - size / 2 + (size * (index % 5)) / 4,
    y: y - size / 2 + (size * Math.floor(index / 5)) / 4,
  }));

test('indica cómo encuadrar según los puntos detectados', () => {
  const state = (landmarks) => handGuidance({ landmarks }).state;
  expect(state([])).toBe('none');
  expect(state([hand(0.5, 0.5, 0.3), hand(0.3, 0.5, 0.3)])).toBe('many');
  expect(state([hand(0.5, 0.5, 0.1)])).toBe('far');
  expect(state([hand(0.5, 0.5, 0.9)])).toBe('near');
  expect(state([hand(0.12, 0.5, 0.3)])).toBe('edge');
  expect(state([hand(0.8, 0.5, 0.3)])).toBe('offcenter');
  expect(handGuidance({ landmarks: [hand(0.5, 0.5, 0.35)] })).toMatchObject({
    state: 'ok',
    ready: true,
  });
});

test('la indicación de posición sigue los frames en vivo y desaparece al detener', () => {
  let listener;
  const camera = {
    state: 'live',
    error: '',
    hands: 1,
    start: () => {},
    stop: () => {},
    subscribe: (next) => {
      listener = next;
      return () => {};
    },
  };
  const view = render(<CameraControls camera={camera} />);
  act(() => listener({ landmarks: [hand(0.5, 0.5, 0.1)] }));
  expect(screen.getByText('Acerca la mano a la cámara.')).toBeVisible();
  act(() => listener({ landmarks: [hand(0.5, 0.5, 0.35)] }));
  expect(screen.getByText('Mano bien colocada. Mantén la seña quieta.')).toBeVisible();
  act(() => listener(null));
  view.rerender(<CameraControls camera={{ ...camera, state: 'off', hands: 0 }} />);
  expect(screen.queryByText(/Mano bien colocada/)).toBeNull();
});

test('el estudiante no ve importación ni carga manual; el laboratorio sí puede importar', () => {
  const operation = {
    model: null,
    loading: true,
    loadError: '',
    loadDemo: () => {},
    load: () => {},
  };
  const student = render(<ModelStatus operation={operation} />);
  expect(screen.getByText('Estamos preparando tu práctica…')).toBeVisible();
  expect(screen.queryByText('Cargar un modelo entrenado')).toBeNull();
  expect(screen.queryByRole('button')).toBeNull();
  student.unmount();
  render(<ModelStatus operation={{ ...operation, loading: false }} allowImport />);
  expect(screen.getByText('Cargar un modelo entrenado')).toBeVisible();
});
