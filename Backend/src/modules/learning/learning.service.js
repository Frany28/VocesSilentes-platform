import { createLearningRepository } from './learning.repository.js';
import { persistLearningProgress } from './learning.progress.js';
import { publicExercise } from './choice.public.js';
import { publicLessonContent } from './learning-content.js';
import { checkChoice } from './choice.service.js';

/**
 * Adapta contenido real al contrato visual existente sin inventar bloqueos ni actividad.
 * @param {object} database Prisma existente.
 * @param {{previewModuleId?: string}} [options] Vista previa local inyectada; no es una bandera pública de entorno.
 * @returns {object} Snapshot y mutaciones de avance manual, sin cámara ni clasificación.
 */
export function createLearningService(database, { previewModuleId } = {}) {
  const repository = createLearningRepository(database, previewModuleId);
  return {
    async snapshot(userId) {
      const modules = await repository.modules(userId);
      return {
        source: 'api',
        modules: modules.map((module, index) => {
          const preview = module.id === previewModuleId;
          const lessons = module.lessons.map(({ progress, exercises, content, ...lesson }) => ({
            ...lesson,
            status: progress[0]?.status ?? 'NOT_STARTED',
            ...(content ? { content: publicLessonContent(content), preview } : {}),
            exercises: exercises.map((exercise) => publicExercise(exercise, preview)),
          }));
          const next = lessons.find((lesson) => lesson.status !== 'COMPLETED') ?? lessons[0];
          return {
            ...module,
            ...(preview ? { preview: true } : {}),
            lessons,
            access: lessons.length ? 'available' : 'locked',
            lockReason: lessons.length ? null : 'Todavía no hay lecciones publicadas',
            illustration: ['secondary', 'tertiary', 'accent'][index % 3],
            nextLesson: next ? { ...next, position: lessons.indexOf(next) + 1 } : null,
          };
        }),
      };
    },
    progress: (userId, kind, id, status) =>
      persistLearningProgress(database, userId, kind, id, status, previewModuleId),
    answer: (userId, id, optionId) => checkChoice(database, userId, id, optionId, previewModuleId),
  };
}
