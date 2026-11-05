import { expect, test } from 'vitest';
import { lessonSteps } from '../features/student/curriculum/lesson-steps.js';
import {
  journeySignature,
  readCheckpoint,
} from '../features/student/curriculum/journey-checkpoint.js';

const lesson = {
  title: 'Lección de prueba',
  content: {
    objectives: ['Objetivo de prueba'],
    practiceInstructions: 'Práctica personal',
    sections: Array.from({ length: 4 }, (_, index) => ({
      heading: `Tema ${index}`,
      body: 'Una explicación. Otra idea.',
    })),
    letterCards: ['A', 'E', 'I', 'O', 'U'].map((letter) => ({ letter })),
  },
  exercises: [
    { id: 'question-1', availability: 'READY', prompt: 'Pregunta de prueba' },
    { id: 'question-2', availability: 'PENDING_MATERIAL', options: [] },
  ],
};

test('la secuencia conserva todo el texto y cada letra, agrupa recursos pendientes e intercala preguntas', () => {
  const steps = lessonSteps(lesson);
  expect(
    steps
      .filter((step) => step.type === 'theory')
      .map((step) => step.body)
      .join(' '),
  ).toBe(lesson.content.sections.map((section) => section.body).join(' '));
  const letters = steps.filter((step) => step.type === 'letters');
  expect(letters.every((step) => step.cards.length <= 2)).toBe(true);
  expect(letters.flatMap((step) => step.cards.map((card) => card.letter))).toEqual([
    'A',
    'E',
    'I',
    'O',
    'U',
  ]);
  expect(steps.filter((step) => step.type === 'resources')).toHaveLength(1);
  expect(steps.some((step) => step.questionId === 'question-2')).toBe(false);
  expect(steps.findIndex((step) => step.type === 'question')).toBeGreaterThan(1);
});

test('el punto local descarta una edición anterior, datos corruptos y cualquier supuesto acierto local', () => {
  const steps = lessonSteps(lesson);
  const signature = journeySignature(steps);
  localStorage.setItem(
    'checkpoint-test',
    JSON.stringify({ signature, position: 'question-1', completed: ['intro', 'question-1'] }),
  );
  expect(readCheckpoint('checkpoint-test', signature, steps).completed).toEqual(['intro']);
  expect(readCheckpoint('checkpoint-test', 'otra-edicion', steps).position).toBe('intro');
  localStorage.setItem('checkpoint-test', '{corrupto');
  expect(readCheckpoint('checkpoint-test', signature, steps).position).toBe('intro');
});
