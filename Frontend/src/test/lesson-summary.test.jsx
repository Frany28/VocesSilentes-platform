import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { AssessmentSummary } from '../features/student/curriculum/AssessmentSummary.jsx';

const progress = vi.hoisted(() => ({ current: null }));
vi.mock('../features/student/data/use-learning-progress.js', () => ({
  useLearningProgress: () => progress.current,
}));

function setup({ status = 'NOT_STARTED', saved = false, nextTitle } = {}) {
  progress.current = { pending: false, error: '', saved, submit: vi.fn().mockResolvedValue(true) };
  const lessons = [
    { id: 'l1', status: 'COMPLETED', publicationStatus: 'PUBLISHED' },
    { id: 'l2', status: saved ? 'COMPLETED' : status, publicationStatus: 'PUBLISHED' },
  ];
  const module = { title: 'Abecedario LSV', access: 'available', lessons };
  const lesson = { id: 'l2', status, content: { objectives: ['Deletrear mi nombre.'] } };
  const onContinue = vi.fn();
  render(
    <AssessmentSummary
      questions={[]}
      lesson={lesson}
      module={module}
      onContinue={onContinue}
      onReview={() => {}}
      nextTitle={nextTitle}
    />,
  );
  return { onContinue, submit: progress.current.submit };
}

test('en la última lección, guardar se queda en la página para mostrar el cierre del módulo', async () => {
  const { onContinue, submit } = setup();
  expect(screen.getByRole('heading', { name: '¡Muy bien, terminaste la lección!' })).toBeVisible();
  expect(screen.getByText('Deletrear mi nombre.')).toBeVisible();
  expect(screen.getByText('Esta es la última lección del módulo.')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Guardar y terminar' }));
  expect(submit).toHaveBeenCalledWith('lessons', 'l2', 'COMPLETED');
  expect(onContinue).not.toHaveBeenCalled();
});

test('con todas las lecciones guardadas felicita por el módulo y permite volver a mis módulos', async () => {
  const { onContinue, submit } = setup({ saved: true });
  expect(
    screen.getByRole('heading', { name: '¡Felicidades! Completaste Abecedario LSV' }),
  ).toBeVisible();
  expect(screen.getByText('Lectura registrada en tu progreso.')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Volver a mis módulos' }));
  expect(onContinue).toHaveBeenCalledTimes(1);
  expect(submit).not.toHaveBeenCalled();
});

test('una lección ya guardada ofrece la siguiente sin volver a guardar', async () => {
  const { onContinue, submit } = setup({ status: 'COMPLETED', nextTitle: 'Las cinco vocales' });
  expect(screen.getByRole('heading', { name: '¡Lección completada!' })).toBeVisible();
  expect(screen.getByText('Siguiente: Lección 3 · Las cinco vocales')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Siguiente lección' }));
  expect(onContinue).toHaveBeenCalledTimes(1);
  expect(submit).not.toHaveBeenCalled();
});
