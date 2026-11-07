import { render, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { JourneyPhases } from '../features/student/curriculum/JourneyPhases.jsx';
import { lessonSteps } from '../features/student/curriculum/lesson-steps.js';

const steps = lessonSteps({
  id: 'l',
  title: 'Lección',
  exercises: [{ id: 'q1', prompt: '¿Pregunta?', availability: 'READY' }],
  content: {
    objectives: [],
    sections: [{ heading: 'Inicio', body: 'Texto.' }],
    practiceInstructions: 'Practica.',
    letterCards: [{ letter: 'A' }],
  },
});

test('marca la etapa actual con aria-current y conserva los nombres de todas las etapas', () => {
  render(<JourneyPhases steps={steps} step={steps.find((step) => step.type === 'question')} />);
  const list = screen.getByRole('list', { name: 'Etapas de la lección' });
  const items = within(list).getAllByRole('listitem');
  expect(items.map((item) => item.textContent.replace(/^\d/, ''))).toEqual([
    'Introducción',
    'Explicación',
    'Demostración',
    'Práctica',
    'Evaluación',
    'Repaso',
  ]);
  const current = items.find((item) => item.getAttribute('aria-current') === 'step');
  expect(current).toHaveTextContent('Evaluación');
  expect(items.filter((item) => item.dataset.state === 'done')).toHaveLength(4);
});

test('en el resumen la etapa actual es el repaso', () => {
  render(<JourneyPhases steps={steps} step={undefined} />);
  expect(screen.getByText('Repaso').closest('li')).toHaveAttribute('aria-current', 'step');
});
