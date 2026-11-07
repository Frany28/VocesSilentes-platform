import { expect, test } from 'vitest';
import {
  captionFor,
  initialPlayer,
  playerReducer,
} from '../features/student/microclass/microclass-reducer.js';
import { microclassScenes } from '../features/student/microclass/microclass-script.js';
import { buildTimeline } from '../features/student/microclass/microclass-timeline.js';
import { lessonSteps } from '../features/student/curriculum/lesson-steps.js';

const { cues, scenes, total } = buildTimeline(microclassScenes);
const run = (state, action) => playerReducer(state, { cues, ...action });
const quizStart = scenes.find((scene) => scene.type === 'quiz').first;

test('la línea de tiempo dura entre 2 y 3 minutos y dedica una escena a cada vocal', () => {
  expect(total).toBeGreaterThanOrEqual(120);
  expect(total).toBeLessThanOrEqual(180);
  expect(scenes.filter((scene) => scene.type === 'vowel').map((scene) => scene.letter)).toEqual([
    'A',
    'E',
    'I',
    'O',
    'U',
  ]);
});

test('cada frase espera su duración mínima y el final de la narración antes de avanzar', () => {
  let state = run(initialPlayer(), { type: 'play', canSpeak: true });
  expect(state.speaking).toBe(true);
  state = run(state, { type: 'tick', seconds: cues[0].seconds });
  expect(state.index).toBe(0);
  state = run(state, { type: 'spoken', take: state.take });
  state = run(state, { type: 'tick', seconds: 0.25 });
  expect(state.index).toBe(1);
  expect(state.elapsed).toBe(0);
});

test('sin voz disponible avanza solo por tiempo y se detiene al terminar la clase', () => {
  let state = run(initialPlayer(), { type: 'go', target: cues.length - 1, canSpeak: false });
  state = run(state, { type: 'tick', seconds: cues.at(-1).seconds });
  expect(state).toMatchObject({ index: cues.length - 1, playing: false, ended: true });
});

test('la pregunta espera respuesta, da una pista al fallar y avanza al acertar', () => {
  let state = run(initialPlayer(), { type: 'go', target: quizStart, canSpeak: false });
  state = run(state, { type: 'tick', seconds: 60 });
  expect(state.index).toBe(quizStart);
  state = run(state, { type: 'answer', letter: 'A', canSpeak: false });
  expect(state.quiz.wrong).toEqual(['A']);
  expect(captionFor(state, cues[state.index])).toMatch(/Todavía no es la A/);
  state = run(state, { type: 'answer', letter: 'E', canSpeak: false });
  expect(state.index).toBe(quizStart + 1);
  expect(captionFor(state, cues[state.index])).toMatch(/^¡Correcto! Es la E/);
});

test('mostrar respuesta usa el texto de revelación y volver a la pregunta la reinicia', () => {
  let state = run(initialPlayer(), { type: 'go', target: quizStart, canSpeak: false });
  state = run(state, { type: 'answer', letter: 'O', canSpeak: false });
  state = run(state, { type: 'reveal' });
  expect(captionFor(state, cues[state.index])).toMatch(/^La respuesta es E/);
  state = run(state, { type: 'go', target: quizStart, canSpeak: false });
  expect(state.quiz).toEqual({ status: 'pending', wrong: [], hint: null });
});

test('solo la lección con tarjetas A, E, I, O, U sustituye el recurso pendiente por la microclase', () => {
  const lesson = (letters) => ({
    title: 'Lección',
    exercises: [],
    content: {
      objectives: [],
      sections: [{ heading: 'Inicio', body: 'Texto.' }],
      practiceInstructions: 'Practica.',
      letterCards: letters.map((letter) => ({ letter })),
    },
  });
  const resources = (letters) =>
    lessonSteps(lesson(letters)).find((step) => step.id === 'resources');
  expect(resources(['A', 'E', 'I', 'O', 'U'])).toMatchObject({ microclass: true });
  expect(resources(['B', 'C', 'D'])).not.toHaveProperty('microclass');
});
