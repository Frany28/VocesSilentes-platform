import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { user, jsonResponse, unauthorized, renderAuthApp } from './auth-fixture.jsx';

test.each([
  [
    'INVALID_CREDENTIALS',
    401,
    'No pudimos iniciar sesión',
    'El correo o la contraseña son incorrectos.',
  ],
  ['NETWORK_ERROR', 0, 'Sin conexión', 'Comprueba tu conexión'],
  ['AUTH_UNAVAILABLE', 503, 'No pudimos iniciar sesión', 'El servicio no está disponible'],
  ['CSRF_INVALID', 403, 'Vuelve a intentarlo', 'La protección del formulario ha caducado'],
])(
  'error %s: mensaje controlado, campos corregibles y reintento con estado real',
  async (code, status, title, message) => {
    let fail = true;
    const fetchMock = vi.fn().mockImplementation((url) => {
      if (url.endsWith('/me')) return Promise.resolve(unauthorized());
      if (url.endsWith('/csrf'))
        return Promise.resolve(jsonResponse({ data: { csrfToken: 'csrf-test' } }));
      if (!fail) return Promise.resolve(jsonResponse({ data: { user, csrfToken: 'rotated' } }));
      return status === 0
        ? Promise.reject(new TypeError('network'))
        : Promise.resolve(
            jsonResponse({ error: { code, message: 'No mostrar datos internos' } }, status),
          );
    });
    vi.stubGlobal('fetch', fetchMock);
    renderAuthApp('/login', { from: '/admin' });
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'person@example.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'a');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(title);
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(screen.getByRole('alert')).not.toHaveTextContent('No mostrar datos internos');
    expect(screen.getByLabelText('Contraseña')).toBeEnabled();
    fail = false;
    await userEvent.type(screen.getByLabelText('Contraseña'), 'b');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole('heading', { name: 'Mi cuenta' })).toBeVisible();
    if (code === 'CSRF_INVALID') {
      expect(fetchMock.mock.calls.filter(([url]) => url.endsWith('/csrf'))).toHaveLength(2);
    }
  },
);

test('429 usa Retry-After: espera sin repetir automáticamente ni permitir duplicados', async () => {
  vi.useFakeTimers();
  try {
    const response = jsonResponse(
      { error: { code: 'RATE_LIMITED', message: 'Límite alcanzado' } },
      429,
    );
    response.headers.set('Retry-After', '2');
    const fetchMock = vi
      .fn()
      .mockImplementation((url) =>
        Promise.resolve(
          url.endsWith('/me')
            ? unauthorized()
            : url.endsWith('/csrf')
              ? jsonResponse({ data: { csrfToken: 'csrf-test' } })
              : response.clone(),
        ),
      );
    vi.stubGlobal('fetch', fetchMock);
    renderAuthApp('/login');
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'person@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'a' } });
    const form = screen.getByRole('form', { name: 'Inicia sesión' });
    await act(async () => fireEvent.submit(form));
    expect(screen.getByRole('alert')).toHaveTextContent('Demasiados intentos');
    expect(screen.getByRole('button', { name: 'Reintentar en 2 s' })).toBeDisabled();
    await act(async () => {
      fireEvent.submit(form);
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled();
    expect(fetchMock.mock.calls.filter(([url]) => url.endsWith('/login'))).toHaveLength(1);
  } finally {
    vi.useRealTimers();
  }
});
