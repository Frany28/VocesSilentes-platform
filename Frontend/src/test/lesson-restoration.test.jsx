import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import alphabet from '../../../Backend/content/alphabet/module-01.json';
import { lessonSteps } from '../features/student/curriculum/lesson-steps.js';
import { CurriculumTheory } from '../features/student/curriculum/CurriculumTheory.jsx';
import { hasVowelMicroclass } from '../features/student/resources/lesson-microclasses.js';
import { alphabetLessonIds } from '../features/student/resources/lesson-videos.js';
import { mockCompletedAlphabet, modulePath } from './module-contents-fixture.js';
import { renderAuthApp } from './auth-fixture.jsx';

vi.mock('../lib/config.js', () => ({
  publicConfig: { apiUrl: 'http://localhost:3000/api', studentDemo: false },
}));
vi.mock('../features/student/recognition/CameraPracticeLoader.jsx', () => ({
  CameraPracticeLoader: ({ letter, onContinue }) => (
    <button onClick={onContinue}>Continuar intento de prueba {letter}</button>
  ),
}));

// Proyecta el paquete original sin sustituir sus explicaciones, tarjetas o instrucciones.
function publicLesson(source) {
  return {
    id: alphabetLessonIds[source.id],
    title: source.title,
    exercises: [],
    content: {
      ...source,
      letterCards: alphabet.letterCards.filter((card) => card.lessonKey === source.id),
    },
  };
}

test.each(alphabet.lessons)(
  '$id conserva texto completo, tarjetas e instrucciones de su práctica',
  (source) => {
    const lesson = publicLesson(source);
    const steps = lessonSteps(lesson);
    expect(steps[0].objectives).toEqual(source.objectives);
    expect(
      steps
        .filter((step) => step.type === 'theory')
        .map((step) => step.body)
        .join(' '),
    ).toBe(source.sections.map((section) => section.body).join(' '));
    const practice = steps.filter((step) => step.type === 'practice');
    const expected = lesson.content.letterCards.map((card) => card.letter);
    expect(
      practice.flatMap((step) => step.vowels ?? step.cards.map((card) => card.letter)),
    ).toEqual(expected.length ? expected : ['A', 'E', 'I', 'O', 'U']);
    expect(practice.every((step) => (step.vowels ?? step.cards).length <= 2)).toBe(true);
    expect(practice.every((step) => step.body === source.practiceInstructions)).toBe(true);
    expect(hasVowelMicroclass(lesson.id)).toBe(['m1-l01', 'm1-l02'].includes(source.id));
  },
);

test('la práctica de consonantes abre B y C dentro de su lección, sin sustituirlas por vocales', () => {
  const step = lessonSteps(publicLesson(alphabet.lessons[2])).find(
    (item) => item.type === 'practice',
  );
  const onContinue = vi.fn();
  render(<CurriculumTheory step={step} onPracticeContinue={onContinue} />);
  expect(screen.getByText(alphabet.lessons[2].practiceInstructions)).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Practicar A con cámara' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /Practicar B/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Continuar intento de prueba B' }));
  expect(onContinue).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Continuar intento de prueba C' }));
  expect(onContinue).toHaveBeenCalledTimes(1);
});

test('el índice permite abrir la clase original directamente desde Introducción sin escrituras', async () => {
  const { fetchMock } = mockCompletedAlphabet();
  renderAuthApp(modulePath);
  const links = await screen.findAllByRole('link', { name: 'Ver microclase de las vocales' });
  fireEvent.click(links[0]);
  expect(
    await screen.findByText(
      'Observa cada vocal, sigue los subtítulos y utiliza los controles para repasar a tu ritmo.',
    ),
  ).toBeVisible();
  expect(fetchMock.mock.calls.every(([, options]) => (options.method ?? 'GET') === 'GET')).toBe(
    true,
  );
});
