import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router';
import { expect, test, vi } from 'vitest';
import { ReportForm } from '../features/reports/ReportForm.jsx';
import { reportsApi } from '../features/reports/reports.api.js';

function form() {
  return render(
    <MemoryRouter initialEntries={['/student/reports/new']}>
      <Link to="/student">Volver al aprendizaje</Link>
      <Routes>
        <Route path="/student/reports/new" element={<ReportForm />} />
        <Route path="/student" element={<h1>Inicio de prueba</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

test('reporte sin cambios sale sin confirmar; con borrador cancelar conserva datos y recarga avisa', async () => {
  const view = form();
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(await screen.findByRole('heading', { name: 'Inicio de prueba' })).toBeVisible();
  view.unmount();
  form();
  fireEvent.change(screen.getByLabelText('Título del problema *'), {
    target: { value: 'Borrador' },
  });
  const reload = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(reload);
  expect(reload.defaultPrevented).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  let dialog = screen.getByRole('dialog');
  fireEvent(dialog, new Event('cancel', { cancelable: true }));
  expect(screen.getByLabelText('Título del problema *')).toHaveValue('Borrador');
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  dialog = screen.getByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Descartar cambios' }));
  expect(await screen.findByRole('heading', { name: 'Inicio de prueba' })).toBeVisible();
  const after = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(after);
  expect(after.defaultPrevented).toBe(false);
});

test('reporte en envío bloquea navegación interna y tras fallo permite descartar sin reenviar', async () => {
  let reject;
  const create = vi.spyOn(reportsApi, 'create').mockImplementation(
    () =>
      new Promise((_, fail) => {
        reject = fail;
      }),
  );
  form();
  for (const [label, value] of [
    ['Título del problema *', 'Vídeo'],
    ['Tipo de error *', 'TECHNICAL'],
    ['Descripción del problema *', 'El vídeo no carga'],
  ])
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar reporte' }));
  fireEvent.click(screen.getByRole('link', { name: 'Volver al aprendizaje' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Guardando…' })).toBeDisabled();
  await act(async () => reject(new Error('Sin conexión')));
  fireEvent.click(screen.getByRole('link', { name: 'Volver al aprendizaje' }));
  const dialog = screen.getByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Descartar cambios' }));
  expect(await screen.findByRole('heading', { name: 'Inicio de prueba' })).toBeVisible();
  expect(create).toHaveBeenCalledOnce();
  create.mockRestore();
});
