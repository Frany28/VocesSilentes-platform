import { fireEvent, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { jsonResponse, renderAuthApp, unauthorized, user } from './auth-fixture.jsx';
import { lessonPath, lessonSnapshot, lessonTitle } from './student-lesson-fixture.jsx';
import { safeReturnPath } from '../features/auth/return-path.js';

vi.mock('../lib/config.js', () => ({
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

test('un enlace directo exige sesión y vuelve a la misma lección después del login', async () => {
  const fetchMock = vi.fn((url) =>
    Promise.resolve(
      url.endsWith('/me')
        ? unauthorized()
        : jsonResponse({
            data: url.endsWith('/learning')
              ? lessonSnapshot()
              : url.endsWith('/csrf')
                ? { csrfToken: 'test-csrf' }
                : { user, csrfToken: 'test-rotated' },
          }),
    ),
  );
  vi.stubGlobal('fetch', fetchMock);
  renderAuthApp(lessonPath);
  expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
  expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/learning'))).toBe(false);
  fireEvent.change(screen.getByLabelText('Correo electrónico'), {
    target: { value: 'person@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'valid password' } });
  fireEvent.submit(screen.getByRole('form', { name: 'Inicia sesión' }));
  expect(await screen.findByRole('heading', { level: 1, name: lessonTitle })).toBeVisible();
});

test('el retorno de lectura acepta solo UUID internos para USER y conserva la restricción de rol', () => {
  expect(safeReturnPath(lessonPath, 'USER')).toBe(lessonPath);
  expect(safeReturnPath(lessonPath, 'ADMIN')).toBe('/admin');
  for (const path of [
    `${lessonPath}?next=/admin`,
    `${lessonPath}/../admin`,
    `https://host${lessonPath}`,
    '/student/modules/titulo/lessons/titulo',
  ]) {
    expect(safeReturnPath(path, 'USER')).toBe('/student');
  }
});
