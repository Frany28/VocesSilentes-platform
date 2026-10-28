import { fireEvent, render, screen, within } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router';
import { expect, test, vi } from 'vitest';
import { ReportForm } from '../features/reports/ReportForm.jsx';
import { reportsApi } from '../features/reports/reports.api.js';

test('reporte: valida campos y conserva título/ubicación en el contrato real sin perder datos', async () => {
  const create = vi.spyOn(reportsApi, 'create').mockResolvedValue({ id: 'real-reference' });
  render(
    <MemoryRouter>
      <ReportForm />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Enviar reporte' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Revisa los campos obligatorios.');
  expect(screen.getByLabelText('Título del problema *')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByLabelText('Tipo de error *')).toHaveAttribute('aria-invalid', 'true');
  expect(create).not.toHaveBeenCalled();
  for (const [label, value] of [
    ['Título del problema *', 'Vídeo en negro'],
    ['Ubicación (opcional)', 'Saludos básicos'],
    ['Tipo de error *', 'TECHNICAL'],
    ['Descripción del problema *', 'Esperaba ver la seña al pulsar inicio.'],
  ]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Enviar reporte' }));
  expect(await screen.findByText('Reporte enviado')).toBeVisible();
  expect(create.mock.calls[0][0]).toEqual({
    requestId: expect.any(String),
    category: 'TECHNICAL',
    description:
      'Vídeo en negro\n\nUbicación: Saludos básicos\n\nEsperaba ver la seña al pulsar inicio.',
  });
  expect(screen.getByText('Referencia: real-reference')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Crear otro reporte' }));
  expect(screen.getByLabelText('Título del problema *')).toHaveValue('');
  expect(screen.getByLabelText('Tipo de error *')).toHaveValue('');
});

test('reporte: cancelar regreso conserva campos y confirmar descarte permite navegar', async () => {
  render(
    <MemoryRouter initialEntries={['/student/reports/new']}>
      <Link to="/student">Volver al aprendizaje</Link>
      <Routes>
        <Route path="/student/reports/new" element={<ReportForm />} />
        <Route path="/student" element={<h1>Inicio de prueba</h1>} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText('Título del problema *'), {
    target: { value: 'Borrador' },
  });
  fireEvent.click(screen.getByRole('link', { name: 'Volver al aprendizaje' }));
  let dialog = screen.getByRole('dialog', { name: '¿Descartar los cambios?' });
  expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
  expect(screen.getByLabelText('Título del problema *')).toHaveValue('Borrador');
  fireEvent.click(screen.getByRole('link', { name: 'Volver al aprendizaje' }));
  dialog = screen.getByRole('dialog', { name: '¿Descartar los cambios?' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Descartar cambios' }));
  expect(await screen.findByRole('heading', { name: 'Inicio de prueba' })).toBeVisible();
});
