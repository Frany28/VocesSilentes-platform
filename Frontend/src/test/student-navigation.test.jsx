import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { user, jsonResponse, unauthorized, renderAuthApp } from './auth-fixture.jsx';

test('protege acceso directo y vuelve a Mis módulos tras login con sesión real del proveedor', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url) =>
      Promise.resolve(
        url.endsWith('/me')
          ? unauthorized()
          : jsonResponse({
              data: url.endsWith('/csrf')
                ? { csrfToken: 'test-csrf' }
                : { user, csrfToken: 'test-rotated' },
            }),
      ),
    ),
  );
  renderAuthApp('/student/modules');
  expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
  fireEvent.change(screen.getByLabelText('Correo electrónico'), {
    target: { value: 'person@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'valid password' } });
  fireEvent.submit(screen.getByRole('form', { name: 'Inicia sesión' }));
  expect(await screen.findByRole('heading', { name: 'Mis módulos' })).toBeVisible();
  expect(await screen.findByRole('article', { name: 'Saludos y presentaciones' })).toBeVisible();
});

test('navega entre páginas y filtra por nombre/estado, sin abrir funciones pendientes', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { user } })));
  renderAuthApp('/student');
  expect(await screen.findByRole('heading', { name: 'Hola, Persona.' })).toBeVisible();
  await screen.findByRole('article', { name: 'Saludos y presentaciones' });
  await userEvent.click(screen.getByRole('link', { name: 'Mis módulos' }));
  const field = await screen.findByRole('searchbox', { name: 'Buscar módulo' });
  await userEvent.type(field, 'SALUDOS');
  expect(screen.getAllByRole('article')).toHaveLength(1);
  await userEvent.click(screen.getByRole('button', { name: 'Bloqueados · 2' }));
  expect(screen.getByRole('heading', { name: 'No encontramos ese módulo' })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Ver todos los módulos' }));
  expect(screen.getAllByRole('article')).toHaveLength(3);
  await userEvent.click(screen.getByRole('button', { name: 'En progreso · 1' }));
  expect(screen.getAllByRole('article')).toHaveLength(1);
  await userEvent.click(
    within(screen.getByRole('article')).getByRole('button', { name: 'Seguir aprendiendo' }),
  );
  expect(screen.getByText('Saludos y presentaciones: disponible próximamente.')).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Mis módulos' })).toBeVisible();
  await userEvent.click(
    within(screen.getByRole('navigation', { name: 'Navegación de estudiante' })).getByRole(
      'button',
      { name: 'Practicar, próximamente' },
    ),
  );
  expect(screen.getByText('Practicar: disponible próximamente.')).toBeVisible();
});

test('logout preserva sesión ante fallo, evita duplicados y usa cookies/CSRF; éxito vuelve a login', async () => {
  let finish;
  const fetchMock = vi.fn().mockImplementation((url) => {
    if (url.endsWith('/me')) return Promise.resolve(jsonResponse({ data: { user } }));
    if (url.endsWith('/csrf'))
      return Promise.resolve(jsonResponse({ data: { csrfToken: 'test-csrf' } }));
    return new Promise((resolve, reject) => {
      finish = { resolve, reject };
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  renderAuthApp('/student');
  await screen.findByRole('heading', { name: 'Hola, Persona.' });
  const logout = screen.getAllByRole('button', { name: 'Cerrar sesión' })[0];
  fireEvent.click(logout);
  fireEvent.click(logout);
  await waitFor(() => expect(finish).toBeDefined());
  expect(fetchMock.mock.calls.filter(([url]) => url.endsWith('/logout'))).toHaveLength(1);
  const options = fetchMock.mock.calls.find(([url]) => url.endsWith('/logout'))[1];
  expect(options.credentials).toBe('include');
  expect(options.headers.get('X-CSRF-Token')).toBe('test-csrf');
  finish.reject(new TypeError('network'));
  expect(await screen.findByText(/No pudimos cerrar la sesión/)).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Hola, Persona.' })).toBeVisible();
  fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar sesión' })[0]);
  await waitFor(() =>
    expect(fetchMock.mock.calls.filter(([url]) => url.endsWith('/logout'))).toHaveLength(2),
  );
  finish.resolve(new Response(null, { status: 204 }));
  expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
});
