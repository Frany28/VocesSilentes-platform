import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { renderAuthApp, user } from './auth-fixture.jsx';
import { mockCompletedAlphabet } from './module-contents-fixture.js';
import { LessonResources } from '../features/student/curriculum/LessonResources.jsx';
import { alphabetLessonIds } from '../features/student/resources/lesson-videos.js';
import { vowelLearningSteps } from '../features/student/curriculum/vowel-lesson.js';
import { journeySignature } from '../features/student/curriculum/journey-checkpoint.js';

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

test('Comenzar módulo recupera la introducción con el video aunque la guía antigua estuviera en resumen', async () => {
  const { fetchMock } = mockCompletedAlphabet();
  localStorage.setItem(
    `vs:lesson-journey:${user.id}:vowels-learning:vowels-guided-v1`,
    JSON.stringify({
      signature: journeySignature(vowelLearningSteps),
      position: 'summary',
      completed: vowelLearningSteps.map((step) => step.id),
    }),
  );
  renderAuthApp('/student/modules');
  await userEvent.click(await screen.findByRole('link', { name: 'Comenzar módulo de vocales' }));
  expect(
    await screen.findByRole('heading', { name: 'Aprende las vocales, una por una' }),
  ).toBeVisible();
  expect(await screen.findByRole('button', { name: 'Comenzar la microclase' })).toBeVisible();
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
