import { useCallback, useState } from 'react';
import { useAuth } from '../../auth/use-auth.js';
import { introductionScenarios } from './introduction-lesson.js';

const VERSION = 1;
const initialProgress = () => ({ version: VERSION, explored: [] });

function readProgress(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    if (parsed?.version !== VERSION) return initialProgress();
    return {
      version: VERSION,
      explored: Array.isArray(parsed.explored)
        ? parsed.explored.filter((id) => introductionScenarios.some((item) => item.id === id))
        : [],
    };
  } catch {
    return initialProgress();
  }
}

/**
 * Conserva solo qué situaciones formativas exploró el estudiante; no guarda respuestas ni notas.
 * @param {string} moduleId Módulo real.
 * @param {string} lessonId Lección real.
 * @returns {object} Evidencia local mínima y acción de exploración.
 */
export function useIntroductionProgress(moduleId, lessonId) {
  const { user } = useAuth();
  const key = `vs:introduction-progress:${user.id}:${moduleId}:${lessonId}`;
  const [progress, setProgress] = useState(() => readProgress(key));
  const [remembered, setRemembered] = useState(true);
  const explore = useCallback(
    (id) => {
      setProgress((current) => {
        const next = { ...current, explored: [...new Set([...current.explored, id])] };
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
  return { progress, remembered, explore };
}
