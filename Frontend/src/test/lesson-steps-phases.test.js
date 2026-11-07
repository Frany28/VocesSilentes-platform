import { expect, test } from 'vitest';
import alphabet from '../../../Backend/content/alphabet/module-01.json';
import { lessonSteps } from '../features/student/curriculum/lesson-steps.js';
import {
  lessonPhases,
  phaseOf,
  presentPhases,
} from '../features/student/curriculum/journey-phases.js';

const order = lessonPhases.map((phase) => phase.id);

// Proyección equivalente a la API: solo las preguntas de texto están disponibles (READY).
function apiLesson(source) {
  return {
    id: source.id,
    title: source.title,
    exercises: alphabet.exercises
      .filter((item) => item.lessonKey === source.id)
      .map((item) => ({
        id: item.id,
        prompt: item.prompt,
        availability: item.type.includes('TEXT') ? 'READY' : 'PENDING_MATERIAL',
      })),
    content: {
      objectives: source.objectives,
      sections: source.sections,
      practiceInstructions: source.practiceInstructions,
      letterCards: alphabet.letterCards.filter((card) => card.lessonKey === source.id),
    },
  };
}

test('las siete lecciones reales tienen IDs únicos y recorren las etapas en orden', () => {
  for (const source of alphabet.lessons) {
    const lesson = apiLesson(source);
    const steps = lessonSteps(lesson);
    const ids = steps.map((step) => step.id);
    expect(new Set(ids).size, source.id).toBe(ids.length);
    // Cada ID se encuentra en su propia posición: avanzar nunca devuelve a un paso anterior.
    ids.forEach((id, index) => expect(ids.indexOf(id)).toBe(index));
    const positions = steps.map((step) => order.indexOf(phaseOf(step)));
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
    const letters = steps.flatMap((step) => step.cards ?? []).map((card) => card.letter);
    expect(letters).toEqual(lesson.content.letterCards.map((card) => card.letter));
    const ready = lesson.exercises.filter((item) => item.availability === 'READY');
    expect(steps.filter((step) => step.type === 'question').map((step) => step.questionId)).toEqual(
      ready.map((item) => item.id),
    );
  }
});

test('un ID de pregunta que coincide con uno estructural o repetido recibe un sufijo único', () => {
  const steps = lessonSteps({
    id: 'l',
    title: 'Lección',
    exercises: ['intro', 'practice', 'q1', 'q1'].map((id) => ({
      id,
      prompt: id,
      availability: 'READY',
    })),
    content: {
      objectives: [],
      sections: [{ heading: 'Inicio', body: 'Texto.' }],
      practiceInstructions: 'Practica.',
      letterCards: [],
    },
  });
  const questions = steps.filter((step) => step.type === 'question');
  expect(questions.map((step) => step.id)).toEqual(['intro~2', 'practice~2', 'q1', 'q1~2']);
  expect(questions.map((step) => step.questionId)).toEqual(['intro', 'practice', 'q1', 'q1']);
  expect(new Set(steps.map((step) => step.id)).size).toBe(steps.length);
});

test('sin secciones de teoría se conservan recursos, letras y preguntas', () => {
  const steps = lessonSteps({
    id: 'l',
    title: 'Lección',
    exercises: [{ id: 'q1', prompt: '¿?', availability: 'READY' }],
    content: {
      objectives: [],
      sections: [],
      practiceInstructions: 'P.',
      letterCards: [{ letter: 'B' }],
    },
  });
  expect(steps.map((step) => step.type)).toEqual([
    'intro',
    'resources',
    'letters',
    'practice',
    'question',
  ]);
});

test('las etapas visibles omiten la evaluación cuando no hay preguntas disponibles', () => {
  const steps = lessonSteps(apiLesson(alphabet.lessons[1]));
  expect(presentPhases(steps).map((phase) => phase.label)).toEqual([
    'Introducción',
    'Explicación',
    'Demostración',
    'Práctica',
    'Repaso',
  ]);
  expect(phaseOf(undefined)).toBe('review');
});
