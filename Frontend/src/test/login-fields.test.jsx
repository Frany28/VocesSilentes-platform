import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { renderAuthApp, unauthorized } from './auth-fixture.jsx';

test('vacíos y correo inválido: valida localmente, asocia mensajes, enfoca y permite corregir', async () => {
  const fetchMock = vi.fn().mockResolvedValue(unauthorized());
  vi.stubGlobal('fetch', fetchMock);
  renderAuthApp('/login');
  const email = screen.getByLabelText('Correo electrónico');
  const password = screen.getByLabelText('Contraseña');
  await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
  expect(email).toHaveFocus();
  expect(email).toHaveAttribute('aria-invalid', 'true');
  expect(email).toHaveAccessibleDescription('Introduce tu correo electrónico.');
  expect(password).toHaveAccessibleDescription('Introduce tu contraseña.');
  expect(screen.getByRole('status')).toHaveTextContent('Introduce tu correo electrónico.');
  await userEvent.type(email, 'ana@correo');
  await userEvent.type(password, 'a');
  await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
  expect(email).toHaveAccessibleDescription('Escribe un correo válido, como nombre@correo.com.');
  expect(password).not.toHaveAttribute('aria-invalid', 'true');
  await userEvent.type(email, '.com');
  expect(email).not.toHaveAttribute('aria-invalid', 'true');
  expect(fetchMock.mock.calls.every(([url]) => url.endsWith('/me'))).toBe(true);
});

test('contraseña usa autocomplete, conserva su valor al mostrar/ocultar y Enter valida el formulario', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(unauthorized()));
  renderAuthApp('/login');
  const email = screen.getByLabelText('Correo electrónico');
  const password = screen.getByLabelText('Contraseña');
  expect(email).toHaveAttribute('autocomplete', 'username');
  expect(password).toHaveAttribute('autocomplete', 'current-password');
  await userEvent.type(password, ' a ');
  await userEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
  expect(password).toHaveAttribute('type', 'text');
  expect(password).toHaveValue(' a ');
  await userEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
  expect(password).toHaveAttribute('type', 'password');
  await userEvent.click(email);
  await userEvent.keyboard('{Enter}');
  expect(email).toHaveAccessibleDescription('Introduce tu correo electrónico.');
  fireEvent.change(email, { target: { value: 'person@example.com' } });
  expect(email).not.toHaveAttribute('aria-invalid', 'true');
});
