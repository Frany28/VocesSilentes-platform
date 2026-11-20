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

const step = { title: 'Una pausa para practicar', body: 'Actividad original de la lección.' };

test('los cinco bloques conservan las fichas de práctica y la explicación original sin abrir cámara', () => {
  render(<PersonalPractice step={step} />);
  const blocks = screen.getByRole('region', { name: 'Práctica por vocal' });
  for (const guide of vowelGuides) {
    const block = within(blocks).getByRole('article', { name: `Vocal ${guide.letter}` });
    expect(within(block).getByRole('img').src).toContain(letterResource(guide.letter).url);
    expect(within(block).getByText(guide.description)).toBeVisible();
    expect(within(block).getByText(guide.focus, { exact: false })).toBeVisible();
    expect(
      within(block).getByRole('button', { name: `Practicar ${guide.letter} con cámara` }),
    ).toBeEnabled();
  }
  expect(screen.queryByRole('button', { name: /Continuar intento/ })).toBeNull();
});

test('cada cámara recibe su vocal y A avanza a E, I, O y U antes de salir de la actividad', () => {
  const onContinue = vi.fn();
  render(<PersonalPractice step={step} onContinue={onContinue} />);
  fireEvent.click(screen.getByRole('button', { name: 'Practicar A con cámara' }));
  for (const { letter } of vowelGuides) {
    expect(screen.getByRole('heading', { name: `Practica la vocal ${letter}` })).toBeVisible();
    expect(onContinue).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: `Continuar intento de prueba ${letter}` }));
  }
  expect(onContinue).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('region', { name: 'Práctica por vocal' })).toBeVisible();
});

test('elegir O y volver conserva los cinco bloques sin completar la lectura', () => {
  const onContinue = vi.fn();
  render(<PersonalPractice step={step} onContinue={onContinue} />);
  fireEvent.click(screen.getByRole('button', { name: 'Practicar O con cámara' }));
  expect(screen.getByRole('button', { name: 'Continuar intento de prueba O' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Volver a los bloques de vocales' }));
  expect(screen.getAllByRole('button', { name: /Practicar . con cámara/ })).toHaveLength(5);
  expect(screen.queryByRole('button', { name: /Continuar intento/ })).toBeNull();
  expect(onContinue).not.toHaveBeenCalled();
});

test('la ruta real de la introducción muestra los bloques en Práctica sin escribir avance académico', async () => {
  const { snapshot, fetchMock } = mockCompletedAlphabet();
  const module = snapshot.modules[0];
  const lesson = module.lessons[0];
  const key = `vs:lesson-journey:${user.id}:${module.id}:${lesson.id}`;
  const checkpoint = JSON.parse(localStorage.getItem(key));
  localStorage.setItem(key, JSON.stringify({ ...checkpoint, position: 'practice' }));
  renderAuthApp(`${modulePath}/lessons/${lesson.id}`);
  expect(await screen.findByRole('region', { name: 'Práctica por vocal' })).toBeVisible();
  expect(screen.getAllByRole('button', { name: /Practicar . con cámara/ })).toHaveLength(5);
  expect(fetchMock.mock.calls.every(([, options]) => (options.method ?? 'GET') === 'GET')).toBe(
    true,
  );
});
