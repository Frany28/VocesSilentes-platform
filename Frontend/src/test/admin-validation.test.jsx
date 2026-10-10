import { fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderAdmin, fillAdminForm } from './admin-fixture.jsx';
import { jsonResponse } from './auth-fixture.jsx';

test.each([
  ['abcd123!', 'Incluye al menos una letra mayúscula.'],
  ['Abcd1234', 'Incluye al menos un carácter especial, como !, @ o #.'],
  ['Abcd123 ', 'Incluye al menos un carácter especial, como !, @ o #.'],
])('crear: rechaza %s antes de enviar y explica el requisito', async (password, message) => {
  const { fetchMock } = renderAdmin('/admin/users/new');
  await screen.findByRole('heading', { name: 'Crear usuario' });
  expect(screen.getByText(/8–128 caracteres, una mayúscula y un carácter especial/)).toBeVisible();
  fillAdminForm();
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }));
  expect(screen.getByText(message)).toBeVisible();
  expect(screen.getByLabelText('Contraseña')).toHaveAttribute('aria-invalid', 'true');
  expect(fetchMock.mock.calls.some(([, options]) => options.method === 'POST')).toBe(false);
});

test.each([
  ['EMAIL_IN_USE', true, false],
  ['USERNAME_IN_USE', false, true],
  ['ACCOUNT_IDENTIFIERS_IN_USE', true, true],
])('crear: %s identifica exclusivamente los campos duplicados', async (code, email, username) => {
  renderAdmin('/admin/users/new', () =>
    jsonResponse({ error: { code, message: 'Conflicto de cuenta' } }, 409),
  );
  await screen.findByRole('heading', { name: 'Crear usuario' });
  fillAdminForm();
  fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }));
  await screen.findByText(/Conflicto de cuenta/);
  expect(screen.queryByText('Este correo ya está registrado.') !== null).toBe(email);
  expect(screen.queryByText('Este nombre de usuario ya existe.') !== null).toBe(username);
  expect(screen.getByLabelText('Correo').getAttribute('aria-invalid') === 'true').toBe(email);
  expect(screen.getByLabelText('Nombre de usuario').getAttribute('aria-invalid') === 'true').toBe(
    username,
  );
  expect(screen.getByLabelText('Nombre de usuario')).toHaveValue('persona_admin');
  expect(screen.queryByRole('heading', { name: 'Cuenta guardada' })).not.toBeInTheDocument();
});
