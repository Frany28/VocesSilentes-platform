import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { useAuthSession } from '../features/auth/use-auth-session.js';
import { user } from './auth-fixture.jsx';

test('sesión: descarta un me tardío después del login y del logout', async () => {
  let finishMe;
  const api = {
    me: vi.fn(
      () =>
        new Promise((resolve) => {
          finishMe = resolve;
        }),
    ),
    login: vi.fn().mockResolvedValue(user),
    logout: vi.fn().mockResolvedValue(undefined),
    clearCsrf: vi.fn(),
  };
  const { result } = renderHook(() => useAuthSession(api));
  await act(async () => {
    await result.current.login({});
  });
  expect(result.current.status).toBe('authenticated');
  await act(async () => {
    await result.current.logout();
  });
  await act(async () => {
    finishMe(user);
  });
  expect(result.current.status).toBe('unauthenticated');
  expect(result.current.user).toBeNull();
});

test('sesión: login fallido durante el bootstrap vuelve a comprobar me', async () => {
  const api = {
    me: vi
      .fn()
      .mockImplementationOnce(() => new Promise(() => {}))
      .mockRejectedValueOnce({ status: 401 }),
    login: vi.fn().mockRejectedValue({ status: 401, code: 'INVALID_CREDENTIALS' }),
    clearCsrf: vi.fn(),
  };
  const { result } = renderHook(() => useAuthSession(api));
  await act(async () => {
    await expect(result.current.login({})).rejects.toMatchObject({ status: 401 });
  });
  await waitFor(() => expect(result.current.status).toBe('unauthenticated'));
  expect(api.me).toHaveBeenCalledTimes(2);
});
