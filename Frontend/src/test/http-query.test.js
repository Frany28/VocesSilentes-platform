import { expect, test, vi } from 'vitest';
import { requestJson } from '../lib/http.js';

test('query codificada conserva origen/ruta y no se filtra a opciones fetch', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: {} })));
  vi.stubGlobal('fetch', fetchMock);
  const value = 'https://example.invalid/../?role=ADMIN&x=#á';
  await requestJson('admin/users', { query: new URLSearchParams({ q: value }) });
  const [url, options] = fetchMock.mock.calls[0];
  expect(new URL(url).origin).toBe('http://localhost:3000');
  expect(new URL(url).pathname).toBe('/api/admin/users');
  expect(new URL(url).searchParams.get('q')).toBe(value);
  expect(new URL(url).searchParams.has('role')).toBe(false);
  expect(options).not.toHaveProperty('query');
});
