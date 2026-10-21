import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ReportEvidence } from '../features/admin/components/ReportEvidence.jsx';

test('evidencia: ausencia, carga, error/reintento, visor, Escape y restauración del foco', () => {
  const { rerender } = render(<ReportEvidence />);
  expect(screen.getByText('Sin imagen adjunta')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Ver imagen' })).not.toBeInTheDocument();
  rerender(
    <ReportEvidence
      evidence={{ src: '/evidence.png', name: 'captura.png', details: 'PNG · 248 KB' }}
    />,
  );
  fireEvent.error(document.querySelector('img'));
  expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar la imagen.');
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar imagen' }));
  fireEvent.load(document.querySelector('img'));
  const trigger = screen.getByRole('button', { name: 'Ver imagen' });
  trigger.focus();
  fireEvent.click(trigger);
  const viewer = screen.getByRole('dialog', { name: 'Imagen de evidencia' });
  expect(within(viewer).getByText('Cargando imagen…')).toBeVisible();
  fireEvent.load(viewer.querySelector('img'));
  expect(within(viewer).getByRole('img')).toBeVisible();
  fireEvent(viewer, new Event('cancel', { bubbles: true, cancelable: true }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
