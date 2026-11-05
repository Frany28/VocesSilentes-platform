import { useEffect, useRef, useState } from 'react';
import { answerLearningExercise } from '../data/learning.api.js';
import { useStudent } from '../data/use-student.js';

/**
 * Coordina preguntas y resultados reales; conserva la selección ante fallo y cancela transporte al salir.
 * @param {object} lesson Lección autorizada y sus ejercicios con estado propio.
 * @returns {object} Selección, operación y navegación locales; las claves y la corrección permanecen en el backend.
 */
export function useLessonAssessment(lesson) {
  const { refresh } = useStudent();
  const [index, setIndex] = useState(0);
  const [selection, select] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [updates, setUpdates] = useState({});
  const active = useRef(null);
  const busy = useRef(false);
  useEffect(() => () => active.current?.abort(), []);
  const questions = lesson.exercises
    .filter((item) => item.type?.startsWith('MULTIPLE_CHOICE'))
    .map((item) => ({
      ...item,
      status: item.status === 'COMPLETED' ? item.status : (updates[item.id] ?? item.status),
    }));
  const question = questions[index];
  const go = (next) => {
    if (busy.current) return;
    select('');
    setResult(null);
    setError(null);
    setIndex(next);
  };
  const submit = async () => {
    if (busy.current || !selection || question?.availability !== 'READY') return;
    busy.current = true;
    setPending(true);
    setError(null);
    const controller = new AbortController();
    active.current = controller;
    try {
      const response = await answerLearningExercise(question.id, selection, controller.signal);
      if (controller.signal.aborted) return;
      setResult(response);
      setUpdates((previous) => ({ ...previous, [question.id]: response.progress.status }));
      refresh();
    } catch (failure) {
      if (!controller.signal.aborted)
        setError(
          failure.code === 'PENDING_MATERIAL'
            ? 'La pregunta necesita material visual autorizado y validado.'
            : 'No pudimos comprobar la respuesta. Revisa tu conexión y vuelve a intentarlo.',
        );
    } finally {
      if (!controller.signal.aborted) {
        busy.current = false;
        setPending(false);
      }
    }
  };
  return {
    questions,
    question,
    index,
    selection,
    select,
    result,
    error,
    pending,
    submit,
    go,
    next: () => go(index + 1),
    retry: () => go(index),
  };
}
