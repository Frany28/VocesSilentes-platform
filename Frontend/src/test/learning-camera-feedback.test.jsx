import { act, fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { AttemptResult } from '../features/student/recognition/AttemptResult.jsx';
import { PracticeProgress } from '../features/student/recognition/PracticeProgress.jsx';
import { practicePhase } from '../features/student/recognition/practice-feedback.js';
import { LabAttemptResult } from '../features/student/recognition/LabAttemptResult.jsx';

test('coincidencia ofrece logro visible y continuar; quedarse cancela el avance automático', () => {
  vi.useFakeTimers();
  try {
    const next = vi.fn();
    const result = { label: 'E', inferenceMs: 3, frames: [{ hand: 'Right' }] };
    render(<AttemptResult result={result} target="E" onRetry={vi.fn()} onContinue={next} />);
    expect(screen.getByRole('heading', { name: '¡Muy bien!' })).toBeVisible();
    expect(screen.getByText('Tu intento coincide con la letra E.')).toBeVisible();
    expect(screen.queryByText(/experimental|Inferencia:|no califica/i)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Seguir practicando aquí' }));
    act(() => vi.advanceTimersByTime(5000));
    expect(next).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    act(() => vi.advanceTimersByTime(5000));
    expect(next).toHaveBeenCalledTimes(1);
  } finally {
    vi.useRealTimers();
  }
});

test.each([
  [{ label: 'A' }, /Observa la E/],
  [{ label: null, reason: 'UNSUPPORTED_HAND' }, /Esta mano necesita más entrenamiento/],
  [{ label: null, reason: 'AMBIGUOUS' }, /posición de los dedos/],
  [{ label: null, reason: 'OUT_OF_DISTRIBUTION' }, /dentro del recuadro/],
  [{ label: null, reason: 'SINGLE_HAND_REQUIRED' }, /una sola mano visible/],
])('otra letra o abstención %j ayuda a repetir sin ofrecer continuación', (result, advice) => {
  const retry = vi.fn();
  render(<AttemptResult result={result} target="E" onRetry={retry} onContinue={vi.fn()} />);
  expect(screen.getByText(advice)).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Continuar' })).toBeNull();
  expect(screen.queryByText('¡Muy bien!')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Repetir intento' }));
  expect(retry).toHaveBeenCalledTimes(1);
});

test('el progreso no completa con detección ni abstención y el actual se anuncia por texto', () => {
  const operation = { result: { label: null } };
  const state = { live: true, busy: false, shown: false };
  expect(practicePhase(state, operation, 'E')).toBe('practice');
  expect(practicePhase(state, operation, 'E', true)).toBe('retry');
  expect(practicePhase({ ...state, shown: true }, operation, 'E')).toBe('retry');
  operation.result.label = 'E';
  const phase = practicePhase({ ...state, shown: true }, operation, 'E');
  const view = render(<PracticeProgress phase={phase} />);
  expect(view.container.querySelector('[aria-current="step"]')).toHaveTextContent('Continúa');
  expect(view.container.querySelectorAll('[data-completed]')).toHaveLength(2);
});

test('el laboratorio conserva el resultado experimental y el tiempo real de inferencia', () => {
  render(
    <LabAttemptResult
      result={{ label: 'E', frames: [{ hand: 'Right' }], inferenceMs: 4.2 }}
      target="E"
      model={{}}
      onRetry={vi.fn()}
      disabled={false}
    />,
  );
  expect(screen.getByText('Hipótesis experimental')).toBeVisible();
  expect(screen.getByText(/Inferencia: 4.2 ms/)).toBeVisible();
});
