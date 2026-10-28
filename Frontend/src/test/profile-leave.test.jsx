import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { user, jsonResponse, renderAuthApp } from './auth-fixture.jsx';

test('perfil Student confirma navegación con borrador y conserva cambios al cancelar', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { user } })));
  renderAuthApp('/student/profile');
  const field = await screen.findByLabelText('Nombre');
  fireEvent.change(field, { target: { value: 'Borrador' } });
  fireEvent.click(screen.getByRole('link', { name: 'Seguridad' }));
  let dialog = screen.getByRole('dialog', { name: '¿Descartar los cambios?' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
  expect(field).toHaveValue('Borrador');
  fireEvent.click(screen.getByRole('link', { name: 'Seguridad' }));
  dialog = screen.getByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Descartar cambios' }));
  expect(await screen.findByLabelText('Contraseña actual')).toBeVisible();
});

test('perfil Student bloquea navegación al guardar y después del éxito navega sin descarte', async () => {
  let finish;
  const fetchMock = vi.fn((url, options) => {
    if (url.endsWith('/csrf'))
      return Promise.resolve(jsonResponse({ data: { csrfToken: 'csrf' } }));
    if (url.endsWith('/account/profile'))
      return new Promise((resolve) => {
        finish = () =>
          resolve(jsonResponse({ data: { user: { ...user, ...JSON.parse(options.body) } } }));
      });
    return Promise.resolve(jsonResponse({ data: { user } }));
  });
  vi.stubGlobal('fetch', fetchMock);
  renderAuthApp('/student/profile');
  fireEvent.change(await screen.findByLabelText('Nombre'), { target: { value: 'Guardado' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  fireEvent.click(screen.getByRole('link', { name: 'Seguridad' }));
  expect(screen.queryByLabelText('Contraseña actual')).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await waitFor(() => expect(finish).toBeDefined());
  await act(async () => finish());
  expect(await screen.findByText('Cambios guardados')).toBeVisible();
  fireEvent.click(screen.getByRole('link', { name: 'Seguridad' }));
  expect(await screen.findByLabelText('Contraseña actual')).toBeVisible();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
