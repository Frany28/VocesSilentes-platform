import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { TrainingCapture } from '../features/student/recognition/TrainingCapture.jsx';

test('cambiar de participante requiere un consentimiento nuevo antes de capturar otra muestra', async () => {
  const capture = { pending: false, frames: null, clear: vi.fn(), capture: vi.fn(), error: '' };
  render(
    <TrainingCapture
      camera={{ state: 'live' }}
      capture={capture}
      collection={{ add: vi.fn() }}
      letter="A"
      onLetter={vi.fn()}
    />,
  );
  const button = screen.getByRole('button', { name: 'Capturar muestra' });
  await userEvent.type(screen.getByLabelText('Código de participante'), 'p01');
  expect(button).toBeDisabled();
  await userEvent.click(screen.getByRole('checkbox'));
  expect(button).toBeEnabled();
  await userEvent.clear(screen.getByLabelText('Código de participante'));
  await userEvent.type(screen.getByLabelText('Código de participante'), 'p02');
  expect(screen.getByRole('checkbox')).not.toBeChecked();
  expect(button).toBeDisabled();
  expect(capture.capture).not.toHaveBeenCalled();
});
