import { expect, test } from 'vitest';
import { moduleProgress, filterModules } from '../features/student/data/module-progress.js';
import { readDemoSnapshot } from '../features/student/data/student-demo.js';
import { safeReturnPath } from '../features/auth/return-path.js';

test('progreso usa únicamente lecciones publicadas y cero lecciones nunca está completado', () => {
  const module = {
    access: 'available',
    lessons: [
      { publicationStatus: 'PUBLISHED', status: 'COMPLETED' },
      { publicationStatus: 'PUBLISHED', status: 'IN_PROGRESS' },
      { publicationStatus: 'DRAFT', status: 'COMPLETED' },
    ],
  };
  expect(moduleProgress(module)).toEqual({
    total: 2,
    completed: 1,
    percent: 50,
    state: 'progress',
  });
  expect(moduleProgress({ access: 'available', lessons: [] })).toMatchObject({
    percent: 0,
    state: 'available',
  });
  expect(moduleProgress({ ...module, access: 'locked' }).state).toBe('locked');
});

test('escenarios declarados conservan origen demo, no escriben datos y sus estados se derivan de lecciones', async () => {
  for (const [scenario, state, percent] of [
    ['first', 'available', 0],
    ['progress', 'progress', 60],
    ['completed', 'completed', 100],
  ]) {
    const snapshot = await readDemoSnapshot(new AbortController().signal, scenario);
    expect(snapshot.source).toBe('demo');
    expect(moduleProgress(snapshot.modules[0])).toMatchObject({ state, percent });
    expect(filterModules(snapshot.modules, '  PRESENTACIÓNES ', 'all')).toHaveLength(1);
    expect(filterModules(snapshot.modules, 'Astronomía', 'all')).toEqual([]);
    expect(filterModules(snapshot.modules, '', 'locked')).toHaveLength(
      scenario === 'completed' ? 1 : 2,
    );
  }
});

test('retornos publicados de Student se conservan sin aceptar query, rutas externas ni acceso ADMIN', () => {
  for (const path of ['/student', '/student/modules'])
    expect(safeReturnPath(path, 'USER')).toBe(path);
  for (const path of ['/student?next=x', '/student/modules/../admin', '//host', '/admin']) {
    expect(safeReturnPath(path, 'USER')).toBe('/student');
  }
});
