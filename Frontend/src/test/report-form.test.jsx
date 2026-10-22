import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { ReportForm } from '../features/reports/ReportForm.jsx';
import { reportsApi } from '../features/reports/reports.api.js';

beforeEach(() => {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-evidence');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  vi.stubGlobal(
    'Image',
    class {
      naturalWidth = 32;
      naturalHeight = 32;
      decode() {
        return Promise.resolve();
      }
    },
  );
});
afterEach(() => vi.restoreAllMocks());

function form() {
  render(
    <MemoryRouter>
      <ReportForm />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText('Descripción'), {
    target: { value: 'El vídeo no carga' },
  });
}
async function selectImage(file = new File(['test'], 'capture.png', { type: 'image/png' })) {
  await act(async () =>
    fireEvent.change(screen.getByLabelText('Imagen de evidencia (opcional)'), {
      target: { files: [file] },
    }),
  );
}

test('reporte sin archivo: no llama a Storage y solo confirma éxito tras guardar', async () => {
  const create = vi.spyOn(reportsApi, 'create').mockResolvedValue({ id: 'report-id' });
  const attach = vi.spyOn(reportsApi, 'attach');
  form();
  fireEvent.click(screen.getByRole('button', { name: 'Enviar reporte' }));
  expect(await screen.findByText('Reporte enviado')).toBeVisible();
  expect(create).toHaveBeenCalledOnce();
  expect(attach).not.toHaveBeenCalled();
});

test('selección: previsualiza, elimina y libera URL; rechaza GIF y exceso sin enviar', async () => {
  const create = vi.spyOn(reportsApi, 'create');
  form();
  await selectImage();
  expect(screen.getByAltText('Vista previa de la evidencia')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Quitar selección' }));
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-evidence');
  await selectImage(new File(['gif'], 'fake.png', { type: 'image/gif' }));
  expect(screen.getByRole('button', { name: 'Enviar reporte' })).toBeDisabled();
  expect(create).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Quitar selección' }));
  await selectImage(new File([new Uint8Array(5242881)], 'huge.png', { type: 'image/png' }));
  expect(screen.getByRole('alert')).toHaveTextContent('hasta 5 MB');
});

test('carga fallida: conserva archivo/requestId, evita doble envío y reintenta el mismo reporte', async () => {
  let finish;
  const create = vi
    .spyOn(reportsApi, 'create')
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValue({ id: 'report-id' });
  const attach = vi
    .spyOn(reportsApi, 'attach')
    .mockRejectedValueOnce(new Error('Carga interrumpida'))
    .mockResolvedValue();
  form();
  await selectImage();
  const send = screen.getByRole('button', { name: 'Enviar reporte' });
  fireEvent.click(send);
  fireEvent.click(send);
  expect(create).toHaveBeenCalledOnce();
  await act(async () => finish({ id: 'report-id' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Carga interrumpida');
  expect(screen.getByAltText('Vista previa de la evidencia')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar envío' }));
  await waitFor(() => expect(screen.getByText('Reporte enviado')).toBeVisible());
  expect(create.mock.calls[0][0]).toEqual(create.mock.calls[1][0]);
  expect(attach.mock.calls.map(([id]) => id)).toEqual(['report-id', 'report-id']);
});
