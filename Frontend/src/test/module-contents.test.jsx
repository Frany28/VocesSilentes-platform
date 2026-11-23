import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { renderAuthApp, user } from './auth-fixture.jsx';
import { mockCompletedAlphabet, modulePath } from './module-contents-fixture.js';
import { safeReturnPath } from '../features/auth/return-path.js';

vi.mock('../lib/config.js', () => ({
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

test('un abecedario completado abre sus siete lecciones e imágenes, no el resumen guardado', async () => {
  const { snapshot, fetchMock } = mockCompletedAlphabet();
  const view = renderAuthApp('/student/modules');
  const card = await screen.findByRole('article', { name: 'Abecedario LSV' });
  await userEvent.click(within(card).getByRole('button', { name: 'Repasar las señas' }));
  expect(await screen.findByRole('heading', { level: 1, name: 'Abecedario LSV' })).toBeVisible();
  expect(screen.getByRole('progressbar', { name: 'Lecciones completadas' })).toHaveAttribute(
    'value',
    '7',
  );
  expect(screen.getAllByText('✓ Completada')).toHaveLength(7);
  const contents = screen.getByRole('list', { name: 'Lecciones del módulo' });
  expect(within(contents).getAllByRole('heading', { level: 2 })).toHaveLength(7);
  expect(contents.querySelectorAll('img')).toHaveLength(7);
  await userEvent.click(screen.getByRole('link', { name: 'Estudiar lección 1 desde el inicio' }));
  expect(await screen.findByRole('heading', { name: 'Tu objetivo en esta lección' })).toBeVisible();
  expect(screen.queryByRole('region', { name: 'Resumen de la lección' })).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  view.unmount();
  renderAuthApp(`${modulePath}/lessons/${snapshot.modules[0].lessons[0].id}`);
  expect(await screen.findByText('Texto recibido de la API de prueba.')).toBeVisible();
  expect(snapshot.modules[0].lessons.every((lesson) => lesson.status === 'COMPLETED')).toBe(true);
  expect(fetchMock.mock.calls.every(([, options]) => (options.method ?? 'GET') === 'GET')).toBe(
    true,
  );
});

test('la microclase vuelve a abrirse desde un resumen sin reproducirse ni activar cámara al navegar', async () => {
  const { snapshot, fetchMock } = mockCompletedAlphabet();
  const camera = vi.fn();
  vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia: camera } });
  const view = renderAuthApp(modulePath);
  await userEvent.click(await screen.findByRole('link', { name: 'Ver microclase de las vocales' }));
  expect(
    await screen.findByRole('heading', { name: 'Las cinco vocales, en una microclase' }),
  ).toBeVisible();
  expect(await screen.findByRole('button', { name: 'Comenzar la microclase' })).toBeVisible();
  expect(camera).not.toHaveBeenCalled();
  const lesson = snapshot.modules[0].lessons[1];
  const saved = JSON.parse(
    localStorage.getItem(`vs:lesson-journey:${user.id}:${snapshot.modules[0].id}:${lesson.id}`),
  );
  expect(saved.position).toBe('microclass');
  expect(saved.completed).toEqual([]);
  view.unmount();
  renderAuthApp(`${modulePath}/lessons/${lesson.id}`);
  expect(
    await screen.findByRole('heading', { name: 'Las cinco vocales, en una microclase' }),
  ).toBeVisible();
  expect(fetchMock.mock.calls.every(([, options]) => (options.method ?? 'GET') === 'GET')).toBe(
    true,
  );
});

test('el índice admite retorno protegido por UUID, rechaza queries y no sustituye módulos ausentes', async () => {
  mockCompletedAlphabet();
  expect(safeReturnPath(modulePath, 'USER')).toBe(modulePath);
  expect(safeReturnPath(modulePath, 'ADMIN')).toBe('/admin');
  expect(safeReturnPath(`${modulePath}?next=/admin`, 'USER')).toBe('/student');
  renderAuthApp('/student/modules/a1000001-0000-4000-8000-000000000099');
  expect(await screen.findByText('Módulo no disponible')).toBeVisible();
  expect(screen.queryByRole('list', { name: 'Lecciones del módulo' })).toBeNull();
});

test('la sugerencia del inicio sigue abriendo la lección concreta, con acceso al índice de repaso', async () => {
  const { snapshot } = mockCompletedAlphabet();
  snapshot.modules[0].lessons[0].status = 'NOT_STARTED';
  renderAuthApp('/student');
  await userEvent.click(await screen.findByRole('button', { name: /Lección de prueba 1/ }));
  expect(await screen.findByRole('region', { name: 'Resumen de la lección' })).toBeVisible();
  await userEvent.click(screen.getByRole('link', { name: 'Ver todas las lecciones' }));
  expect(await screen.findByRole('list', { name: 'Lecciones del módulo' })).toBeVisible();
});
