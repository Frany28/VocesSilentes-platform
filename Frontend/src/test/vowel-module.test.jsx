import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { renderAuthApp, user, jsonResponse } from './auth-fixture.jsx';

function setup() {
  const fetchMock = vi
    .fn()
    .mockImplementation(() => Promise.resolve(jsonResponse({ data: { user } })));
  vi.stubGlobal('fetch', fetchMock);
  const media = vi.fn();
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: media },
  });
  return { fetchMock, media };
}

test('vista previa explícita conserva explicación y práctica sin activar cámara al navegar', async () => {
  const { media, fetchMock } = setup();
  renderAuthApp('/student/modules/vowels');
  await screen.findByRole('heading', { name: 'Aprende las vocales, una por una' });
  expect(screen.queryByRole('button', { name: 'Activar cámara' })).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(await screen.findByRole('heading', { name: 'Conoce la vocal A' })).toBeVisible();
  expect(screen.getByText(/cuatro dedos aparecen recogidos/)).toBeVisible();
  expect(screen.getByRole('img', { name: /referencia de la letra A/ })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Practicar A con cámara' }));
  expect(await screen.findByRole('heading', { name: 'Practica la letra A' })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(await screen.findByRole('heading', { name: 'Conoce la vocal E' })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Volver' }));
  expect(await screen.findByRole('heading', { name: 'Practica la letra A' })).toBeVisible();
  expect(media).not.toHaveBeenCalled();
  expect(fetchMock.mock.calls.every(([url]) => url.endsWith('/me'))).toBe(true);
});

test('las cinco vocales tienen explicación, práctica opcional y repaso sin aciertos ni escrituras académicas', async () => {
  const { media, fetchMock } = setup();
  renderAuthApp('/student/modules/vowels');
  await userEvent.click(await screen.findByRole('button', { name: 'Continuar' }));
  for (const letter of ['A', 'E', 'I', 'O', 'U']) {
    expect(await screen.findByRole('heading', { name: `Conoce la vocal ${letter}` })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: `Practicar ${letter} con cámara` }));
    expect(
      await screen.findByRole('heading', { name: `Practica la letra ${letter}` }),
    ).toBeVisible();
    await userEvent.click(
      screen.getByRole('button', { name: letter === 'U' ? 'Ver mi repaso' : 'Continuar' }),
    );
  }
  expect(
    await screen.findByRole('heading', { name: 'Las cinco vocales, de un vistazo' }),
  ).toBeVisible();
  expect(screen.getByRole('progressbar', { name: 'Tu recorrido' })).toHaveAttribute(
    'aria-valuenow',
    '100',
  );
  expect(screen.getByText(/ni confirma que hayas realizado capturas/)).toBeVisible();
  expect(media).not.toHaveBeenCalled();
  expect(fetchMock.mock.calls.every(([url]) => url.endsWith('/me'))).toBe(true);
  await userEvent.click(screen.getByRole('button', { name: 'Repasar desde el inicio' }));
  expect(
    await screen.findByRole('heading', { name: 'Aprende las vocales, una por una' }),
  ).toBeVisible();
});

test('retoma la explicación por usuario y conserva solo lectura, sin compartirla con otra sesión', async () => {
  const { fetchMock } = setup();
  const first = renderAuthApp('/student/modules/vowels');
  await userEvent.click(await screen.findByRole('button', { name: 'Continuar' }));
  await userEvent.click(await screen.findByRole('button', { name: 'Practicar A con cámara' }));
  await userEvent.click(await screen.findByRole('button', { name: 'Continuar' }));
  await screen.findByRole('heading', { name: 'Conoce la vocal E' });
  first.unmount();
  const resumed = renderAuthApp('/student/modules/vowels');
  expect(await screen.findByRole('heading', { name: 'Conoce la vocal E' })).toBeVisible();
  const saved = localStorage.getItem(
    `vs:lesson-journey:${user.id}:vowels-learning:vowels-guided-v1`,
  );
  expect(saved).not.toMatch(/frames|prediction|correct|score|token/);
  resumed.unmount();
  fetchMock.mockImplementation(() =>
    Promise.resolve(jsonResponse({ data: { user: { ...user, id: 'other-student' } } })),
  );
  renderAuthApp('/student/modules/vowels');
  expect(
    await screen.findByRole('heading', { name: 'Aprende las vocales, una por una' }),
  ).toBeVisible();
});
