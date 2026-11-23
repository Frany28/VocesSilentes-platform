import { useCallback, useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { VowelActivity } from '../features/student/curriculum/VowelActivity.jsx';
import { VowelCameraJourney } from '../features/student/curriculum/VowelCameraJourney.jsx';
import {
  vowelActivities,
  vowelGuides,
  vowelLetters,
} from '../features/student/curriculum/vowel-lesson.js';

vi.mock('../features/student/recognition/CameraPracticeLoader.jsx', () => ({
  CameraPracticeLoader: ({ letter, referenceVisible, onRevealReference, onAttempt }) => (
    <section aria-label={`Cámara simulada ${letter}`}>
      <span>{referenceVisible ? 'Referencia visible' : 'Referencia oculta'}</span>
      {!referenceVisible && <button onClick={onRevealReference}>Consultar referencia</button>}
      <button onClick={() => onAttempt({ reason: 'CANDIDATE', label: letter })}>
        Registrar intento {letter}
      </button>
    </section>
  ),
}));

function ActivityHarness({ activity }) {
  const [saved, setSaved] = useState({ answers: {} });
  const answer = (id, letter, correct) =>
    setSaved((current) => ({
      answers: {
        ...current.answers,
        [letter]: {
          attempts: (current.answers[letter]?.attempts ?? 0) + 1,
          correct: current.answers[letter]?.correct || correct,
        },
      },
    }));
  return (
    <VowelActivity
      activity={activity}
      saved={saved}
      onAnswer={answer}
      onReset={() => setSaved({ answers: {} })}
    />
  );
}

async function solve(activity) {
  const user = userEvent.setup();
  for (const [round, letter] of vowelLetters.entries()) {
    if (activity.id === 'identify') await user.click(screen.getByRole('button', { name: letter }));
    else if (activity.id === 'differentiate') {
      const options = within(
        screen.getByRole('group', { name: 'Compara las dos referencias' }),
      ).getAllByRole('button');
      await user.click(options[round % 2 ? 1 : 0]);
    } else
      await user.click(
        screen.getByRole('button', {
          name: vowelGuides.find((item) => item.letter === letter).description,
        }),
      );
    if (round < vowelLetters.length - 1)
      await user.click(screen.getByRole('button', { name: 'Siguiente vocal' }));
  }
}

test.each(vowelActivities)(
  '$title evalúa las cinco vocales antes de completarse',
  async (activity) => {
    render(<ActivityHarness activity={activity} />);
    expect(screen.queryByText(/Respuesta: vocal/)).toBeNull();
    await solve(activity);
    expect(screen.getByLabelText(`${activity.title} completada`)).toBeVisible();
  },
);

test('una respuesta incorrecta explica la diferencia y permite reintentar sin anticipar la clave', async () => {
  const user = userEvent.setup();
  render(<ActivityHarness activity={vowelActivities[0]} />);
  expect(screen.queryByText(/La respuesta es A/)).toBeNull();
  await user.click(screen.getByRole('button', { name: 'E' }));
  expect(screen.getByRole('status')).toHaveTextContent('La opción elegida corresponde a E');
  await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }));
  await user.click(screen.getByRole('button', { name: 'A' }));
  expect(screen.getByRole('status')).toHaveTextContent('La respuesta es A');
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
  await user.click(screen.getByText('Resultados de esta práctica'));
  expect(screen.getAllByText(/1 intentos · 1 predicciones coincidentes/)).toHaveLength(5);
  expect(screen.getByText(/no certifica que la seña sea correcta/)).toBeVisible();
});

test('la práctica de memoria oculta la ficha hasta que el estudiante la consulta', async () => {
  const user = userEvent.setup();
  render(<CameraHarness mode="memory" />);
  expect(screen.getByText('Referencia oculta')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Consultar referencia' }));
  expect(screen.getByText('Referencia visible')).toBeVisible();
});
