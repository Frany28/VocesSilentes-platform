import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { user, jsonResponse, unauthorized, renderAuthApp } from './auth-fixture.jsx';

test('carga: protege incluso dos submit síncronos, anuncia y deshabilita controles; actualiza sesión por rol', async () => {
  let finish;
  const fetchMock = vi.fn().mockImplementation((url) => {
    if (url.endsWith('/me')) return Promise.resolve(unauthorized());
    if (url.endsWith('/csrf'))
      return Promise.resolve(jsonResponse({ data: { csrfToken: 'csrf-test' } }));
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  renderAuthApp('/login');
  fireEvent.change(screen.getByLabelText('Correo electrónico'), {
    target: { value: 'person@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: ' a ' } });
  const form = screen.getByRole('form', { name: 'Inicia sesión' });
  await act(async () => {
    fireEvent.submit(form);
    fireEvent.submit(form);
  });
  expect(screen.getByLabelText('Correo electrónico')).toBeDisabled();
  expect(screen.getByLabelText('Contraseña')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Iniciando sesión…' })).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent('Iniciando sesión…');
  expect(fetchMock.mock.calls.filter(([url]) => url.endsWith('/login'))).toHaveLength(1);
  expect(
    JSON.parse(fetchMock.mock.calls.find(([url]) => url.endsWith('/login'))[1].body).password,
  ).toBe(' a ');
  await act(async () =>
    finish(jsonResponse({ data: { user: { ...user, role: 'ADMIN' }, csrfToken: 'rotated' } })),
  );
  expect(await screen.findByRole('heading', { name: 'Resumen' })).toBeVisible();
  expect(screen.getByRole('navigation', { name: 'Administración' })).toBeVisible();
  expect(localStorage.getItem('password')).toBeNull();
  expect(sessionStorage.length).toBe(0);
});

test('salir durante la petición aborta el envío y descarta el éxito tardío', async () => {
  let signal;
  let finish;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url, options) => {
      if (url.endsWith('/me')) return Promise.resolve(unauthorized());
      if (url.endsWith('/csrf'))
        return Promise.resolve(jsonResponse({ data: { csrfToken: 'csrf-test' } }));
      signal = options.signal;
      return new Promise((resolve) => {
        finish = resolve;
      });
    }),
  );
  renderAuthApp('/login');
  fireEvent.change(screen.getByLabelText('Correo electrónico'), {
    target: { value: 'person@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'a' } });
  fireEvent.submit(screen.getByRole('form', { name: 'Inicia sesión' }));
  await waitFor(() => expect(signal).toBeDefined());
  await userEvent.click(screen.getByRole('link', { name: '← Volver al inicio' }));
  expect(signal.aborted).toBe(true);
  await act(async () => finish(jsonResponse({ data: { user, csrfToken: 'rotated' } })));
  expect(screen.queryByRole('heading', { name: 'Mi cuenta' })).not.toBeInTheDocument();
});
