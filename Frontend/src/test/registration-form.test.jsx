import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { jsonResponse, unauthorized, renderAuthApp } from './auth-fixture.jsx';

test('registro valida antes de pedir CSRF y corrige errores con foco y descripciones accesibles', async () => {
  const fetchMock = vi.fn().mockResolvedValue(unauthorized());
  vi.stubGlobal('fetch', fetchMock);
  renderAuthApp('/register');
  await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
  const name = screen.getByLabelText('Nombre');
  expect(name).toHaveFocus();
  expect(name).toHaveAccessibleDescription('Introduce tu nombre.');
  expect(screen.getByLabelText('Apellido (opcional)')).not.toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByLabelText('Nombre de usuario')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByLabelText('Contraseña')).toHaveAttribute('aria-invalid', 'true');
  await userEvent.type(name, 'Persona');
  expect(name).not.toHaveAttribute('aria-invalid', 'true');
  expect(fetchMock.mock.calls.every(([url]) => url.endsWith('/me'))).toBe(true);
});

test('registro no duplica el envío, bloquea controles en carga y muestra el conflicto genérico', async () => {
  let finish;
  const fetchMock = vi.fn().mockImplementation((url) => {
    if (url.endsWith('/me')) return Promise.resolve(unauthorized());
    if (url.endsWith('/csrf'))
      return Promise.resolve(jsonResponse({ data: { csrfToken: 'csrf' } }));
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  renderAuthApp('/register');
  for (const [label, value] of [
    ['Nombre', 'Persona'],
    ['Nombre de usuario', 'persona'],
    ['Correo electrónico', 'person@example.com'],
    ['Contraseña', 'A lengthy password 123!'],
  ])
    await userEvent.type(screen.getByLabelText(label), value);
  const form = screen.getByRole('form', { name: 'Crea tu cuenta' });
  fireEvent.submit(form);
  fireEvent.submit(form);
  await waitFor(() => expect(finish).toBeTypeOf('function'));
  expect(fetchMock.mock.calls.filter(([url]) => url.endsWith('/register'))).toHaveLength(1);
  expect(screen.getByLabelText('Nombre')).toBeDisabled();
  expect(screen.getByLabelText('Contraseña')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Creando tu cuenta…' })).toBeDisabled();
  await act(async () =>
    finish(
      jsonResponse(
        {
          error: { code: 'ACCOUNT_UNAVAILABLE', message: 'Detalle privado del backend' },
        },
        409,
      ),
    ),
  );
  expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos crear tu cuenta');
  expect(screen.getByRole('alert')).not.toHaveTextContent('Detalle privado');
  expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
  await userEvent.type(screen.getByLabelText('Nombre de usuario'), '_2');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
