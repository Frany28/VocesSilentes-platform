import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { ReportReview } from '../features/admin/components/ReportReview.jsx';
import { report } from './admin-report-fixture.js';

test('resolución: sin servicio no hay mutación ni mensaje de éxito', () => {
  render(<ReportReview report={report} />);
  fireEvent.click(screen.getByRole('button', { name: 'Marcar como resuelto' }));
  expect(screen.getByRole('button', { name: 'Confirmar resolución' })).toBeDisabled();
  expect(screen.getByRole('dialog')).toHaveTextContent('falta el servicio');
});

test('resolución: espera confirmación real, evita doble envío y conserva errores/comentario', async () => {
  let finish;
  const resolve = vi
    .fn()
    .mockRejectedValueOnce(new Error('Error de servicio'))
    .mockImplementation(
      () =>
        new Promise((done) => {
          finish = done;
        }),
    );
  render(<ReportReview report={report} onResolve={resolve} />);
  fireEvent.change(screen.getByLabelText('Comentario interno (opcional)'), {
    target: { value: 'Revisado' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Marcar como resuelto' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar resolución' }));
  expect(await screen.findByText('Error de servicio')).toBeVisible();
  expect(screen.getByLabelText('Comentario interno (opcional)')).toHaveValue('Revisado');
  const dialog = screen.getByRole('dialog');
  const confirm = within(dialog).getByRole('button', { name: 'Confirmar resolución' });
  fireEvent.click(confirm);
  fireEvent.click(confirm);
  expect(resolve).toHaveBeenCalledTimes(2);
  expect(screen.queryByText('Reporte resuelto')).not.toBeInTheDocument();
  await act(async () =>
    finish({
      ...report,
      status: 'RESOLVED',
      resolvedBy: 'Admin',
      resolvedAt: '2026-10-21T12:00:00Z',
    }),
  );
  expect(await screen.findByText('Reporte resuelto')).toBeVisible();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByText('Resuelto')).toBeVisible();
  expect(resolve.mock.calls[1][0]).toBe(report.id);
  expect(resolve.mock.calls[1][1]).toBe('Revisado');
});
