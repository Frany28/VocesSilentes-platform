import { expect, test, vi } from 'vitest';
import { requestJson } from '../lib/http.js';
import { parsePublicConfig } from '../lib/config.js';

test('usa la base configurada y transmite la señal de cancelación', async () => {
  const controller = new AbortController();
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify({ data: { status: 'ok' } })));
  vi.stubGlobal('fetch', fetchMock);
  expect(await requestJson('/health', { signal: controller.signal })).toEqual({
    data: { status: 'ok' },
  });
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toBe('http://localhost:3000/api/health');
  expect(options.signal).toBe(controller.signal);
  expect(options.credentials).toBe('include');
  expect(options.headers.get('Accept')).toBe('application/json');
});

test('conserva el contrato de errores HTTP del backend', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' },
        }),
        { status: 404 },
      ),
    ),
  );
  await expect(requestJson('missing')).rejects.toMatchObject({
    name: 'ApiError',
    code: 'NOT_FOUND',
    status: 404,
  });
});

test('convierte fallos de red sin filtrar mensajes internos', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('secret-marker')));
  await expect(requestJson('health')).rejects.toMatchObject({
    code: 'NETWORK_ERROR',
    message: 'No se pudo contactar con la API',
  });
});

test('cancelar una petición produce un error identificable', async () => {
  const controller = new AbortController();
  controller.abort();
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Cancelled', 'AbortError')));
  await expect(requestJson('health', { signal: controller.signal })).rejects.toMatchObject({
    code: 'REQUEST_ABORTED',
    status: 0,
  });
});

test('rechaza respuestas ilegibles y admite respuestas vacías 204', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(new Response('<html>'))
    .mockResolvedValueOnce(new Response(null, { status: 204 }));
  vi.stubGlobal('fetch', fetchMock);
  await expect(requestJson('health')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  await expect(requestJson('health')).resolves.toBeUndefined();
});

test('no permite rutas que salgan de la API configurada', async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  for (const path of ['https://example.invalid', '../private', '//example.invalid']) {
    await expect(requestJson(path)).rejects.toMatchObject({ code: 'INVALID_PATH' });
  }
  expect(fetchMock).not.toHaveBeenCalled();
});

test('valida configuración pública sin mostrar credenciales en el error', () => {
  expect(parsePublicConfig({ VITE_API_URL: 'https://example.invalid/api/' })).toEqual({
    apiUrl: 'https://example.invalid/api',
  });
  for (const url of ['invalid-url', 'file:///private', 'https://user:secret@example.invalid/api']) {
    expect(() => parsePublicConfig({ VITE_API_URL: url })).toThrow(
      'Configuración pública inválida: VITE_API_URL',
    );
  }
});
