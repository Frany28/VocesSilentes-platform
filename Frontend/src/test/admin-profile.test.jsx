import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { renderAdmin } from './admin-fixture.jsx';
import { user, jsonResponse, renderAuthApp } from './auth-fixture.jsx';

test('perfil: guarda solo identidad propia con CSRF, bloquea doble envío y refresca sesión tras PATCH', async () => {
  let current = { ...user, role: 'ADMIN' };
  let finish;
  const fetchMock = vi.fn(async (url) => {
    if (url.endsWith('/auth/me')) return jsonResponse({ data: { user: current } });
    if (url.endsWith('/auth/csrf')) return jsonResponse({ data: { csrfToken: 'test-csrf' } });
    return new Promise((resolve) => {
      finish = (result) => {
        current = result;
        resolve(jsonResponse({ data: { user: result } }));
      };
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  renderAuthApp('/admin/profile');
  await screen.findByDisplayValue('Persona');
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Actualizado' } });
  const form = screen.getByRole('button', { name: 'Guardar cambios' }).closest('form');
  fireEvent.submit(form);
  fireEvent.submit(form);
  await waitFor(() => expect(finish).toBeDefined());
  expect(screen.getByRole('button', { name: 'Guardando…' })).toBeDisabled();
  expect(screen.queryByText('Cambios guardados')).not.toBeInTheDocument();
  const calls = fetchMock.mock.calls.filter(([, options]) => options.method === 'PATCH');
  expect(calls).toHaveLength(1);
  expect(calls[0][0]).toMatch(/admin\/users\/test-user$/);
  expect(calls[0][1].headers.get('X-CSRF-Token')).toBe('test-csrf');
  expect(JSON.parse(calls[0][1].body)).toEqual({
    firstName: 'Actualizado',
    lastName: null,
    username: 'person',
    email: user.email,
    role: 'ADMIN',
  });
  await act(async () => finish({ ...current, firstName: 'Actualizado' }));
  expect(await screen.findByText('Cambios guardados')).toBeVisible();
  expect(await screen.findByDisplayValue('Actualizado')).toBeVisible();
});

test('perfil: valida, conserva borrador tras conflicto y pide descarte antes de cambiar de pestaña', async () => {
  renderAdmin('/admin/profile', () =>
    jsonResponse({ error: { code: 'EMAIL_IN_USE', message: 'Correo ocupado' } }, 409),
  );
  await screen.findByDisplayValue('Persona');
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'true');
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Borrador' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await screen.findByText('Correo ocupado');
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled(),
  );
  expect(screen.getByLabelText('Nombre')).toHaveValue('Borrador');
  fireEvent.click(
    within(screen.getByRole('navigation', { name: 'Configuración de mi perfil' })).getByRole(
      'link',
      { name: 'Seguridad' },
    ),
  );
  fireEvent.click(
    within(screen.getByRole('dialog', { name: '¿Descartar los cambios?' })).getByRole('button', {
      name: 'Descartar cambios',
    }),
  );
  expect(await screen.findByText('Cambio de contraseña no disponible')).toBeVisible();
  expect(screen.getByLabelText('Contraseña actual')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Actualizar contraseña' })).toBeDisabled();
});
