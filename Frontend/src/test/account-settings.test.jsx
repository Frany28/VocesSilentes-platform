import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { user, jsonResponse, renderAuthApp } from './auth-fixture.jsx';

test('USER edita su perfil con CSRF y sin enviar identidad ni rol privilegiado', async () => {
  let current = user;
  const fetchMock = vi.fn(async (url, options) => {
    if (url.endsWith('/auth/csrf')) return jsonResponse({ data: { csrfToken: 'test-csrf' } });
    if (url.endsWith('/account/profile')) {
      current = { ...current, ...JSON.parse(options.body) };
      return jsonResponse({ data: { user: current } });
    }
    return jsonResponse({ data: { user: current } });
  });
  vi.stubGlobal('fetch', fetchMock);
  renderAuthApp('/student/profile');
  await screen.findByLabelText('Nombre');
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Nombre guardado' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  expect(await screen.findByText('Cambios guardados')).toBeVisible();
  const [, options] = fetchMock.mock.calls.find(([url]) => url.endsWith('/account/profile'));
  expect(JSON.parse(options.body)).toEqual({
    firstName: 'Nombre guardado',
    lastName: null,
    username: user.username,
    email: user.email,
  });
  expect(options.headers.get('X-CSRF-Token')).toBe('test-csrf');
  expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
});

test('contraseña: confirma coincidencia, conserva borrador tras error y solo anuncia éxito del servidor', async () => {
  let fail = true;
  const fetchMock = vi.fn(async (url) => {
    if (url.endsWith('/auth/csrf')) return jsonResponse({ data: { csrfToken: 'test-csrf' } });
    if (url.endsWith('/account/password'))
      return fail
        ? jsonResponse(
            {
              error: { code: 'CURRENT_PASSWORD_INVALID', message: 'Contraseña actual incorrecta' },
            },
            400,
          )
        : { ok: true, status: 204 };
    return jsonResponse({ data: { user } });
  });
  vi.stubGlobal('fetch', fetchMock);
  renderAuthApp('/student/profile/security');
  await screen.findByLabelText('Contraseña actual');
  for (const [label, value] of [
    ['Contraseña actual', 'Una frase anterior 2026!'],
    ['Nueva contraseña', 'Una frase diferente 2026!'],
    ['Confirma la nueva contraseña', 'no coincide'],
  ])
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: 'Actualizar contraseña' }));
  expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/account/password'))).toBe(false);
  fireEvent.change(screen.getByLabelText('Confirma la nueva contraseña'), {
    target: { value: 'Una frase diferente 2026!' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Actualizar contraseña' }));
  expect(await screen.findByText('Contraseña actual incorrecta')).toBeVisible();
  expect(screen.getByLabelText('Nueva contraseña')).toHaveValue('Una frase diferente 2026!');
  fail = false;
  fireEvent.click(screen.getByRole('button', { name: 'Actualizar contraseña' }));
  expect(await screen.findByText('Contraseña actualizada')).toBeVisible();
  await waitFor(() => expect(screen.getByLabelText('Nueva contraseña')).toHaveValue(''));
});
