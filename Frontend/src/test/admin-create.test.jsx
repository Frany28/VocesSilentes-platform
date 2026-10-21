import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderAdmin, fillAdminForm, account } from './admin-fixture.jsx';
import { jsonResponse } from './auth-fixture.jsx';

test('crear: valida sin enviar, evita doble envío y solo muestra cuenta tras respuesta real', async () => {
  let finish;
  const { view, fetchMock } = renderAdmin('/admin/users/new', (_url, options) =>
    options.method === 'POST'
      ? new Promise((resolve) => {
          finish = resolve;
        })
      : jsonResponse({ data: { user: account } }),
  );
  await screen.findByRole('heading', { name: 'Crear usuario' });
  const form = screen.getByRole('button', { name: 'Crear usuario' }).closest('form');
  fireEvent.submit(form);
  expect(screen.getByRole('alert')).toHaveTextContent('Revisa los campos');
  expect(fetchMock.mock.calls.some(([, options]) => options.method === 'POST')).toBe(false);
  fillAdminForm();
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Abcd12!' } });
  fireEvent.submit(form);
  expect(screen.getByText('La contraseña debe tener al menos 8 caracteres.')).toBeVisible();
  expect(fetchMock.mock.calls.some(([, options]) => options.method === 'POST')).toBe(false);
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Abcd123!' } });
  fireEvent.submit(form);
  fireEvent.submit(form);
  await waitFor(() => expect(finish).toBeDefined());
  expect(fetchMock.mock.calls.filter(([, options]) => options.method === 'POST')).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'Creando usuario…' })).toBeDisabled();
  expect(screen.queryByRole('heading', { name: 'Cuenta guardada' })).not.toBeInTheDocument();
  const options = fetchMock.mock.calls.find(([, options]) => options.method === 'POST')[1];
  expect(options.credentials).toBe('include');
  expect(options.headers.get('X-CSRF-Token')).toBe('test-csrf');
  expect(JSON.parse(options.body)).toMatchObject({ role: 'USER', isActive: true, lastName: null });
  expect(JSON.parse(options.body).password).toBe('Abcd123!');
  finish(jsonResponse({ data: { user: account } }, 201));
  expect(await screen.findByRole('heading', { name: 'Cuenta guardada' })).toBeVisible();
  expect(localStorage.getItem('vs-admin-users:test-user')).toBeNull();
  expect(JSON.stringify(localStorage)).not.toContain('Abcd123!');
  view.unmount();
  renderAdmin(`/admin/users/${account.id}/created`);
  expect(await screen.findByRole('heading', { name: 'Persona' })).toBeVisible();
});

test('crear: error conserva datos, no muestra éxito, permite corregir/reintentar y confirma cancelación', async () => {
  const { fetchMock } = renderAdmin('/admin/users/new', () =>
    jsonResponse({ error: { code: 'ACCOUNT_UNAVAILABLE', message: 'Duplicado' } }, 409),
  );
  await screen.findByRole('heading', { name: 'Crear usuario' });
  fillAdminForm();
  fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }));
  await screen.findByText(/Duplicado/);
  expect(screen.getByLabelText('Nombre')).toHaveValue('Persona');
  expect(screen.queryByRole('heading', { name: 'Cuenta guardada' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(screen.getByRole('dialog', { name: '¿Descartar los cambios?' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Descartar cambios' }));
  expect(await screen.findByRole('heading', { name: 'Gestión de usuarios' })).toBeVisible();
  expect(fetchMock.mock.calls.filter(([, options]) => options.method === 'POST')).toHaveLength(1);
});
