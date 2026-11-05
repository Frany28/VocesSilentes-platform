import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { renderAuthApp } from './auth-fixture.jsx';
import { lessonPath } from './student-lesson-fixture.jsx';
import { mockCurriculumApi, questionId } from './student-curriculum-fixture.jsx';
import { reachQuestion } from './student-journey-fixture.js';

vi.mock('../lib/config.js', () => ({
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

test('alterar el punto local no permite saltar una pregunta que el servidor no ha completado', async () => {
  const { fetchMock } = mockCurriculumApi(vi.fn());
  const view = renderAuthApp(lessonPath);
  await reachQuestion();
  view.unmount();
  const key = Object.keys(localStorage).find((item) => item.startsWith('vs:lesson-journey:'));
  const saved = JSON.parse(localStorage.getItem(key));
  localStorage.setItem(
    key,
    JSON.stringify({
      ...saved,
      position: 'summary',
      completed: [...saved.completed, questionId],
      isCorrect: true,
      status: 'COMPLETED',
    }),
  );
  renderAuthApp(lessonPath);
  expect(await screen.findByRole('heading', { name: 'Pregunta de comprensión' })).toBeVisible();
  expect(screen.queryByRole('region', { name: 'Resumen de la lección' })).toBeNull();
  expect(screen.queryByText('Esta pregunta ya está resuelta')).toBeNull();
  expect(screen.getByRole('button', { name: 'Comprobar respuesta' })).toBeDisabled();
  expect(fetchMock.mock.calls.every(([, options]) => (options.method ?? 'GET') === 'GET')).toBe(
    true,
  );
});

test('bloquear almacenamiento permite seguir leyendo y comunica que no se recordará el punto', async () => {
  mockCurriculumApi(vi.fn());
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Almacenamiento no disponible', 'QuotaExceededError');
  });
  renderAuthApp(lessonPath);
  await userEvent.click(await screen.findByRole('button', { name: 'Continuar' }));
  expect(screen.getByText('Texto recibido de la API de prueba.')).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('El navegador no permite recordar tu punto');
  expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
});
