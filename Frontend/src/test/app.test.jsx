import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { expect, test, vi, beforeEach } from 'vitest';
import { App } from '../app/App.jsx';
import { ThemeProvider } from '../app/ThemeProvider.jsx';
import { AuthProvider } from '../features/auth/AuthProvider.jsx';

beforeEach(() =>
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ error: { code: 'UNAUTHENTICATED', message: 'Sesión requerida' } }),
          { status: 401 },
        ),
      ),
  ),
);

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

test('el inicio muestra login y permite cambiar y guardar el tema', async () => {
  renderApp();
  expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
  expect(screen.queryByText('El entorno de desarrollo está listo.')).not.toBeInTheDocument();
  const toggle = screen.getByRole('button', { name: 'Tema oscuro' });
  expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await userEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  expect(localStorage.getItem('vocessilentes-theme')).toBe('dark');
});

test('recupera el tema guardado al cargar', () => {
  localStorage.setItem('vocessilentes-theme', 'dark');
  renderApp();
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
});

test('respeta el tema del sistema cuando no existe preferencia guardada', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  renderApp();
  expect(screen.getByRole('button', { name: 'Tema oscuro' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('navega al inicio desde una ruta desconocida', async () => {
  renderApp('/desconocida');
  expect(screen.getByText(/Ruta no encontrada/)).toBeVisible();
  await userEvent.click(screen.getByRole('link', { name: 'Volver al inicio' }));
  expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
});
