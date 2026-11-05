import { useEffect, useRef, useState } from 'react';
import { answerLearningExercise } from '../data/learning.api.js';
import { useStudent } from '../data/use-student.js';

/**
 * Comprueba una pregunta por API y mantiene su feedback hasta que el usuario decide avanzar o reintentar.
 * @param {object} question Pregunta pública actual; el consumidor remonta al cambiar su ID.
 * @param {Function} onConfirmed Recibe únicamente progreso confirmado por el backend.
 * @returns {object} Selección, feedback, cancelación y estados de transporte; no calcula aciertos.
 */
export function useLessonAssessment(question, onConfirmed) {
  const { refresh } = useStudent();
  const [selection, select] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const active = useRef(null);
  const busy = useRef(false);
  useEffect(() => () => active.current?.abort(), []);
  const retry = () => {
    select('');
    setResult(null);
    setError(null);
  };
  const submit = async () => {
    if (busy.current || !selection || question.availability !== 'READY') return;
    busy.current = true;
    setPending(true);
    setError(null);
    const controller = new AbortController();
    active.current = controller;
    try {
      const response = await answerLearningExercise(question.id, selection, controller.signal);
      if (controller.signal.aborted) return;
      setResult(response);
      onConfirmed(question.id, response.progress.status);
      refresh();
    } catch (failure) {
      if (!controller.signal.aborted)
        setError(
          failure.code === 'PENDING_MATERIAL'
            ? 'Esta pregunta necesita material visual autorizado y validado.'
            : 'No pudimos comprobar la respuesta. Revisa tu conexión y vuelve a intentarlo.',
        );
    } finally {
      if (!controller.signal.aborted) {
        busy.current = false;
        setPending(false);
      }
    }
  };
  return { selection, select, result, error, pending, submit, retry };
}
