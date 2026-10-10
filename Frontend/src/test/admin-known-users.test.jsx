import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderAdmin, account } from './admin-fixture.jsx';
import { jsonResponse } from './auth-fixture.jsx';

const key = 'vs-admin-users:test-user';
const missing = '22345678-1234-4234-8234-123456789012';

test('cuentas recordadas: un 404 olvida el ID y no bloquea las demás cuentas reales', async () => {
  localStorage.setItem(key, JSON.stringify([missing, account.id]));
  renderAdmin('/admin/users', (url) =>
    url.endsWith(missing)
      ? jsonResponse({ error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' } }, 404)
      : jsonResponse({ data: { user: account } }),
  );
  expect(await screen.findByText('Persona')).toBeVisible();
  expect(localStorage.getItem(key)).toBe(JSON.stringify([account.id]));
});

test('cuentas recordadas: otros errores se muestran sin sustituirse por demo y conservan IDs', async () => {
  localStorage.setItem(key, JSON.stringify([account.id]));
  renderAdmin('/admin/users', () =>
    jsonResponse({ error: { code: 'INTERNAL_ERROR', message: 'Error interno' } }, 500),
  );
  expect(await screen.findByText('No pudimos cargar usuarios')).toBeVisible();
  expect(screen.queryByText('Ana Pérez')).not.toBeInTheDocument();
  expect(localStorage.getItem(key)).toBe(JSON.stringify([account.id]));
});
