import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { user, jsonResponse, unauthorized, renderAuthApp } from './auth-fixture.jsx';
import { requestJson } from '../lib/http.js';
import { safeReturnPath } from '../features/auth/return-path.js';

test('guard: oculta contenido mientras comprueba y redirige al confirmar 401', async () => {
  let finish;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    ),
  );
  renderAuthApp('/account');
  expect(screen.getByRole('status')).toHaveTextContent('Comprobando sesión');
  expect(screen.queryByText(/Vista provisional/)).not.toBeInTheDocument();
  finish(unauthorized());
  expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
});

test('guard: error de red tiene reintento y nunca equivale a ausencia de sesión', async () => {
  const fetchMock = vi
    .fn()
    .mockRejectedValueOnce(new TypeError('network'))
    .mockResolvedValue(jsonResponse({ data: { user } }));
  vi.stubGlobal('fetch', fetchMock);
  renderAuthApp('/account');
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo comprobar la sesión');
  expect(screen.queryByRole('heading', { name: 'Inicia sesión' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByRole('heading', { name: 'Mi cuenta' })).toBeVisible();
});

test('guard administrativo: USER denegado conserva sesión y ADMIN autorizado', async () => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { user } }));
  vi.stubGlobal('fetch', fetchMock);
  const view = renderAuthApp('/admin');
  expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso');
  expect(screen.getByRole('link', { name: 'Mi cuenta' })).toBeVisible();
  view.unmount();
  fetchMock.mockResolvedValue(jsonResponse({ data: { user: { ...user, role: 'ADMIN' } } }));
  renderAuthApp('/admin');
  expect(
    await screen.findByRole('heading', { name: 'Tu comunidad, en perspectiva' }),
  ).toBeVisible();
});

test('401 protegido limpia estado; 403 mantiene la sesión existente', async () => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { user } }));
  vi.stubGlobal('fetch', fetchMock);
  renderAuthApp('/account');
  await screen.findByRole('heading', { name: 'Mi cuenta' });
  fetchMock.mockResolvedValueOnce(
    jsonResponse({ error: { code: 'FORBIDDEN', message: 'Sin permiso' } }, 403),
  );
  await expect(requestJson('protected')).rejects.toMatchObject({ status: 403 });
  expect(screen.getByRole('heading', { name: 'Mi cuenta' })).toBeVisible();
  fetchMock.mockResolvedValueOnce(unauthorized());
  await expect(requestJson('protected')).rejects.toMatchObject({ status: 401 });
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible());
});

test('retornos: permite ADMIN solo con rol confirmado y rechaza destinos externos/ambiguos', () => {
  expect(safeReturnPath('/admin', 'ADMIN')).toBe('/admin');
  expect(safeReturnPath('/admin/profile', 'ADMIN')).toBe('/admin/profile');
  expect(safeReturnPath('/admin/profile/security', 'ADMIN')).toBe('/admin/profile/security');
  expect(safeReturnPath('/admin/profile', 'USER')).toBe('/student');
  for (const path of [
    'https://evil.invalid',
    '//evil.invalid',
    '/\\evil.invalid',
    '/admin',
    '/account?next=evil',
    '%2f%2fhost',
  ]) {
    expect(safeReturnPath(path, 'USER')).toBe('/student');
  }
});
