import { act, fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { AttemptResult } from '../features/student/recognition/AttemptResult.jsx';
import { PracticeProgress } from '../features/student/recognition/PracticeProgress.jsx';
import { practicePhase } from '../features/student/recognition/practice-feedback.js';
import { LabAttemptResult } from '../features/student/recognition/LabAttemptResult.jsx';

test('una coincidencia experimental no declara logro ni avanza sola; navegación voluntaria y referencia', () => {
  vi.useFakeTimers();
  try {
    const next = vi.fn();
    const reference = vi.fn();
    const result = { label: 'E', reason: 'CANDIDATE', inferenceMs: 3, frames: [{ hand: 'Right' }] };
    render(
      <AttemptResult
        result={result}
        target="E"
        onRetry={vi.fn()}
        onContinue={next}
        onReference={reference}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Coincidencia experimental' })).toBeVisible();
    expect(screen.getByLabelText('Letra candidata E')).toBeVisible();
    expect(screen.queryByText(/logrado|¡Muy bien!|correctamente/)).toBeNull();
    expect(screen.getByText(/no valida tu ejecución de LSV/)).toBeVisible();
    expect(screen.queryByText(/Inferencia:/i)).toBeNull();
    act(() => vi.advanceTimersByTime(5000));
    expect(next).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Ver referencia' }));
    expect(reference).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Continuar práctica' }));
    expect(next).toHaveBeenCalledTimes(1);
  } finally {
    vi.useRealTimers();
  }
});

test.each([
  [{ label: 'A', reason: 'CANDIDATE' }, /El modelo propone la letra A/],
  [{ label: null, reason: 'UNSUPPORTED_HAND' }, /no tiene cobertura para esta mano/],
  [{ label: null, reason: 'AMBIGUOUS' }, /No hay evidencia suficiente/],
  [{ label: null, reason: 'OUT_OF_DISTRIBUTION' }, /No hay evidencia suficiente/],
  [{ label: null, reason: 'SINGLE_HAND_REQUIRED' }, /una sola mano visible/],
])('otra letra o abstención %j ayuda a repetir sin afirmar un error', (result, advice) => {
  const retry = vi.fn();
  render(<AttemptResult result={result} target="E" onRetry={retry} onContinue={vi.fn()} />);
  expect(screen.getByText(advice)).toBeVisible();
  expect(
    screen.queryByText(/entrenamiento|prototipo|muestras|dataset|incorrect|dedos/i),
  ).toBeNull();
  expect(screen.queryByText('¡Muy bien!')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Repetir intento' }));
  expect(retry).toHaveBeenCalledTimes(1);
});

test('el progreso no completa con detección ni abstención y el actual se anuncia por texto', () => {
  const operation = { result: { label: null } };
  const state = { live: true, busy: false, shown: false };
  expect(practicePhase(state)).toBe('practice');
  expect(practicePhase(state, true)).toBe('retry');
  expect(practicePhase({ ...state, shown: true })).toBe('retry');
  operation.result = { label: 'E', reason: 'CANDIDATE' };
  const phase = practicePhase({ ...state, shown: true }, false, operation.result, 'E');
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
