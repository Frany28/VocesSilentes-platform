import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { PersonalPractice } from '../features/student/curriculum/PersonalPractice.jsx';
import { vowelGuides } from '../features/student/curriculum/vowel-lesson.js';
import { letterResource } from '../features/student/resources/letter-resources.js';
import { mockCompletedAlphabet, modulePath } from './module-contents-fixture.js';
import { renderAuthApp, user } from './auth-fixture.jsx';

vi.mock('../lib/config.js', () => ({
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));

// Se comprueba la selección y continuación; el detector real tiene sus propias pruebas de captura.
vi.mock('../features/student/recognition/CameraPracticeLoader.jsx', () => ({
  CameraPracticeLoader: ({ letter, onContinue }) => (
    <button onClick={onContinue}>Continuar intento de prueba {letter}</button>
  ),
}));

const step = {
  title: 'Una pausa para practicar',
  body: 'Actividad original de la lección.',
  vowels: ['A', 'E'],
};

test.each([[['A', 'E']], [['I', 'O']], [['U']]])(
  'la página %j muestra solo sus tarjetas con estilo original',
  (vowels) => {
    render(<PersonalPractice step={{ ...step, vowels }} />);
    const blocks = screen.getByRole('region', { name: 'Práctica por vocal' });
    expect(within(blocks).getAllByRole('article')).toHaveLength(vowels.length);
    expect(blocks).toHaveClass('letter-compare');
    for (const guide of vowelGuides.filter((item) => vowels.includes(item.letter))) {
      const block = within(blocks).getByRole('article', { name: `Vocal ${guide.letter}` });
      expect(block).toHaveClass('letter-card');
      expect(within(block).getByRole('img').src).toContain(letterResource(guide.letter).url);
      expect(within(block).getByText(guide.description)).toBeVisible();
      expect(within(block).getByText(guide.focus, { exact: false })).toBeVisible();
      expect(
        within(block).getByRole('button', { name: `Practicar ${guide.letter} con cámara` }),
      ).toBeEnabled();
    }
    expect(screen.queryByRole('button', { name: /Continuar intento/ })).toBeNull();
  },
);

test('la cámara avanza de A a E y solo entonces continúa a la siguiente página', () => {
  const onContinue = vi.fn();
  render(<PersonalPractice step={step} onContinue={onContinue} />);
  fireEvent.click(screen.getByRole('button', { name: 'Practicar A con cámara' }));
  for (const letter of step.vowels) {
    expect(screen.getByRole('heading', { name: `Practica la vocal ${letter}` })).toBeVisible();
    expect(onContinue).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: `Continuar intento de prueba ${letter}` }));
  }
  expect(onContinue).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('region', { name: 'Práctica por vocal' })).toBeVisible();
});

test('elegir O y volver conserva su página I/O sin completar la lectura', () => {
  const onContinue = vi.fn();
  render(<PersonalPractice step={{ ...step, vowels: ['I', 'O'] }} onContinue={onContinue} />);
  fireEvent.click(screen.getByRole('button', { name: 'Practicar O con cámara' }));
  expect(screen.getByRole('button', { name: 'Continuar intento de prueba O' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Volver a los bloques de vocales' }));
  expect(screen.getAllByRole('button', { name: /Practicar . con cámara/ })).toHaveLength(2);
  expect(screen.getByRole('heading', { name: 'I · O' })).toBeVisible();
  expect(screen.queryByRole('button', { name: /Continuar intento/ })).toBeNull();
  expect(onContinue).not.toHaveBeenCalled();
});

test('la ruta real navega A/E e I/O/U con el pie original y conserva la página al volver', async () => {
  const { snapshot, fetchMock } = mockCompletedAlphabet();
  const module = snapshot.modules[0];
  const lesson = module.lessons[1];
  const key = `vs:lesson-journey:${user.id}:${module.id}:${lesson.id}`;
  const checkpoint = JSON.parse(localStorage.getItem(key));
  localStorage.setItem(key, JSON.stringify({ ...checkpoint, position: 'practice' }));
  renderAuthApp(`${modulePath}/lessons/${lesson.id}`);
  expect(await screen.findByRole('region', { name: 'Práctica por vocal' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'A · E' })).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Ver mi resumen' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(await screen.findByRole('heading', { name: 'I · O · U' })).toBeVisible();
  expect(screen.getAllByRole('button', { name: /Practicar . con cámara/ })).toHaveLength(3);
  expect(screen.getByRole('button', { name: 'Ver mi resumen' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Volver', exact: true }));
  expect(await screen.findByRole('heading', { name: 'A · E' })).toBeVisible();
  expect(JSON.parse(localStorage.getItem(key)).position).toBe('practice');
  expect(fetchMock.mock.calls.every(([, options]) => (options.method ?? 'GET') === 'GET')).toBe(
    true,
  );
});

test('la práctica de la primera lección ofrece las cinco vocales y abre la cámara al elegir una vocal', async () => {
  const { snapshot } = mockCompletedAlphabet();
  const module = snapshot.modules[0];
  const lesson = module.lessons[0];
  const key = `vs:lesson-journey:${user.id}:${module.id}:${lesson.id}`;
  const checkpoint = JSON.parse(localStorage.getItem(key));
  localStorage.setItem(key, JSON.stringify({ ...checkpoint, position: 'practice' }));
  renderAuthApp(`${modulePath}/lessons/${lesson.id}`);
  const practice = await screen.findByRole('region', { name: 'Práctica por vocal' });
  expect(within(practice).getAllByRole('img')).toHaveLength(5);
  expect(screen.queryByRole('button', { name: /Continuar intento/ })).toBeNull();
  for (const { letter } of vowelGuides) {
    const card = screen.getByRole('article', { name: `Vocal ${letter}` });
    fireEvent.click(within(card).getByRole('button', { name: `Practicar ${letter} con cámara` }));
    expect(
      screen.getByRole('button', { name: `Continuar intento de prueba ${letter}` }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Volver a los bloques de vocales' }));
  }
});
