import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderAdmin } from './admin-fixture.jsx';

test('usuarios: modal, foco inicial y confirmación de cambios antes de navegar a reportes', async () => {
  renderAdmin('/admin/users');
  await screen.findByText('Persona');
  fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }));
  const form = await screen.findByRole('dialog', { name: 'Crear usuario' });
  expect(within(form).getByLabelText('Nombre')).toHaveFocus();
  fireEvent.change(within(form).getByLabelText('Nombre'), { target: { value: 'Borrador' } });
  fireEvent.click(
    within(screen.getByRole('navigation', { name: 'Administración' })).getByRole('link', {
      name: 'Reportes',
    }),
  );
  const discard = screen.getByRole('dialog', { name: '¿Descartar los cambios?' });
  fireEvent.click(within(discard).getByRole('button', { name: 'Descartar cambios' }));
  expect(await screen.findByRole('heading', { name: 'Reportes de la comunidad' })).toBeVisible();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe('');
});

test('reportes reales, navegación y tema: consulta API sin inventar registros', async () => {
  const { fetchMock } = renderAdmin('/admin/reports');
  await screen.findByRole('heading', { name: 'Reportes de la comunidad' });
  expect(await screen.findByText('Todavía no hay reportes')).toBeVisible();
  expect(screen.getByLabelText('Buscar reportes')).toBeEnabled();
  expect(screen.queryByText('Video de saludo no carga')).not.toBeInTheDocument();
  expect(screen.queryByText('Reportar un error')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Cambiar a modo oscuro' }));
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(fetchMock.mock.calls.some(([url]) => url.includes('/reports?'))).toBe(true);
});
