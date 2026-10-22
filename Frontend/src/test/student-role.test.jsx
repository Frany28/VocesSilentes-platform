import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { expect, test, vi } from 'vitest';
import { user, jsonResponse, unauthorized, renderAuthApp } from './auth-fixture.jsx';
import { AuthProvider } from '../features/auth/AuthProvider.jsx';
import { useAuth } from '../features/auth/use-auth.js';
import { ThemeProvider } from '../app/ThemeProvider.jsx';
import { App } from '../app/App.jsx';

const paths = [
  '/student',
  '/student/modules',
  '/student/practice',
  '/student/progress',
  '/student/profile',
  '/student/profile/security',
  '/student/reports/new',
];

test('ADMIN y un rol desconocido no ven ninguna pantalla Student; USER conserva acceso', async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  for (const role of ['ADMIN', 'UNKNOWN'])
    for (const path of paths) {
      fetchMock.mockResolvedValue(jsonResponse({ data: { user: { ...user, role } } }));
      const view = renderAuthApp(path);
      expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso');
      expect(screen.queryByRole('navigation', { name: 'Navegación de estudiante' })).toBeNull();
      view.unmount();
    }
  fetchMock.mockResolvedValue(jsonResponse({ data: { user } }));
  renderAuthApp('/student/profile');
  expect(await screen.findByRole('heading', { name: 'Tu perfil, a tu manera.' })).toBeVisible();
});

test('USER y ADMIN comparten account y ninguna ruta Student admite una sesión inválida', async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  for (const role of ['USER', 'ADMIN']) {
    fetchMock.mockResolvedValue(jsonResponse({ data: { user: { ...user, role } } }));
    const view = renderAuthApp('/account');
    expect(await screen.findByRole('heading', { name: 'Mi cuenta' })).toBeVisible();
    view.unmount();
  }
  fetchMock.mockResolvedValue(unauthorized());
  for (const path of paths) {
    const view = renderAuthApp(path);
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
    view.unmount();
  }
});

test('fallo de red en Student conserva estado de error y permite comprobar sesión otra vez', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockRejectedValueOnce(new TypeError('network'))
      .mockResolvedValue(jsonResponse({ data: { user } })),
  );
  renderAuthApp('/student/profile');
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo comprobar la sesión');
  expect(screen.queryByRole('heading', { name: 'Inicia sesión' })).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByRole('heading', { name: 'Tu perfil, a tu manera.' })).toBeVisible();
});

/**
 * Control de prueba para actualizar el proveedor real, sin cambiar su contrato.
 * @returns {import('react').ReactElement} Acción explícita para comprobar cambios de rol.
 */
function RefreshSession() {
  const auth = useAuth();
  return <button onClick={auth.refresh}>Actualizar sesión de prueba</button>;
}

test('actualizar me respeta cambio de USER a ADMIN sin volver a conceder acceso Student', async () => {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { user } }));
  vi.stubGlobal('fetch', fetchMock);
  render(
    <MemoryRouter initialEntries={['/student/profile']}>
      <ThemeProvider>
        <AuthProvider>
          <RefreshSession />
          <App />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
  expect(await screen.findByRole('heading', { name: 'Tu perfil, a tu manera.' })).toBeVisible();
  fetchMock.mockResolvedValue(jsonResponse({ data: { user: { ...user, role: 'ADMIN' } } }));
  await userEvent.click(screen.getByRole('button', { name: 'Actualizar sesión de prueba' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso');
  expect(screen.queryByRole('heading', { name: 'Tu perfil, a tu manera.' })).toBeNull();
});
