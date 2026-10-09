import { expect, test, vi } from 'vitest';
import { requestJson } from '../lib/http.js';
import { onSessionInvalidated } from '../lib/session-events.js';

test('HTTP: un 401 tardío de una petición cancelada no invalida una sesión posterior', async () => {
  let finish;
  const response = new Response(null, { status: 401 });
  vi.spyOn(response, 'json').mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
  const invalidated = vi.fn();
  const unsubscribe = onSessionInvalidated(invalidated);
  const controller = new AbortController();
  try {
    const pending = requestJson('auth/me', { signal: controller.signal });
    await Promise.resolve();
    controller.abort();
    finish({ error: { code: 'UNAUTHENTICATED', message: 'Sesión anterior inválida' } });
    await expect(pending).rejects.toMatchObject({ code: 'REQUEST_ABORTED' });
    expect(invalidated).not.toHaveBeenCalled();
  } finally {
    unsubscribe();
  }
});
