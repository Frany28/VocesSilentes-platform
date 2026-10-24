import { expect, test, vi } from 'vitest';
import { parsePublicConfig } from '../lib/config.js';

test('demo requiere true explícito en producción; false prevalece también en desarrollo', () => {
  expect(parsePublicConfig({ PROD: true }).studentDemo).toBe(false);
  expect(parsePublicConfig({ PROD: true, VITE_STUDENT_DEMO: 'true' }).studentDemo).toBe(true);
  expect(parsePublicConfig({ DEV: true }).studentDemo).toBe(false);
  expect(parsePublicConfig({ DEV: true, VITE_STUDENT_DEMO: 'false' }).studentDemo).toBe(false);
  for (const value of ['1', 'TRUE', 'yes', '', true])
    expect(() => parsePublicConfig({ VITE_STUDENT_DEMO: value })).toThrow('VITE_STUDENT_DEMO');
});

test('adaptador consulta API real con demo deshabilitada y respeta cancelación', async () => {
  vi.stubEnv('VITE_STUDENT_DEMO', 'false');
  vi.resetModules();
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        data: { source: 'api', modules: [] },
      }),
    ),
  );
  vi.stubGlobal('fetch', fetchMock);
  const { readStudentSnapshot } = await import('../features/student/data/student-adapter.js');
  await expect(readStudentSnapshot(new AbortController().signal)).resolves.toEqual({
    source: 'api',
    modules: [],
  });
  expect(fetchMock.mock.calls[0][0]).toMatch(/\/learning$/);
  const request = new AbortController();
  request.abort();
  await expect(readStudentSnapshot(request.signal)).rejects.toHaveProperty('name', 'AbortError');
  vi.unstubAllEnvs();
  vi.resetModules();
});

test('adaptador habilitado en producción usa demo identificada sin peticiones HTTP', async () => {
  vi.stubEnv('DEV', false);
  vi.stubEnv('PROD', true);
  vi.stubEnv('VITE_STUDENT_DEMO', 'true');
  vi.resetModules();
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  const { readStudentSnapshot } = await import('../features/student/data/student-adapter.js');
  const snapshot = await readStudentSnapshot(new AbortController().signal);
  expect(snapshot.source).toBe('demo');
  expect(snapshot.modules).toHaveLength(3);
  expect(fetchMock).not.toHaveBeenCalled();
  vi.unstubAllEnvs();
  vi.resetModules();
});
