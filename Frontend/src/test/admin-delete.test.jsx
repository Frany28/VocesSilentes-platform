import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderAdmin, account } from './admin-fixture.jsx';
import { jsonResponse } from './auth-fixture.jsx';

test('eliminación: confirma, cancela sin enviar, evita doble envío y espera al servidor', async () => {
  let finish;
  const { fetchMock } = renderAdmin(`/admin/users/${account.id}`, (url, options) => {
    if (options.method === 'DELETE')
      return new Promise((resolve) => {
        finish = resolve;
      });
    return jsonResponse({
      data: url.includes('/admin/users?')
        ? { items: [], total: 0, page: 1, pageSize: 3, pages: 1 }
        : { user: account },
    });
  });
  await screen.findByRole('heading', { name: 'Persona' });
  fireEvent.click(screen.getByText('Otras acciones de cuenta'));
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar cuenta' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Se revocarán sus sesiones');
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(fetchMock.mock.calls.some(([, options]) => options.method === 'DELETE')).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar cuenta' }));
  const confirm = screen.getByRole('button', { name: 'Confirmar eliminación' });
  fireEvent.click(confirm);
  fireEvent.click(confirm);
  await waitFor(() => expect(finish).toBeDefined());
  const calls = fetchMock.mock.calls.filter(([, options]) => options.method === 'DELETE');
  expect(calls).toHaveLength(1);
  expect(calls[0][1].headers.get('X-CSRF-Token')).toBe('test-csrf');
  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  expect(screen.queryByRole('heading', { name: 'Gestión de usuarios' })).not.toBeInTheDocument();
  await act(async () => finish(jsonResponse({ data: { user: { ...account, isDeleted: true } } })));
  await screen.findByRole('heading', { name: 'Gestión de usuarios' });
  expect(screen.getByText('La cuenta se eliminó y sus sesiones fueron revocadas.')).toBeVisible();
});

test('eliminación: conserva fallo del último ADMIN y permite reintentar sin afirmar éxito', async () => {
  const { fetchMock } = renderAdmin(`/admin/users/${account.id}`, (_url, options) =>
    options.method === 'DELETE'
      ? jsonResponse(
          {
            error: {
              code: 'LAST_ACTIVE_ADMIN',
              message: 'Debe permanecer al menos un administrador activo',
            },
          },
          409,
        )
      : jsonResponse({ data: { user: { ...account, role: 'ADMIN' } } }),
  );
  await screen.findByRole('heading', { name: 'Persona' });
  fireEvent.click(screen.getByText('Otras acciones de cuenta'));
  fireEvent.click(screen.getByRole('button', { name: 'Eliminar cuenta' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar eliminación' }));
  await screen.findByText('Debe permanecer al menos un administrador activo');
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Confirmar eliminación' })).toBeEnabled();
  expect(fetchMock.mock.calls.filter(([, options]) => options.method === 'DELETE')).toHaveLength(1);
});
