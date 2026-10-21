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

test('reportes sin backend, navegación y tema: ninguna simulación ni petición a endpoints inexistentes', async () => {
  const { fetchMock } = renderAdmin('/admin/reports');
  await screen.findByRole('heading', { name: 'Reportes de la comunidad' });
  expect(screen.getByText('Reportes no disponibles')).toBeVisible();
  expect(screen.getByLabelText('Buscar reportes')).toBeDisabled();
  expect(screen.queryByText('Video de saludo no carga')).not.toBeInTheDocument();
  expect(screen.queryByText('Reportar un error')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Tema oscuro' }));
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(fetchMock.mock.calls.every(([url]) => url.endsWith('/auth/me'))).toBe(true);
});
