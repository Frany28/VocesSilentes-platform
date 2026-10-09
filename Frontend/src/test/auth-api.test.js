import { expect, test, vi } from 'vitest';
import { createAuthApi } from '../features/auth/auth.api.js';
import { user, jsonResponse } from './auth-fixture.jsx';

test('cliente CSRF: conserva señal y renueva en el siguiente intento tras CSRF_INVALID', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(jsonResponse({ data: { csrfToken: 'old' } }))
    .mockResolvedValueOnce(
      jsonResponse({ error: { code: 'CSRF_INVALID', message: 'Reintenta' } }, 403),
    )
    .mockResolvedValueOnce(jsonResponse({ data: { csrfToken: 'fresh' } }))
    .mockResolvedValueOnce(jsonResponse({ data: { user, csrfToken: 'after-login' } }));
  vi.stubGlobal('fetch', fetchMock);
  const api = createAuthApi();
  const controller = new AbortController();
  const input = { email: 'person@example.invalid', password: 'A lengthy password' };
  await expect(api.login(input, controller.signal)).rejects.toMatchObject({ code: 'CSRF_INVALID' });
  expect(await api.login(input, controller.signal)).toEqual(user);
  expect(fetchMock.mock.calls[3][1].headers.get('X-CSRF-Token')).toBe('fresh');
  expect(fetchMock.mock.calls.every(([, options]) => options.signal === controller.signal)).toBe(
    true,
  );
});
