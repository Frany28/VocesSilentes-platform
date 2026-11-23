import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { renderAuthApp } from './auth-fixture.jsx';
import { mockCompletedAlphabet, modulePath } from './module-contents-fixture.js';
import { LessonResources } from '../features/student/curriculum/LessonResources.jsx';
import { alphabetLessonIds } from '../features/student/resources/lesson-videos.js';

vi.mock('../lib/config.js', () => ({
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

test('el paso de la introducción muestra la clase original y reproduce su MP3 únicamente al pulsar', async () => {
  const camera = vi.fn();
  vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia: camera } });
  const view = render(
    <LessonResources
      step={{
        title: 'Observa a tu ritmo',
        lessonId: alphabetLessonIds['m1-l01'],
      }}
    />,
  );
  const start = await screen.findByRole('button', { name: 'Comenzar la microclase' });
  expect(screen.queryByText('Video de referencia · pendiente')).toBeNull();
  expect(screen.getByRole('group', { name: 'Capítulos de la microclase' })).toBeVisible();
  const play = vi.mocked(HTMLMediaElement.prototype.play);
  expect(play).not.toHaveBeenCalled();
  await userEvent.click(start);
  await waitFor(() => expect(play).toHaveBeenCalled());
  expect(play.mock.instances[0].src).toMatch(/\/media\/microclass\/[a-f0-9]+\.mp3$/);
  expect(screen.getByRole('button', { name: 'Pausar microclase' })).toBeVisible();
  expect(camera).not.toHaveBeenCalled();
  view.unmount();
  expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
});

test('la lección real ignora el resumen de la guía antigua y comienza en su introducción', async () => {
  const { snapshot, fetchMock } = mockCompletedAlphabet();
  localStorage.setItem(
    'vs:lesson-journey:test-user:vowels-learning:vowels-guided-v1',
    JSON.stringify({
      signature: 'recorrido-obsoleto',
      position: 'summary',
      completed: ['intro'],
    }),
  );
  const lesson = snapshot.modules[0].lessons[1];
  renderAuthApp(`${modulePath}/lessons/${lesson.id}`);
  expect(
    await screen.findByRole('heading', { name: 'Aprendamos las cinco vocales' }),
  ).toBeVisible();
  expect(await screen.findByRole('button', { name: 'Comenzar lección' })).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Las cinco vocales, de un vistazo' })).toBeNull();
  expect(fetchMock.mock.calls.every(([, options]) => (options.method ?? 'GET') === 'GET')).toBe(
    true,
  );
});

test('otras lecciones conservan el estado real de sus videos sin fingir demostraciones', () => {
  render(
    <LessonResources
      step={{ title: 'Observa a tu ritmo', lessonId: alphabetLessonIds['m1-l03'] }}
    />,
  );
  expect(screen.getByText('Video de referencia · pendiente')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Comenzar la microclase' })).toBeNull();
});
