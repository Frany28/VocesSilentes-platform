import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { VowelActivity } from '../features/student/curriculum/VowelActivity.jsx';
import {
  vowelActivities,
  vowelGuides,
  vowelLetters,
} from '../features/student/curriculum/vowel-lesson.js';
import { activityOrder } from '../features/student/curriculum/vowel-rounds.js';

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

function ActivityHarness({ activity, onPracticeAttempt }) {
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
      onPracticeAttempt={onPracticeAttempt}
    />
  );
}

async function solve(activity) {
  const user = userEvent.setup();
  const order = activityOrder(activity.id);
  for (const [round, letter] of order.entries()) {
    if (activity.id === 'identify') await user.click(screen.getByRole('button', { name: letter }));
    else if (activity.id === 'differentiate') {
      const options = within(
        screen.getByRole('group', { name: 'Compara las dos referencias' }),
      ).getAllByRole('button');
      await user.click(options[round % 2 ? 1 : 0]);
    } else await user.click(screen.getByRole('button', { name: describe(letter) }));
    await user.click(
      screen.getByRole('button', {
        name: round < order.length - 1 ? 'Siguiente vocal' : 'Ver resultado',
      }),
    );
  }
}

test.each(vowelActivities)(
  '$title evalúa las cinco vocales antes de completarse',
  async (activity) => {
    render(<ActivityHarness activity={activity} />);
    expect(screen.queryByText(/La respuesta es/)).toBeNull();
    await solve(activity);
    expect(screen.getByLabelText(`${activity.title} completada`)).toBeVisible();
  },
);

test('cada actividad recorre las cinco vocales en un orden propio', () => {
  for (const activity of vowelActivities)
    expect([...activityOrder(activity.id)].sort()).toEqual([...vowelLetters]);
  expect(activityOrder('identify')).not.toEqual(activityOrder('recall'));
  expect(activityOrder('identify')[0]).not.toBe('A');
});

test('una respuesta incorrecta explica la diferencia y permite reintentar sin anticipar la clave', async () => {
  const user = userEvent.setup();
  render(<ActivityHarness activity={vowelActivities[0]} />);
  const target = activityOrder('identify')[0];
  expect(screen.getByRole('status')).toHaveTextContent('Observa antes de elegir');
  expect(screen.queryByText(/La respuesta es/)).toBeNull();
  await user.click(screen.getByRole('button', { name: 'A' }));
  expect(screen.getByRole('status')).toHaveTextContent('La opción elegida corresponde a A');
  expect(screen.getByRole('img', { name: 'Referencia de la vocal A' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }));
  const tried = screen.getByRole('button', { name: /^A.*ya probaste esta opción/ });
  expect(tried).toBeDisabled();
  await user.click(screen.getByRole('button', { name: target }));
  expect(screen.getByRole('status')).toHaveTextContent(`La respuesta es ${target}`);
  expect(screen.getByText(`Rasgo clave de la ${target}`)).toBeVisible();
});

test('la quinta explicación sigue visible hasta que el estudiante pide ver el resultado', async () => {
  const user = userEvent.setup();
  render(<ActivityHarness activity={vowelActivities[0]} />);
  const order = activityOrder('identify');
  for (const [round, letter] of order.entries()) {
    await user.click(screen.getByRole('button', { name: letter }));
    if (round < order.length - 1)
      await user.click(screen.getByRole('button', { name: 'Siguiente vocal' }));
  }
  expect(screen.getByRole('status')).toHaveTextContent(`La respuesta es ${order.at(-1)}`);
  expect(screen.queryByLabelText('Reconoce la vocal completada')).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Ver resultado' }));
  expect(screen.getByLabelText('Reconoce la vocal completada')).toBeVisible();
});

test('tras reconocer una vocal se puede practicar la seña sin salir de la actividad', async () => {
  const user = userEvent.setup();
  const practice = vi.fn();
  render(<ActivityHarness activity={vowelActivities[0]} onPracticeAttempt={practice} />);
  const [first] = activityOrder('identify');
  expect(screen.queryByRole('button', { name: 'Ahora realiza la seña' })).toBeNull();
  await user.click(screen.getByRole('button', { name: first }));
  await user.click(screen.getByRole('button', { name: 'Ahora realiza la seña' }));
  const camera = screen.getByLabelText(`Cámara simulada ${first}`);
  expect(camera).toHaveAttribute('data-variant', 'workspace');
  expect(screen.getByRole('heading', { name: `Ahora realiza la ${first}` })).toHaveFocus();
  await user.click(within(camera).getByRole('button', { name: `Registrar intento ${first}` }));
  expect(practice).toHaveBeenCalledWith(first, { reason: 'CANDIDATE', label: first });
  await user.click(screen.getByRole('button', { name: 'Volver a la actividad' }));
  expect(screen.getByRole('status')).toHaveTextContent(`La respuesta es ${first}`);
  await user.click(screen.getByRole('button', { name: 'Ahora realiza la seña' }));
  await user.click(screen.getByRole('button', { name: 'Siguiente vocal' }));
  expect(screen.queryByLabelText(/Cámara simulada/)).toBeNull();
  expect(screen.getByLabelText('Ronda 2 de 5')).toBeVisible();
  expect(screen.queryByText(/La respuesta es/)).toBeNull();
});
