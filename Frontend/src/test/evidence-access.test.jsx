import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { reportsApi } from '../features/reports/reports.api.js';
import { useEvidenceAccess } from '../features/reports/use-evidence-access.js';
import { AuthorizedEvidence } from '../features/admin/components/AuthorizedEvidence.jsx';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
const access = (src) => ({ src, expiresAt: new Date(Date.now() + 120000).toISOString() });

test('acceso temporal: renueva a los 105 segundos y cancela al salir', async () => {
  vi.useFakeTimers();
  const read = vi
    .spyOn(reportsApi, 'access')
    .mockImplementation(async () => access(`/signed-${read.mock.calls.length}`));
  const { result, unmount } = renderHook(() => useEvidenceAccess('report-id'));
  await act(async () => {});
  expect(result.current.src).toBe('/signed-1');
  await act(async () => vi.advanceTimersByTime(105000));
  expect(read).toHaveBeenCalledTimes(2);
  expect(result.current.src).toBe('/signed-2');
  const signal = read.mock.calls[1][1];
  unmount();
  expect(signal.aborted).toBe(true);
  await act(async () => vi.advanceTimersByTime(200000));
  expect(read).toHaveBeenCalledTimes(2);
});

test('visor: error de enlace/expiración solicita otro tras verificar permisos y mantiene el modal', async () => {
  const read = vi
    .spyOn(reportsApi, 'access')
    .mockResolvedValueOnce(access('/expired'))
    .mockRejectedValueOnce(new Error('No se pudo renovar el enlace'))
    .mockResolvedValueOnce(access('/renewed'));
  render(
    <AuthorizedEvidence
      report={{ id: 'report-id', evidence: { state: 'READY', name: 'Evidencia' } }}
    />,
  );
  const trigger = await screen.findByRole('button', { name: 'Ver imagen' });
  await act(async () => {});
  fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog');
  fireEvent.error(dialog.querySelector('img'));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Reintentar imagen' }));
  expect(await within(dialog).findByText('No se pudo renovar el enlace')).toBeVisible();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Reintentar imagen' }));
  await act(async () => {});
  expect(dialog.querySelector('img')).toHaveAttribute('src', '/renewed');
  expect(read).toHaveBeenCalledTimes(3);
});
