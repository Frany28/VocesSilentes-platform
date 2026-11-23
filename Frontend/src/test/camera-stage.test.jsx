import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { cameraStage } from '../features/student/recognition/camera-stage.js';
import { WorkspaceAttempt } from '../features/student/recognition/WorkspaceAttempt.jsx';

const model = { labels: ['A', 'E', 'I', 'O', 'U', 'NONE'], prototypes: [{ hand: 'Right' }] };

function sources({ camera = {}, attempt = {}, operation = {}, capture = {} } = {}) {
  return {
    camera: {
      state: 'live',
      hands: 0,
      error: '',
      detection: null,
      subscribe: () => () => {},
      start: vi.fn(),
      stop: vi.fn(),
      ...camera,
    },
    attempt: {
      busy: false,
      live: true,
      supported: true,
      shown: false,
      countdown: { count: null },
      automatic: { rearm: vi.fn() },
      manual: vi.fn(),
      ...attempt,
    },
    operation: { model, loadError: '', result: null, error: '', clear: vi.fn(), ...operation },
    capture: { frames: null, error: '', clear: vi.fn(), ...capture },
    target: 'E',
  };
}

const shown = (result) =>
  sources({ attempt: { shown: true }, operation: { result }, capture: { frames: [{}] } });

test.each([
  ['off', sources({ camera: { state: 'off' } })],
  ['preparing', sources({ camera: { state: 'loading' } })],
  ['preparing', sources({ operation: { model: null } })],
  ['error', sources({ camera: { state: 'error', error: 'Permiso denegado' } })],
  ['error', sources({ operation: { model: null, loadError: 'sin red' } })],
  ['searching', sources()],
  ['detected', sources({ camera: { hands: 1 } })],
  ['capturing', sources({ attempt: { busy: true, countdown: { count: 2 } } })],
  ['analyzing', sources({ capture: { frames: [{}] } })],
  ['match', shown({ reason: 'CANDIDATE', label: 'E' })],
  ['different', shown({ reason: 'CANDIDATE', label: 'A' })],
  ['uncertain', shown({ reason: 'AMBIGUOUS', label: null })],
  ['uncertain', shown({ reason: 'CANDIDATE', label: 'E', captureIssue: 'PARTIAL_HAND' })],
  ['uncertain', sources({ capture: { error: 'Secuencia insuficiente' } })],
])('distingue la etapa %s con evidencia real', (id, input) => {
  expect(cameraStage(input).id).toBe(id);
});

test('una coincidencia se presenta como salida experimental, no como certificación', () => {
  const stage = cameraStage(shown({ reason: 'CANDIDATE', label: 'E' }));
  expect(stage.title).toBe('Predicción coincidente');
  expect(stage.guidance).toMatch(/no certifica/);
  const issue = cameraStage(
    shown({ reason: 'CANDIDATE', label: 'E', captureIssue: 'RAPID_MOVEMENT' }),
  );
  expect(issue.title).toBe('Captura insuficiente');
  expect(cameraStage(shown({ reason: 'OUT_OF_DISTRIBUTION' })).guidance).toMatch(
    /no tiene evidencia suficiente/,
  );
});

test('el panel muestra estado, etapa actual y acciones de repetición junto a la cámara', async () => {
  const user = userEvent.setup();
  const input = shown({ reason: 'CANDIDATE', label: 'A' });
  const reference = vi.fn();
  render(<WorkspaceAttempt {...input} onReference={reference} />);
  expect(screen.getByRole('status')).toHaveTextContent('El modelo propuso la A');
  expect(screen.getByRole('status')).toHaveTextContent('Practicas la E');
  expect(screen.getByText('Resultado')).toHaveAttribute('aria-current', 'step');
  await user.click(screen.getByRole('button', { name: 'Repetir intento' }));
  expect(input.operation.clear).toHaveBeenCalled();
  expect(input.capture.clear).toHaveBeenCalled();
  expect(input.attempt.automatic.rearm).toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Ver referencia' }));
  expect(reference).toHaveBeenCalled();
});

test('sin mano visible orienta el encuadre y ofrece capturar manualmente', () => {
  render(<WorkspaceAttempt {...sources()} />);
  expect(screen.getByRole('status')).toHaveTextContent('Buscando tu mano');
  expect(screen.getByText('Mano')).toHaveAttribute('aria-current', 'step');
  expect(screen.getByRole('button', { name: 'Capturar ahora' })).toBeEnabled();
  expect(screen.queryByRole('button', { name: 'Repetir intento' })).toBeNull();
});

test('con la cámara apagada el panel ofrece activarla junto al estado', async () => {
  const user = userEvent.setup();
  const input = sources({ camera: { state: 'off' }, attempt: { live: false } });
  render(<WorkspaceAttempt {...input} />);
  expect(screen.getByRole('status')).toHaveTextContent('Cámara desactivada');
  await user.click(screen.getByRole('button', { name: 'Activar cámara' }));
  expect(input.camera.start).toHaveBeenCalled();
});
