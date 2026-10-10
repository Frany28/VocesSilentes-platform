import { fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderAdmin, account } from './admin-fixture.jsx';
import { jsonResponse } from './auth-fixture.jsx';

test('editar: consulta por UUID, limita campos y actualiza la vista con respuesta del servidor', async () => {
  let current = { ...account };
  const { fetchMock, view } = renderAdmin(`/admin/users/${account.id}/edit`, (_url, options) => {
    if (options.method === 'PATCH')
      current = { ...current, ...JSON.parse(options.body), emailVerified: false };
    return jsonResponse({ data: { user: current } });
  });
  await screen.findByDisplayValue('Persona');
  expect(screen.queryByLabelText('Contraseña')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Estado inicial')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Actualizado' } });
  fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'nuevo@example.invalid' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  expect(await screen.findByRole('heading', { name: 'Actualizado' })).toBeVisible();
  const payload = JSON.parse(
    fetchMock.mock.calls.find(([, options]) => options.method === 'PATCH')[1].body,
  );
  expect(Object.keys(payload).sort()).toEqual([
    'email',
    'firstName',
    'lastName',
    'role',
    'username',
  ]);
  view.unmount();
  renderAdmin(`/admin/users/${account.id}`, () => jsonResponse({ data: { user: current } }));
  expect(await screen.findByRole('heading', { name: 'Actualizado' })).toBeVisible();
  expect(screen.getByText('Pendiente de verificación')).toBeVisible();
});

test('editar: último admin y fallo de lectura se conservan como errores, sin éxito ficticio', async () => {
  renderAdmin(`/admin/users/${account.id}/edit`, (_url, options) =>
    options.method === 'PATCH'
      ? jsonResponse(
          {
            error: {
              code: 'LAST_ACTIVE_ADMIN',
              message: 'Debe permanecer un administrador activo',
            },
          },
          409,
        )
      : jsonResponse({ data: { user: { ...account, role: 'ADMIN' } } }),
  );
  await screen.findByDisplayValue('Persona');
  fireEvent.change(screen.getByLabelText('Rol'), { target: { value: 'USER' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  expect(await screen.findByText(/Debe permanecer/)).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Editar cuenta' })).toBeVisible();
});
