import { useCallback, useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { VowelCameraJourney } from '../features/student/curriculum/VowelCameraJourney.jsx';
import { VowelMixedReview } from '../features/student/curriculum/VowelMixedReview.jsx';
import { vowelGuides, vowelLetters } from '../features/student/curriculum/vowel-lesson.js';
import { mixedReview, mixedReviewDone } from '../features/student/curriculum/vowel-rounds.js';

vi.mock('../features/student/recognition/CameraPracticeLoader.jsx', () => ({
  CameraPracticeLoader: ({ letter, referenceVisible, onRevealReference, onAttempt, variant }) => (
    <section aria-label={`Cámara simulada ${letter}`} data-variant={variant}>
      <span>{referenceVisible ? 'Referencia visible' : 'Referencia oculta'}</span>
      {!referenceVisible && <button onClick={onRevealReference}>Consultar referencia</button>}
      <button onClick={() => onAttempt({ reason: 'CANDIDATE', label: letter })}>
        Registrar intento {letter}
      </button>
    </section>
  ),
}));

const describe = (letter) => vowelGuides.find((item) => item.letter === letter).description;

function MixedHarness({ onAttempt }) {
  const [progress, setProgress] = useState({
    activities: {},
    mixed: [],
    camera: { guided: { visited: [], attempts: {} }, memory: { visited: [], attempts: {} } },
  });
  const complete = (id) =>
    setProgress((current) => ({ ...current, mixed: [...new Set([...current.mixed, id])] }));
  return (
    <>
      <VowelMixedReview
        progress={progress}
        onAnswer={() => {}}
        onComplete={complete}
        onAttempt={onAttempt}
      />
      <output>{mixedReviewDone(progress) ? 'repaso completo' : 'repaso pendiente'}</output>
    </>
  );
}

async function answerMixed(user, item) {
  if (item.activity === 'identify')
    return user.click(screen.getByRole('button', { name: item.letter }));
  if (item.activity === 'recall')
    return user.click(screen.getByRole('button', { name: describe(item.letter) }));
  const options = within(
    screen.getByRole('group', { name: 'Compara las dos referencias' }),
  ).getAllByRole('button');
  return user.click(options[mixedReview.indexOf(item) % 2 ? 1 : 0]);
}

test('el repaso combinado alterna reconocer y señar y no exige usar la cámara', async () => {
  const user = userEvent.setup();
  const attempt = vi.fn();
  render(<MixedHarness onAttempt={attempt} />);
  expect(new Set(mixedReview.map((item) => item.letter))).toEqual(new Set(vowelLetters));
  expect(mixedReview.map((item) => item.kind)).toEqual([
    'visual',
    'camera',
    'visual',
    'camera',
    'visual',
  ]);
  for (const item of mixedReview) {
    if (item.kind === 'camera') {
      const camera = screen.getByLabelText(`Cámara simulada ${item.letter}`);
      expect(within(camera).getByText('Referencia oculta')).toBeVisible();
      if (item.letter === 'A')
        await user.click(within(camera).getByRole('button', { name: 'Registrar intento A' }));
    } else await answerMixed(user, item);
    expect(screen.getByText('repaso pendiente')).toBeInTheDocument();
    const label = item === mixedReview.at(-1) ? 'Terminar repaso' : 'Siguiente reto';
    await user.click(screen.getByRole('button', { name: label }));
  }
  expect(attempt).toHaveBeenCalledWith('memory', 'A', { reason: 'CANDIDATE', label: 'A' });
  expect(attempt).toHaveBeenCalledTimes(1);
  expect(screen.getByText('repaso completo')).toBeInTheDocument();
});

function CameraHarness({ mode }) {
  const [saved, setSaved] = useState({ visited: [], attempts: {} });
  const visit = useCallback((_, letter) => {
    setSaved((current) => ({
      ...current,
      visited: [...new Set([...current.visited, letter])],
    }));
  }, []);
  const attempt = useCallback((_, letter, result) => {
    setSaved((current) => ({
      ...current,
      attempts: {
        ...current.attempts,
        [letter]: {
          total: (current.attempts[letter]?.total ?? 0) + 1,
          matches:
            (current.attempts[letter]?.matches ?? 0) +
            (result.reason === 'CANDIDATE' && result.label === letter ? 1 : 0),
          uncertain: current.attempts[letter]?.uncertain ?? 0,
        },
      },
    }));
  }, []);
  return <VowelCameraJourney mode={mode} saved={saved} onVisit={visit} onAttempt={attempt} />;
}

test('la práctica guiada recorre A, E, I, O y U y separa visita, intento y coincidencia', async () => {
  const user = userEvent.setup();
  render(<CameraHarness mode="guided" />);
  expect(
    within(screen.getByRole('group', { name: 'Vocales de este ejercicio' })).getAllByRole('button'),
  ).toHaveLength(5);
  for (const [index, letter] of vowelLetters.entries()) {
    expect(screen.getByLabelText(`Cámara simulada ${letter}`)).toBeVisible();
    await user.click(screen.getByRole('button', { name: `Registrar intento ${letter}` }));
    if (index < vowelLetters.length - 1)
      await user.click(screen.getByRole('button', { name: 'Siguiente vocal' }));
  }
  expect(screen.getByLabelText('Cámara simulada U')).toHaveAttribute('data-variant', 'workspace');
  await user.click(screen.getByText('Resultados de esta práctica'));
  expect(screen.getAllByText(/1 intentos · 1 predicciones coincidentes/)).toHaveLength(5);
  expect(screen.getByText(/no certifica que la seña sea correcta/)).toBeVisible();
});

test('la práctica de memoria oculta la ficha hasta que el estudiante la consulta', async () => {
  const user = userEvent.setup();
  render(<CameraHarness mode="memory" />);
  expect(screen.getByRole('heading', { name: 'Desafío de memoria' })).toBeVisible();
  expect(screen.getByText('Referencia oculta')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Consultar referencia' }));
  expect(screen.getByText('Referencia visible')).toBeVisible();
});
