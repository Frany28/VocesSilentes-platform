import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { user, jsonResponse, unauthorized, renderAuthApp } from './auth-fixture.jsx';
import { registrationSchema } from '../../../Backend/src/modules/auth/auth.validation.js';

test('login: obtiene CSRF, incluye cookies y header, navega al retorno autorizado sin guardar secretos', async () => {
  const fetchMock = vi.fn().mockImplementation((url) => {
    if (url.endsWith('/me')) return Promise.resolve(unauthorized());
    if (url.endsWith('/csrf'))
      return Promise.resolve(jsonResponse({ data: { csrfToken: 'csrf-before' } }));
    return Promise.resolve(
      jsonResponse({ data: { user: { ...user, role: 'ADMIN' }, csrfToken: 'csrf-after' } }),
    );
  });
  vi.stubGlobal('fetch', fetchMock);
  renderAuthApp('/login', { from: '/admin' });
  await userEvent.type(screen.getByLabelText('Correo electrónico'), 'person@example.invalid');
  await userEvent.type(screen.getByLabelText('Contraseña'), 'A lengthy password 123! ');
  await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
  expect(
    await screen.findByRole('heading', { name: 'Tu comunidad, en perspectiva' }),
  ).toBeVisible();
  const [, options] = fetchMock.mock.calls.find(([url]) => url.endsWith('/login'));
  expect(options.credentials).toBe('include');
  expect(options.headers.get('X-CSRF-Token')).toBe('csrf-before');
  expect(JSON.parse(options.body).password).toBe('A lengthy password 123! ');
  expect(localStorage.getItem('token')).toBeNull();
  expect(sessionStorage.length).toBe(0);
});

test('registro: formulario accesible omite apellido vacío y navega al destino seguro', async () => {
  const fetchMock = vi.fn().mockImplementation((url) =>
    Promise.resolve(
      url.endsWith('/me')
        ? unauthorized()
        : jsonResponse({
            data: url.endsWith('/csrf')
              ? { csrfToken: 'csrf-before' }
              : { user, csrfToken: 'csrf-after' },
          }),
    ),
  );
  vi.stubGlobal('fetch', fetchMock);
  renderAuthApp('/register', { from: 'https://evil.invalid' });
  for (const [label, text] of [
    ['Nombre', ' Persona '],
    ['Nombre de usuario', ' PERSON '],
    ['Correo electrónico', ' Person@example.invalid '],
    ['Contraseña', ' A lengthy password 123! 😀 '],
  ]) {
    await userEvent.type(screen.getByLabelText(label), text);
  }
  await userEvent.type(screen.getByLabelText('Apellido (opcional)'), '   ');
  await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
  expect(await screen.findByRole('heading', { name: 'Hola, Persona.' })).toBeVisible();
  const [, options] = fetchMock.mock.calls.find(([url]) => url.endsWith('/register'));
  expect(JSON.parse(options.body)).not.toHaveProperty('lastName');
  expect(JSON.parse(options.body)).not.toHaveProperty('role');
  expect(registrationSchema.parse(JSON.parse(options.body))).toEqual({
    firstName: 'Persona',
    username: 'person',
    email: 'person@example.invalid',
    password: ' A lengthy password 123! 😀 ',
  });
});

test('logout: un fallo de red conserva estado; éxito posterior lo limpia', async () => {
  let fail = true;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url) => {
      if (url.endsWith('/me')) return Promise.resolve(jsonResponse({ data: { user } }));
      if (url.endsWith('/csrf'))
        return Promise.resolve(jsonResponse({ data: { csrfToken: 'csrf' } }));
      return fail
        ? Promise.reject(new TypeError('network'))
        : Promise.resolve(new Response(null, { status: 204 }));
    }),
  );
  renderAuthApp('/account');
  await screen.findByRole('heading', { name: 'Mi cuenta' });
  await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  await userEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: 'Cerrar sesión' }),
  );
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo contactar con la API');
  expect(screen.getByRole('heading', { name: 'Mi cuenta' })).toBeVisible();
  fail = false;
  await userEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: 'Cerrar sesión' }),
  );
  expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
});
