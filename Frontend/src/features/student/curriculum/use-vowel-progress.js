import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../../auth/use-auth.js';
import { vowelLetters } from './vowel-lesson.js';
import { attemptMatches } from '../../../../../shared/lsv/engine/hybrid.js';

const VERSION = 1;

const emptyCamera = () => ({ visited: [], attempts: {} });
const initialProgress = () => ({
  version: VERSION,
  viewed: [],
  activities: {},
  mixed: [],
  camera: { guided: emptyCamera(), memory: emptyCamera() },
});

function readProgress(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    if (parsed?.version !== VERSION) return initialProgress();
    return {
      ...initialProgress(),
      ...parsed,
      viewed: parsed.viewed?.filter((letter) => vowelLetters.includes(letter)) ?? [],
      activities: parsed.activities ?? {},
      mixed: Array.isArray(parsed.mixed) ? parsed.mixed : [],
      camera: {
        guided: { ...emptyCamera(), ...parsed.camera?.guided },
        memory: { ...emptyCamera(), ...parsed.camera?.memory },
      },
    };
  } catch {
    return initialProgress();
  }
}

/**
 * Recuerda evidencia formativa mínima por estudiante y lección en este dispositivo. Nunca almacena
 * imágenes, landmarks, secuencias, confianza ni una calificación de LSV.
 * @param {string} moduleId Módulo real de la API.
 * @param {string} lessonId Lección real de la API.
 * @returns {object} Estado y acciones diferenciadas para lectura, actividades e intentos.
 */
export function useVowelProgress(moduleId, lessonId) {
  const { user } = useAuth();
  const key = `vs:vowel-progress:${user.id}:${moduleId}:${lessonId}`;
  const [progress, setProgress] = useState(() => readProgress(key));
  const [remembered, setRemembered] = useState(true);
  const update = useCallback(
    (change) => {
      setProgress((current) => {
        const next = change(current);
        try {
          localStorage.setItem(key, JSON.stringify(next));
          setRemembered(true);
        } catch {
          setRemembered(false);
        }
        return next;
      });
    },
    [key],
  );
  const markViewed = useCallback(
    (letter) =>
      update((current) => ({
        ...current,
        viewed: [...new Set([...current.viewed, letter])],
      })),
    [update],
  );
  const recordAnswer = useCallback(
    (activity, letter, correct) =>
      update((current) => {
        const previous = current.activities[activity]?.answers?.[letter] ?? {
          attempts: 0,
          correct: false,
        };
        return {
          ...current,
          activities: {
            ...current.activities,
            [activity]: {
              answers: {
                ...(current.activities[activity]?.answers ?? {}),
                [letter]: {
                  attempts: previous.attempts + 1,
                  correct: previous.correct || correct,
                },
              },
            },
          },
        };
      }),
    [update],
  );
  const resetActivity = useCallback(
    (activity) =>
      update((current) => ({
        ...current,
        activities: { ...current.activities, [activity]: { answers: {} } },
      })),
    [update],
  );
  const visitCamera = useCallback(
    (mode, letter) =>
      update((current) => ({
        ...current,
        camera: {
          ...current.camera,
          [mode]: {
            ...current.camera[mode],
            visited: [...new Set([...current.camera[mode].visited, letter])],
          },
        },
      })),
    [update],
  );
  const recordCamera = useCallback(
    (mode, letter, result) =>
      update((current) => {
        const previous = current.camera[mode].attempts[letter] ?? {
          total: 0,
          matches: 0,
          uncertain: 0,
        };
        // Con evidencia geométrica, la geometría puede vetar una coincidencia del modelo.
        const match = attemptMatches(result, letter);
        return {
          ...current,
          camera: {
            ...current.camera,
            [mode]: {
              ...current.camera[mode],
              attempts: {
                ...current.camera[mode].attempts,
                [letter]: {
                  total: previous.total + 1,
                  matches: previous.matches + (match ? 1 : 0),
                  uncertain: previous.uncertain + (match ? 0 : 1),
                },
              },
            },
          },
        };
      }),
    [update],
  );
  const completeMixed = useCallback(
    (id) => update((current) => ({ ...current, mixed: [...new Set([...current.mixed, id])] })),
    [update],
  );
  const completedActivities = useMemo(
    () =>
      Object.values(progress.activities).filter((activity) =>
        vowelLetters.every((letter) => activity.answers?.[letter]?.correct),
      ).length,
    [progress.activities],
  );
  return {
    progress,
    remembered,
    completedActivities,
    markViewed,
    recordAnswer,
    resetActivity,
    visitCamera,
    recordCamera,
    completeMixed,
  };
}
