import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { AttemptResult } from '../features/student/recognition/AttemptResult.jsx';
import { practiceOutcome } from '../features/student/recognition/practice-feedback.js';

test.each([...'AEIOU'])(
  '%s muestra una coincidencia experimental y nunca una validación LSV',
  (letter) => {
    const result = { label: letter, reason: 'CANDIDATE' };
    const { container } = render(
      <AttemptResult result={result} target={letter} onRetry={vi.fn()} />,
    );
    expect(screen.getByRole('heading', { name: 'Coincidencia experimental' })).toBeVisible();
    expect(screen.getByLabelText(`Letra candidata ${letter}`)).toBeVisible();
    expect(container.querySelector('.practice-result')).toHaveAttribute('data-outcome', 'success');
    expect(practiceOutcome(result, letter)).not.toMatch(/CORRECT|INCORRECT/);
    expect(
      screen.getByText(/no valida tu ejecución de LSV ni registra una calificación/),
    ).toBeVisible();
  },
);

test.each([...'AEIOU'])(
  '%s diferente del objetivo ofrece Buen intento y conserva la candidata real',
  (letter) => {
    const target = letter === 'A' ? 'E' : 'A';
    render(
      <AttemptResult
        result={{ label: letter, reason: 'CANDIDATE' }}
        target={target}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Buen intento' })).toBeVisible();
    expect(screen.getByLabelText(`Letra candidata ${letter}`)).toBeVisible();
    expect(screen.queryByText(/incorrect|correctamente|logrado/i)).toBeNull();
  },
);

test.each([
  'UNSUPPORTED_HAND',
  'BACKGROUND',
  'AMBIGUOUS',
  'OUT_OF_DISTRIBUTION',
  'INVALID_SEQUENCE',
])('%s no se transforma en candidata aunque llegue una etiqueta residual', (reason) => {
  render(<AttemptResult result={{ label: 'A', reason }} target="A" onRetry={vi.fn()} />);
  expect(screen.getByRole('heading', { name: 'Seña no reconocida' })).toBeVisible();
  expect(screen.queryByLabelText(/Letra candidata/)).toBeNull();
});
