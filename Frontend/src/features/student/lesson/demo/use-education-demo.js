import { useState } from 'react';
import { demoViews } from './education-demo-data.js';

/**
 * Coordina estados visuales en memoria. La retroalimentación se elige por control, no por respuesta.
 * @returns {object} Vista, selección y acciones locales; no llama servicios ni persiste intentos.
 */
export function useEducationDemo() {
  const [view, setView] = useState('content');
  const [selection, select] = useState('');
  const [outcome, setOutcome] = useState('correct');
  const [exercise, setExercise] = useState('visual');
  const show = (next) => {
    if (!Object.hasOwn(demoViews, next)) return;
    select('');
    if (next === 'choice' || next === 'visual') setExercise(next);
    if (next === 'correct' || next === 'incorrect') setExercise('visual');
    setView(next);
  };
  return {
    view,
    selection,
    select,
    outcome,
    exercise,
    setOutcome,
    show,
    check: () => {
      if (selection) setView(outcome);
    },
    continue: () => show(exercise === 'choice' ? 'visual' : 'result'),
    retry: () => show(exercise),
  };
}
