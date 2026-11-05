import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { jsonResponse, renderAuthApp } from './auth-fixture.jsx';
import {
  lessonPath,
  lessonTitle,
  lessonSnapshot,
  mockLessonApi,
} from './student-lesson-fixture.jsx';

vi.mock('../lib/config.js', () => ({
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

test('carga → error → reintento → lectura, sin exponer mensajes internos ni sustituir por demo', async () => {
  let reject;
  const read = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((resolve, failure) => {
          reject = failure;
        }),
    )
    .mockImplementation(() => jsonResponse({ data: lessonSnapshot() }));
  mockLessonApi(read);
  renderAuthApp(lessonPath);
  expect(await screen.findByRole('status', { busy: true })).toHaveTextContent(
    'Preparando tu aprendizaje',
  );
  await waitFor(() => expect(reject).toBeDefined());
  await act(async () => reject(new Error('Detalle privado de conexión')));
  expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar los datos');
  expect(screen.queryByText('Detalle privado de conexión')).toBeNull();
  expect(screen.queryByRole('article')).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByRole('heading', { level: 1, name: lessonTitle })).toBeVisible();
  expect(read).toHaveBeenCalledTimes(2);
});

test.each(['empty', 'wrong-module', 'unknown-lesson', 'demo', 'locked'])(
  '%s no muestra contenido de otra lección ni inventa una lectura',
  async (scenario) => {
    const snapshot = lessonSnapshot();
    if (scenario === 'empty') snapshot.modules = [];
    if (scenario === 'wrong-module') snapshot.modules[0].id = 'otro-modulo';
    if (scenario === 'unknown-lesson') snapshot.modules[0].lessons = [];
    if (scenario === 'demo') snapshot.source = 'demo';
    if (scenario === 'locked') snapshot.modules[0].access = 'locked';
    mockLessonApi(() => jsonResponse({ data: snapshot }));
    renderAuthApp(lessonPath);
    expect(await screen.findByText('Lección no disponible')).toBeVisible();
    expect(screen.queryByRole('article')).toBeNull();
    expect(screen.getByRole('link', { name: 'Volver a Mis módulos' })).toBeVisible();
  },
);

test('desmontar durante carga cancela el transporte y descarta resultados tardíos', async () => {
  let signal;
  let finish;
  mockLessonApi((options) => {
    signal = options.signal;
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  const view = renderAuthApp(lessonPath);
  await waitFor(() => expect(signal).toBeDefined());
  view.unmount();
  expect(signal.aborted).toBe(true);
  await act(async () => finish(jsonResponse({ data: lessonSnapshot() })));
  expect(screen.queryByText('Primera explicación.')).toBeNull();
});

test('texto educativo con HTML se muestra literalmente y no ejecuta contenido', async () => {
  const snapshot = lessonSnapshot();
  snapshot.modules[0].lessons[0].description =
    'Objetivo: Lectura segura.\r\n\r\n<script>peligro()</script>';
  mockLessonApi(() => jsonResponse({ data: snapshot }));
  renderAuthApp(lessonPath);
  expect(await screen.findByText('<script>peligro()</script>')).toBeVisible();
  expect(document.querySelector('article script')).toBeNull();
});
