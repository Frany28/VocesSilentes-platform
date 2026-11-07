import { screen, render } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import { renderAuthApp, user, jsonResponse } from './auth-fixture.jsx';
import { ManualReference } from '../features/student/recognition/ManualReference.jsx';

vi.mock('../lib/config.js', async (original) => ({
  ...(await original()),
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

const moduleId = 'f930e09e-6b1f-58f8-b9a6-dca05a78310e';
const lessonId = '30000000-0000-4000-8000-000000000002';
const module = {
  id: moduleId,
  title: 'Abecedario LSV',
  order: 1,
  contentKey: 'modulo-01-alfabeto-manual-lsv',
  publicationStatus: 'PUBLISHED',
  access: 'available',
  lessons: [
    {
      id: lessonId,
      title: 'Las cinco vocales: A, E, I, O y U',
      order: 2,
      description: 'Objetivo: estudiar las vocales.\n\nTeoría de la fixture API.',
      publicationStatus: 'PUBLISHED',
      status: 'NOT_STARTED',
      exercises: [],
    },
  ],
};

function serve(modules) {
  const fetchMock = vi.fn(async (url) =>
    jsonResponse({
      data: url.endsWith('/learning') ? { source: 'api', modules } : { user },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

test('enlace antiguo abre la lección de la API por IDs y no el curso estático', async () => {
  const fetchMock = serve([module]);
  renderAuthApp('/student/modules/vowels');
  expect(await screen.findByRole('heading', { name: module.lessons[0].title })).toBeVisible();
  expect(screen.getByText('Teoría de la fixture API.')).toBeVisible();
  expect(screen.queryByText('Aprende las vocales, una por una')).toBeNull();
  expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/learning'))).toBe(true);
  expect(
    fetchMock.mock.calls.every(([, options]) => !options?.method || options.method === 'GET'),
  ).toBe(true);
});

test('vocales no publicadas muestran estado editorial sin curso alternativo inventado', async () => {
  serve([{ ...module, access: 'upcoming', publicationStatus: 'DRAFT', lessons: [] }]);
  renderAuthApp('/student/modules/vowels');
  expect(
    await screen.findByRole('heading', { name: 'La lección de vocales está en preparación' }),
  ).toBeVisible();
  expect(screen.queryByText('Aprende las vocales, una por una')).toBeNull();
});

test('runtime normal no sirve la ilustración de una letra sin autorización registrada', () => {
  render(<ManualReference letter="B" />);
  expect(screen.queryByRole('img')).toBeNull();
  expect(
    screen.getByText('Referencia visual pendiente de autorización y revisión LSV.'),
  ).toBeVisible();
});

test('runtime normal muestra las vocales autorizadas sin ocultar la revisión LSV pendiente', () => {
  render(<ManualReference letter="A" />);
  expect(screen.getByRole('img', { name: /referencia de la letra A/ })).toBeVisible();
  expect(screen.getByText(/Revisión lingüística pendiente\./)).toBeVisible();
  expect(screen.queryByText(/Vista previa de desarrollo/)).toBeNull();
});
