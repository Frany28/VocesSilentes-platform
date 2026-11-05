import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { jsonResponse, renderAuthApp } from './auth-fixture.jsx';
import { lessonPath } from './student-lesson-fixture.jsx';
import { mockCurriculumApi } from './student-curriculum-fixture.jsx';
import { reachQuestion } from './student-journey-fixture.js';

vi.mock('../lib/config.js', () => ({
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

test('comprobación pendiente impide doble envío, un fallo conserva selección y reintentar usa backend', async () => {
  let fail;
  const answer = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((resolve, reject) => {
          fail = reject;
        }),
    )
    .mockResolvedValue(
      jsonResponse({
        data: {
          isCorrect: false,
          progress: { status: 'IN_PROGRESS' },
          feedback: {
            tone: 'error',
            title: 'Revisa tu selección',
            explanation: 'Pista devuelta por el servidor.',
          },
        },
      }),
    );
  mockCurriculumApi(answer);
  renderAuthApp(lessonPath);
  await reachQuestion();
  await userEvent.click(screen.getByRole('radio', { name: 'Cuarta alternativa' }));
  await userEvent.click(screen.getByRole('button', { name: 'Comprobar respuesta' }));
  await waitFor(() => expect(fail).toBeDefined());
  expect(screen.getByRole('button', { name: 'Comprobando…' })).toBeDisabled();
  expect(screen.getByRole('radio', { name: 'Cuarta alternativa' })).toBeDisabled();
  await act(async () => fail(new Error('Detalle privado de la conexión')));
  expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos comprobar la respuesta');
  expect(screen.queryByText('Detalle privado de la conexión')).toBeNull();
  expect(screen.getByRole('radio', { name: 'Cuarta alternativa' })).toBeChecked();
  await userEvent.click(screen.getByRole('button', { name: 'Comprobar respuesta' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Pista devuelta por el servidor.');
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(screen.getAllByRole('radio').every((radio) => !radio.checked)).toBe(true);
  expect(answer).toHaveBeenCalledTimes(2);
});

test('salir cancela la comprobación y no inserta retroalimentación de una lección anterior', async () => {
  let signal;
  let finish;
  mockCurriculumApi((options) => {
    signal = options.signal;
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  const view = renderAuthApp(lessonPath);
  await reachQuestion();
  await userEvent.click(screen.getByRole('radio', { name: 'Primera alternativa' }));
  await userEvent.click(screen.getByRole('button', { name: 'Comprobar respuesta' }));
  await waitFor(() => expect(signal).toBeDefined());
  view.unmount();
  expect(signal.aborted).toBe(true);
  await act(async () =>
    finish(
      jsonResponse({
        data: {
          isCorrect: true,
          progress: { status: 'COMPLETED' },
          feedback: { tone: 'success', title: 'Tardío', explanation: 'Resultado de otra lección' },
        },
      }),
    ),
  );
  expect(screen.queryByText('Resultado de otra lección')).toBeNull();
});
