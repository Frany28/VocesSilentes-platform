import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { renderAuthApp, jsonResponse, user } from './auth-fixture.jsx';
import { curriculumSnapshot } from './student-curriculum-fixture.jsx';
import { lessonPath } from './student-lesson-fixture.jsx';
import { reachReadingSummary } from './student-journey-fixture.js';

vi.mock('../lib/config.js', () => ({
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

test('lectura publicada permite terminar y guardar sin habilitar preguntas o afirmar revisión LSV', async () => {
  const snapshot = curriculumSnapshot();
  const module = snapshot.modules[0];
  module.preview = false;
  module.publicationStatus = 'PUBLISHED';
  const lesson = module.lessons[0];
  lesson.publicationStatus = 'PUBLISHED';
  lesson.content.reviewStatus = 'PENDING_LSV_REVIEW';
  lesson.exercises.forEach((item) => {
    item.availability = 'PENDING_REVIEW';
    item.options = [];
  });
  const transport = vi.fn(async (url, options = {}) => {
    if (url.endsWith('/me')) return jsonResponse({ data: { user } });
    if (url.endsWith('/csrf')) return jsonResponse({ data: { csrfToken: 'fixture-csrf' } });
    if (url.endsWith('/learning')) return jsonResponse({ data: snapshot });
    if (url.endsWith('/progress') && options.method === 'PUT') {
      expect(JSON.parse(options.body)).toEqual({ status: 'COMPLETED' });
      lesson.status = 'COMPLETED';
      return jsonResponse({ data: { status: 'COMPLETED' } });
    }
    throw new Error('Petición no prevista por la fixture de lectura');
  });
  vi.stubGlobal('fetch', transport);
  renderAuthApp(lessonPath);
  expect(await screen.findByText(/Lectura educativa · Revisión LSV pendiente/)).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(screen.getByText(/Las imágenes y los vídeos siguen pendientes/)).toBeVisible();
  await reachReadingSummary();
  expect(screen.queryByRole('button', { name: 'Comprobar respuesta' })).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Registrar lectura completada' }));
  expect(await screen.findByRole('button', { name: 'Lectura registrada' })).toBeDisabled();
  expect(transport.mock.calls.filter(([, options]) => options?.method === 'PUT')).toHaveLength(1);
  expect(transport.mock.calls.some(([url]) => url.endsWith('/answer'))).toBe(false);
});
