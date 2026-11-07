import { expect, test } from 'vitest';
import { lessonSteps } from '../features/student/curriculum/lesson-steps.js';

test('los grupos de letras tienen identificadores únicos para recordar el recorrido', () => {
  const lesson = {
    exercises: [],
    content: {
      objectives: ['Reconocer las vocales del alfabeto manual'],
      letterCards: ['A', 'E', 'I', 'O', 'U'].map((letter) => ({ letter })),
      sections: [
        { heading: 'Introducción', body: 'Aprendemos a observar las letras.' },
        { heading: 'Práctica', body: 'Comparamos las configuraciones.' },
        { heading: 'Repaso', body: 'Repasamos lo aprendido.' },
      ],
      practiceInstructions: 'Practica a tu ritmo.',
    },
  };
  const steps = lessonSteps(lesson);
  const letterSteps = steps.filter((step) => step.type === 'letters');
  expect(letterSteps).toHaveLength(3);
  expect(new Set(letterSteps.map((step) => step.id)).size).toBe(letterSteps.length);
  expect(letterSteps.map((step) => step.cards.map((card) => card.letter).join(''))).toEqual([
    'AE',
    'IO',
    'U',
  ]);
  expect(new Set(steps.map((step) => step.id)).size).toBe(steps.length);
});
