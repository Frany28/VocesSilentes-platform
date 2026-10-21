import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderAdmin } from './admin-fixture.jsx';

test('usuarios: navegación al formulario y guard de cambios antes de abrir reportes', async () => {
  renderAdmin('/admin/users');
  await screen.findByText('Persona');
  fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }));
  await screen.findByLabelText('Nombre');
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Borrador' } });
  fireEvent.click(
    within(screen.getByRole('navigation', { name: 'Administración' })).getByRole('link', {
      name: 'Reportes',
    }),
  );
  expect(screen.getByRole('dialog')).toHaveTextContent('¿Descartar los cambios?');
  fireEvent.click(screen.getByRole('button', { name: 'Descartar cambios' }));
  expect(await screen.findByRole('heading', { name: 'Reportes' })).toBeVisible();
});

test('reportes y estados: resolución explícita demo, tema y sin peticiones de escritura', async () => {
  const { fetchMock } = renderAdmin('/admin/reports/demo-report-1');
  await screen.findByRole('heading', { name: 'Video de saludo no carga' });
  fireEvent.change(screen.getByLabelText('Comentario interno (opcional)'), {
    target: { value: 'Nota demo' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Marcar como resuelto' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('simulación local');
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar demostración' }));
  expect(screen.getByText('Resuelto')).toBeVisible();
  expect(screen.getByText(/no se guardaron en la base de datos/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Tema oscuro' }));
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(
    fetchMock.mock.calls.every(([, options]) => !options.method || options.method === 'GET'),
  ).toBe(true);
});
