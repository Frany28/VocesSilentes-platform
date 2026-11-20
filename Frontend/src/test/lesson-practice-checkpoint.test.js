import { expect, test } from 'vitest';
import alphabet from '../../../Backend/content/alphabet/module-01.json';
import { lessonSteps } from '../features/student/curriculum/lesson-steps.js';
import {
  journeySignature,
  readCheckpoint,
} from '../features/student/curriculum/journey-checkpoint.js';

const source = alphabet.lessons[2];
const lesson = {
  id: 'consonants',
  title: source.title,
  exercises: [],
  content: {
    ...source,
    letterCards: alphabet.letterCards.filter((card) => card.lessonKey === source.id),
  },
};
const steps = lessonSteps(lesson);
const signature = journeySignature(steps);
// Contrato exacto de a9bd46d: las consonantes recibían erróneamente la misma práctica de vocales.
const previous = [
  ...steps.slice(
    0,
    steps.findIndex((step) => step.type === 'practice'),
  ),
  ...[['A', 'E'], ['I', 'O'], ['U']].map((vowels, index) => ({
    id: index ? `practice-${vowels.join('')}` : 'practice',
    type: 'practice',
    phase: 'practice',
    title: 'Una pausa para practicar',
    body: source.practiceInstructions,
    vowels,
  })),
];

test.each(['resources', 'practice-IO', 'summary'])(
  'recupera %s de la edición conocida sin aprobar letras nuevas',
  (position) => {
    localStorage.setItem(
      'previous-practice',
      JSON.stringify({
        signature: journeySignature(previous),
        position,
        completed: ['intro', 'practice-IO'],
      }),
    );
    expect(readCheckpoint('previous-practice', signature, steps)).toEqual({
      signature,
      position: position === 'practice-IO' ? 'practice' : position,
      completed: ['intro'],
    });
  },
);

test('otro cambio educativo no se acepta como una simple restauración de la práctica', () => {
  const otherEdition = previous.map((step) =>
    step.type === 'theory' ? { ...step, body: 'Otro contenido.' } : step,
  );
  localStorage.setItem(
    'changed-practice',
    JSON.stringify({
      signature: journeySignature(otherEdition),
      position: 'summary',
      completed: ['intro'],
    }),
  );
  expect(readCheckpoint('changed-practice', signature, steps)).toEqual({
    signature,
    position: 'intro',
    completed: [],
  });
});
