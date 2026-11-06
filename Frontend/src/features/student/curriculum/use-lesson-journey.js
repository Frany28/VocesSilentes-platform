import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/use-auth.js';
import { lessonSteps } from './lesson-steps.js';
import { journeySignature, readCheckpoint, writeCheckpoint } from './journey-checkpoint.js';

/**
 * Coordina navegación recordada y completados reales, sin escribir progreso académico al avanzar por teoría.
 * @param {object} lesson Lección autorizada y resultados de API.
 * @param {string} moduleId Identificador del módulo.
 * @param {object[]} [steps] Pasos públicos versionados de una guía; por defecto se generan del contenido de API.
 * @returns {object} Paso, barra, navegación y resultados confirmados solo por el servidor.
 */
export function useLessonJourney(lesson, moduleId, steps = lessonSteps(lesson)) {
  const { user } = useAuth();
  const signature = journeySignature(steps);
  const key = `vs:lesson-journey:${user.id}:${moduleId}:${lesson.id}`;
  const [checkpoint, setCheckpoint] = useState(() => readCheckpoint(key, signature, steps));
  const [confirmed, setConfirmed] = useState({});
  const [remembered, setRemembered] = useState(true);
  const questions = lesson.exercises.map((item) => ({
    ...item,
    status: item.status === 'COMPLETED' ? item.status : (confirmed[item.id] ?? item.status),
  }));
  const state =
    checkpoint.signature === signature ? checkpoint : readCheckpoint(key, signature, steps);
  let index =
    state.position === 'summary'
      ? steps.length
      : steps.findIndex((step) => step.id === state.position);
  const blocked = steps.findIndex(
    (step, position) =>
      position < index &&
      step.type === 'question' &&
      !questions.some(
        (question) => question.id === step.questionId && question.status === 'COMPLETED',
      ),
  );
  if (blocked >= 0) index = blocked;
  const step = steps[index];
  const completed = new Set(state.completed.filter((id) => steps.some((item) => item.id === id)));
  for (const item of steps) {
    if (
      item.type === 'question' &&
      questions.some((q) => q.id === item.questionId && q.status === 'COMPLETED')
    )
      completed.add(item.id);
  }
  useEffect(() => {
    document.getElementById('student-content')?.focus();
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [index]);
  const move = (position, done = state.completed) => {
    const point = { signature, position: steps[position]?.id ?? 'summary', completed: done };
    setRemembered(writeCheckpoint(key, point));
    setCheckpoint(point);
  };
  const next = () => {
    if (!step || (step.type === 'question' && !completed.has(step.id))) return;
    move(
      index + 1,
      step.type === 'question' ? state.completed : [...new Set([...state.completed, step.id])],
    );
  };
  return {
    steps,
    step,
    index,
    questions,
    remembered,
    next,
    completed: completed.size,
    percent: Math.round((100 * completed.size) / steps.length),
    back: index > 0 ? () => move(index - 1) : undefined,
    restart: () => move(0),
    confirm: (id, status) => setConfirmed((previous) => ({ ...previous, [id]: status })),
  };
}
