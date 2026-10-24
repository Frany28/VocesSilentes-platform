import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { user, jsonResponse, renderAuthApp } from './auth-fixture.jsx';

export const account = {
  ...user,
  id: '12345678-1234-4234-8234-123456789012',
  isActive: true,
  isDeleted: false,
  failedLoginAttempts: 0,
  createdAt: '2026-10-09T12:00:00Z',
  updatedAt: '2026-10-09T12:00:00Z',
};
/**
 * Monta admin con auth real del proveedor y transporte controlado para pruebas del frontend.
 * @param {string} path Ruta inicial.
 * @param {Function} [handler] Respuestas específicas de usuarios; no acredita persistencia SQL.
 * @returns {object} view y fetchMock.
 */
export function renderAdmin(
  path,
  handler = (url) =>
    jsonResponse({
      data: url.endsWith('/admin/summary')
        ? {
            users: 1,
            activeUsers: 1,
            inactiveUsers: 0,
            pendingReports: 0,
            resolvedReports: 0,
            reports: [],
          }
        : url.includes('/reports?')
          ? { reports: [], total: 0, page: 1, pages: 1 }
          : url.includes('/admin/users?')
            ? { items: [account], total: 1, page: 1, pageSize: 3, pages: 1 }
            : { user: account },
    }),
) {
  const fetchMock = vi.fn().mockImplementation((url, options) => {
    if (url.endsWith('/auth/me'))
      return Promise.resolve(jsonResponse({ data: { user: { ...user, role: 'ADMIN' } } }));
    if (url.endsWith('/auth/csrf'))
      return Promise.resolve(jsonResponse({ data: { csrfToken: 'test-csrf' } }));
    return Promise.resolve(handler(url, options));
  });
  vi.stubGlobal('fetch', fetchMock);
  return { view: renderAuthApp(path), fetchMock };
}
/**
 * Rellena el formulario real sin gestores de contraseñas ni almacenamiento de credenciales.
 * @param {boolean} [creating] Si introduce la contraseña de prueba del formulario.
 * @returns {void} Eventos de campo controlados.
 */
export function fillAdminForm(creating = true) {
  for (const [label, value] of [
    ['Nombre', 'Persona'],
    ['Nombre de usuario', 'persona_admin'],
    ['Correo', 'person@example.invalid'],
    ...(creating ? [['Contraseña', 'Una frase de prueba 123!']] : []),
  ])
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
}
