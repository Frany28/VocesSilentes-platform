import { render } from '@testing-library/react';
import { MemoryRouter, parsePath } from 'react-router';
import { AuthProvider } from '../features/auth/AuthProvider.jsx';
import { ThemeProvider } from '../app/ThemeProvider.jsx';
import { App } from '../app/App.jsx';

export const user = Object.freeze({
  id: 'test-user',
  firstName: 'Persona',
  lastName: null,
  email: 'person@example.invalid',
  username: 'person',
  role: 'USER',
  emailVerified: false,
});

/**
 * Crea una respuesta de transporte simulada; no demuestra integración del backend.
 * @param {object} payload Contrato JSON de la API.
 * @param {number} [status] Estado HTTP.
 * @returns {Response} Respuesta para fetch simulado.
 */
export function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status });
}

/**
 * Simula sesión ausente con el código que invalida el proveedor.
 * @returns {Response} HTTP 401 para pruebas frontend.
 */
export function unauthorized() {
  return jsonResponse({ error: { code: 'UNAUTHENTICATED', message: 'Sesión requerida' } }, 401);
}

/**
 * Monta router/proveedores reales con una ruta inicial y estado de retorno opcional.
 * @param {string} path Ruta inicial.
 * @param {object | undefined} [state] Estado del router.
 * @returns {object} Utilidades Testing Library.
 */
export function renderAuthApp(path, state) {
  return render(
    <MemoryRouter initialEntries={[{ ...parsePath(path), state }]}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}
